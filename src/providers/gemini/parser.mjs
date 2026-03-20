import { readFileSync } from "node:fs";

/**
 * Parse a Gemini CLI JSON session file.
 * @param {string} filePath
 * @returns {object} ConversationRecord
 */
export function parseSession(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

/**
 * Extract session metadata.
 * @param {object} data - ConversationRecord
 * @returns {import('../interface.mjs').RawSession}
 */
export function extractMeta(data) {
  const messages = data.messages || [];
  let totalTokens = 0;
  let messageCount = 0;
  const firstUserMsg = messages.find((m) => m.type === "user");

  for (const m of messages) {
    if (m.type === "user" || m.type === "gemini") messageCount++;
    if (m.tokenUsage?.total) totalTokens += m.tokenUsage.total;
  }

  return {
    id: data.sessionId || "",
    provider: "gemini",
    parentId: null,
    title: firstUserMsg?.text?.slice(0, 80) || null, // Use first user prompt as title
    directory: null, // Gemini doesn't store CWD in session
    timeCreated: data.startTime ? new Date(data.startTime).getTime() : 0,
    timeUpdated: data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0,
    messageCount,
    tokenCount: totalTokens || null
  };
}

/**
 * Convert session data to unified Message[] format.
 * @param {object} data - ConversationRecord
 * @param {string} sessionId
 * @returns {import('../interface.mjs').Message[]}
 */
export function dataToMessages(data, sessionId) {
  const messages = [];
  let idx = 0;

  for (const m of data.messages || []) {
    const ts = m.timestamp ? new Date(m.timestamp).getTime() : 0;

    if (m.type === "user") {
      messages.push({
        id: m.id || `msg-${idx++}`,
        sessionId,
        role: "user",
        content: m.text || "",
        thinking: null,
        toolName: null,
        toolInput: null,
        toolOutput: null,
        timestamp: ts,
        tokens: m.tokenUsage ? { input: m.tokenUsage.input || 0, output: m.tokenUsage.output || 0 } : null,
        metadata: null
      });
    }

    if (m.type === "gemini") {
      messages.push({
        id: m.id || `msg-${idx++}`,
        sessionId,
        role: "assistant",
        content: m.text || "",
        thinking: null,
        toolName: null,
        toolInput: null,
        toolOutput: null,
        timestamp: ts,
        tokens: m.tokenUsage ? { input: m.tokenUsage.input || 0, output: m.tokenUsage.output || 0 } : null,
        metadata: {
          cached: m.tokenUsage?.cached || 0,
          thoughts: m.tokenUsage?.thoughts || 0,
          tool: m.tokenUsage?.tool || 0
        }
      });

      // Extract tool calls from this message
      if (m.toolCalls) {
        for (const tc of m.toolCalls) {
          messages.push({
            id: tc.id || `tool-${idx++}`,
            sessionId,
            role: "tool",
            content: tc.result ? (typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result)) : "",
            thinking: null,
            toolName: tc.name || "unknown",
            toolInput: tc.args || null,
            toolOutput: tc.result || null,
            timestamp: ts,
            tokens: null,
            metadata: { status: tc.status }
          });
        }
      }
    }

    // Info/error/warning messages
    if (m.type === "info" || m.type === "error" || m.type === "warning") {
      messages.push({
        id: m.id || `msg-${idx++}`,
        sessionId,
        role: "system",
        content: m.text || "",
        thinking: null,
        toolName: null,
        toolInput: null,
        toolOutput: null,
        timestamp: ts,
        tokens: null,
        metadata: { type: m.type }
      });
    }
  }

  return messages;
}
