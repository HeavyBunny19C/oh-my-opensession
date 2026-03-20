// src/providers/interface.mjs
// Runtime: no exports. This file is JSDoc-only documentation for the adapter shape.

/**
 * Lightweight session metadata for the index.
 * @typedef {Object} RawSession
 * @property {string} id - Original session ID from provider
 * @property {string} provider - "opencode" | "claude-code" | "codex" | "gemini"
 * @property {string|null} parentId - Parent session ID (future: knowledge graph)
 * @property {string|null} title - Session title if available
 * @property {string|null} directory - Working directory / project path
 * @property {number} timeCreated - Unix timestamp in ms
 * @property {number} timeUpdated - Unix timestamp in ms
 * @property {number} messageCount - Total message count
 * @property {number|null} tokenCount - Total tokens if trackable, null otherwise
 */

/**
 * Full message content for session detail.
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} sessionId
 * @property {"user"|"assistant"|"system"|"tool"} role
 * @property {string} content - Plain text extracted by provider
 * @property {string|null} thinking - Model reasoning/thinking if available
 * @property {string|null} toolName
 * @property {object|null} toolInput
 * @property {object|null} toolOutput
 * @property {number} timestamp - Unix ms
 * @property {{input: number, output: number}|null} tokens
 * @property {object|null} metadata - Provider-specific rich data preserved as-is
 */

/**
 * Daily token statistics.
 * @typedef {Object} DailyTokenStat
 * @property {string} day - "YYYY-MM-DD"
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} totalTokens
 * @property {number} messageCount
 */

/**
 * Search result entry.
 * @typedef {Object} SearchResult
 * @property {string} sessionId
 * @property {string} messageId
 * @property {string} role
 * @property {string} snippet - Context around match
 * @property {number} timestamp
 */

/**
 * Provider adapter interface.
 * Each provider directory exports a default object matching this shape.
 *
 * @typedef {Object} ProviderAdapter
 * @property {string} id - Unique ID used in DB index and URL routing
 * @property {string} name - Display name for UI
 * @property {string} icon - Emoji or SVG reference for tab
 * @property {() => boolean} detect - Is this tool installed?
 * @property {() => string|null} getDataPath - Root path to session data
 * @property {() => AsyncIterable<RawSession>} scan - Stream all session metadata
 * @property {(sessionId: string) => object|null} getSession - Session detail
 * @property {(sessionId: string) => Message[]} getMessages - Full messages
 * @property {(days: number) => DailyTokenStat[]} getTokenStats - Token statistics
 * @property {(query: string, limit: number) => SearchResult[]} searchMessages - Search
 * @property {(sessionId: string) => object|null} exportSession - Reserved for future (returns null in v1)
 */
