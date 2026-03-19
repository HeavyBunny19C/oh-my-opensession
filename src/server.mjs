import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getConfig } from "./config.mjs";
import {
  getDb,
  getMessages,
  getParts,
  getSession,
  getStats,
  getTodos,
  listSessions,
  searchMessages,
  getTokenStats,
  getModelDistribution,
  getDailySessionCounts,
  getSessionsByIds
} from "./db.mjs";
import { setLocale, getLocale } from "./i18n.mjs";
import {
  toggleStar,
  renameSession,
  softDelete,
  restoreSession,
  permanentDelete,
  batchAction,
  getMeta,
  getDeletedIds,
  getAllMeta,
  getExcludedIds
} from "./meta.mjs";
import { renderSessionPage } from "./views/session.mjs";
import { renderSessionsPage } from "./views/sessions.mjs";
import { renderStatsPage } from "./views/stats.mjs";
import { renderTrashPage } from "./views/trash.mjs";

const staticDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "static");

function injectLocaleScript(body, contentType) {
  if (typeof body !== "string" || !contentType.startsWith("text/html")) {
    return body;
  }

  const localeScript = `<script>window.__LOCALE__=${JSON.stringify(getLocale())}</script>`;
  return body.includes("</head>")
    ? body.replace("</head>", `  ${localeScript}\n</head>`)
    : body;
}

function send(res, status, body, contentType = "text/html; charset=utf-8") {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(injectLocaleScript(body, contentType));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function safeJsonParse(value) {
  if (typeof value !== "string") {
    return value || {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function enrichSession(session, metaMap) {
  if (!session) {
    return session;
  }

  const meta = metaMap.get(session.id);
  return {
    ...session,
    starred: Boolean(meta?.starred),
    title: meta?.custom_title || session.title
  };
}

function enrichSessionList(sessions, metaMap, excludedIds) {
  return sessions
    .filter((session) => !excludedIds.has(session.id))
    .map((session) => enrichSession(session, metaMap));
}

function getSearchResults(query, limit, offset) {
  const term = (query || "").trim();
  if (!term) {
    return { sessions: [], total: 0, note: "Enter a search query to find sessions." };
  }

  const titleMatches = listSessions(1000, 0, term).sessions;
  const contentMatches = searchMessages(term, 500);
  const orderedIds = [];
  const sessionMap = new Map();

  for (const session of titleMatches) {
    if (!sessionMap.has(session.id)) {
      orderedIds.push(session.id);
      sessionMap.set(session.id, session);
    }
  }

  for (const match of contentMatches) {
    if (!sessionMap.has(match.sessionId)) {
      const session = getSession(match.sessionId);
      if (session) {
        orderedIds.push(session.id);
        sessionMap.set(session.id, session);
      }
    }
  }

  return {
    sessions: orderedIds.slice(offset, offset + limit).map((id) => sessionMap.get(id)).filter(Boolean),
    total: orderedIds.length,
    note: `Showing title and message-content matches for “${term}”.`
  };
}

function loadPartsByMessage(messages) {
  const map = new Map();
  for (const message of messages) {
    map.set(
      message.id,
      getParts(message.id).map((part) => ({
        ...part,
        data: safeJsonParse(part.data)
      }))
    );
  }
  return map;
}

function serveStatic(reqPath, res) {
  const relativePath = reqPath.replace(/^\/static\//, "");
  const filePath = path.join(staticDir, relativePath);
  const contentType = filePath.endsWith(".css")
    ? "text/css; charset=utf-8"
    : filePath.endsWith(".js")
      ? "application/javascript; charset=utf-8"
      : "application/octet-stream";

  try {
    const body = readFileSync(filePath);
    send(res, 200, body, contentType);
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
}

function renderMarkdownExport(session, messages, partsByMessage) {
  const title = session.title || session.slug || session.id;
  const lines = [
    `# ${title}`,
    "",
    `Created: ${new Date(Number(session.time_created) || Date.now()).toLocaleString()}`,
    `Updated: ${new Date(Number(session.time_updated) || Date.now()).toLocaleString()}`,
    "",
    "---",
    ""
  ];

  for (const msg of messages) {
    const role = msg.data?.role || "unknown";
    const parts = partsByMessage.get(msg.id) || [];
    for (const part of parts) {
      const partData = part.data;
      if (partData?.type === "text" && partData.text) {
        lines.push(`## ${role}`, "", partData.text, "");
      } else if (partData?.type === "tool") {
        lines.push(`### Tool Call: ${partData.tool || "unknown"}`, "");
        if (partData.state?.input) {
          lines.push(
            "Input:",
            "```",
            typeof partData.state.input === "string" ? partData.state.input : JSON.stringify(partData.state.input, null, 2),
            "```",
            ""
          );
        }
        if (partData.state?.output) {
          lines.push(
            "Output:",
            "```",
            typeof partData.state.output === "string" ? partData.state.output : JSON.stringify(partData.state.output, null, 2),
            "```",
            ""
          );
        }
      }
    }
  }

  return lines.join("\n");
}

export function startServer(config = getConfig()) {
  const appConfig = config ?? getConfig();
  setLocale(appConfig.lang);
  const PORT = appConfig.port;

  const requestHandler = async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);
    const pathname = url.pathname;
    const limit = 30;
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);

    const sessionApiMatch = pathname.match(/^\/api\/session\/([^/]+)\/(star|rename|delete|restore|permanent-delete)$/);
    if (req.method === "POST" && sessionApiMatch) {
      const id = decodeURIComponent(sessionApiMatch[1]);
      const action = sessionApiMatch[2];
      try {
        if (action === "star") {
          const starred = toggleStar(id);
          return json(res, { ok: true, starred });
        }
        if (action === "rename") {
          const body = await readBody(req);
          renameSession(id, body.title || "");
          return json(res, { ok: true });
        }
        if (action === "delete") {
          softDelete(id);
          return json(res, { ok: true });
        }
        if (action === "restore") {
          restoreSession(id);
          return json(res, { ok: true });
        }
        if (action === "permanent-delete") {
          permanentDelete(id);
          return json(res, { ok: true });
        }
      } catch (error) {
        return json(res, { ok: false, error: error.message }, 500);
      }
    }

    if (req.method === "POST" && pathname === "/api/batch") {
      try {
        const body = await readBody(req);
        const ids = Array.isArray(body.ids) ? body.ids : [];
        const validActions = ["delete", "star", "unstar", "restore", "permanent-delete"];
        if (!validActions.includes(body.action)) {
          return json(res, { ok: false, error: "Invalid action" }, 400);
        }
        const affected = batchAction(ids, body.action);
        return json(res, { ok: true, affected });
      } catch (error) {
        return json(res, { ok: false, error: error.message }, 500);
      }
    }

    if (req.method !== "GET") {
      send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
      return;
    }

    if (pathname === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (pathname.startsWith("/static/")) {
      serveStatic(pathname, res);
      return;
    }

    if (pathname === "/api/stats") {
      send(res, 200, JSON.stringify(getStats(), null, 2), "application/json; charset=utf-8");
      return;
    }

    const exportMatch = pathname.match(/^\/api\/session\/([^/]+)\/export$/);
    if (exportMatch) {
      const id = decodeURIComponent(exportMatch[1]);
      const format = url.searchParams.get("format") || "md";
      const session = getSession(id);
      if (!session) {
        return json(res, { ok: false, error: "Not found" }, 404);
      }

      const metaMap = getAllMeta();
      const enrichedSession = enrichSession(session, metaMap);
      const messages = getMessages(id).map((message) => ({ ...message, data: safeJsonParse(message.data) }));
      const partsByMessage = loadPartsByMessage(messages);

      if (format === "json") {
        const filename = `session-${id.slice(0, 8)}.json`;
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`
        });
        return res.end(JSON.stringify({
          session: enrichedSession,
          messages: messages.map((message) => ({
            ...message,
            parts: (partsByMessage.get(message.id) || []).map((part) => part.data)
          }))
        }, null, 2));
      }

      const md = renderMarkdownExport(enrichedSession, messages, partsByMessage);
      const filename = `session-${id.slice(0, 8)}.md`;
      res.writeHead(200, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      });
      return res.end(md);
    }

    if (pathname === "/stats") {
      const tokenStats = getTokenStats(30);
      const modelDistribution = getModelDistribution();
      const dailySessions = getDailySessionCounts(30);
      const overview = getStats();
      send(res, 200, renderStatsPage({ tokenStats, modelDistribution, dailySessions, overview }));
      return;
    }

    if (pathname === "/api/sessions") {
      const apiLimit = Math.min(Math.max(1, Number(url.searchParams.get("limit")) || 30), 100);
      const apiOffset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
      const range = url.searchParams.get("range") || "";
      const query = url.searchParams.get("q") || "";
      const metaMap = getAllMeta();
      const excludedIds = getExcludedIds();

      let sessions, total;
      if (query) {
        const results = getSearchResults(query, apiLimit, apiOffset);
        sessions = enrichSessionList(results.sessions, metaMap, excludedIds);
        total = results.total;
      } else {
        const results = listSessions(apiLimit, apiOffset, "", range);
        sessions = enrichSessionList(results.sessions, metaMap, excludedIds);
        total = results.total;
      }

      return json(res, {
        sessions: sessions.map((s) => ({
          id: s.id,
          title: s.title || s.slug || s.id,
          directory: s.directory || "",
          time_updated: Number(s.time_updated) || 0,
          summary_files: Number(s.summary_files) || 0,
          summary_additions: Number(s.summary_additions) || 0,
          summary_deletions: Number(s.summary_deletions) || 0,
          starred: Boolean(s.starred)
        })),
        total,
        offset: apiOffset,
        hasMore: apiOffset + sessions.length < total
      });
    }

    if (pathname === "/") {
      const range = url.searchParams.get("range") || "";
      const { sessions, total } = listSessions(limit, offset, "", range);
      const metaMap = getAllMeta();
      const excludedIds = getExcludedIds();
      const enrichedSessions = enrichSessionList(sessions, metaMap, excludedIds);
      const overviewStats = getStats();
      const deletedCount = getDeletedIds().length;
      send(res, 200, renderSessionsPage({
        sessions: enrichedSessions,
        total,
        limit,
        offset,
        range,
        totalMessages: overviewStats.totalMessages,
        deletedCount
      }));
      return;
    }

    if (pathname === "/search") {
      const query = url.searchParams.get("q") || "";
      const results = getSearchResults(query, limit, offset);
      const metaMap = getAllMeta();
      const excludedIds = getExcludedIds();
      const enrichedSessions = enrichSessionList(results.sessions, metaMap, excludedIds);
      send(res, 200, renderSessionsPage({ ...results, sessions: enrichedSessions, limit, offset, query }));
      return;
    }

    if (pathname === "/trash") {
      const deletedIds = getDeletedIds();
      const sessions = getSessionsByIds(deletedIds);
      const metaMap = getAllMeta();
      const enriched = sessions.map((session) => enrichSession(session, metaMap));
      send(res, 200, renderTrashPage({ sessions: enriched }));
      return;
    }

    if (pathname.startsWith("/session/")) {
      const sessionId = decodeURIComponent(pathname.slice("/session/".length));
      const session = getSession(sessionId);

      if (!session) {
        send(res, 404, "<h1>Session not found</h1>");
        return;
      }

      const meta = getMeta(sessionId);
      const metaMap = getAllMeta();
      const excludedIds = getExcludedIds();
      const enrichedSession = enrichSession(session, metaMap);
      const messages = getMessages(sessionId).map((message) => ({
        ...message,
        data: safeJsonParse(message.data)
      }));
      const partsByMessage = loadPartsByMessage(messages);
      const todos = getTodos(sessionId);
      const { sessions: recentSessions } = listSessions(30, 0);
      const enrichedRecentSessions = enrichSessionList(recentSessions, metaMap, excludedIds);
      send(res, 200, renderSessionPage({
        session: enrichedSession,
        messages,
        partsByMessage,
        todos,
        recentSessions: enrichedRecentSessions,
        meta
      }));
      return;
    }

    send(res, 404, "<h1>Not found</h1>");
  };

  try {
    getDb();
    const stats = getStats();
    const server = createServer(requestHandler);
    server.listen(PORT, () => {
      console.log(`oh-my-opensession running at http://localhost:${PORT}`);
      console.log(`Language: ${getLocale()}`);
      console.log(`DB: ${appConfig.dbPath}`);
      console.log(`${stats.totalSessions} sessions, ${stats.totalMessages} messages.`);
    });

    if (appConfig.open) {
      const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
      import("node:child_process").then((cp) => cp.exec(`${cmd} http://localhost:${PORT}`));
    }
  } catch (error) {
    console.error("Failed to start:", error.message);
    process.exit(1);
  }
}
