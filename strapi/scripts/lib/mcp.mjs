/**
 * Minimal client for the Strapi MCP server (Streamable HTTP, stateless).
 * Docs: https://docs.strapi.io/cms/features/strapi-mcp-server
 *
 * Every call is a JSON-RPC POST to /mcp authenticated with an Admin token.
 * Responses may be plain JSON or a single Server-Sent Event, both are handled.
 */
export function createMcpClient({ url, token }) {
  let nextId = 1;

  async function rpc(method, params = {}) {
    const res = await fetch(`${url.replace(/\/+$/, '')}/mcp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`MCP ${method} failed: ${res.status} ${text}`);
    const payload = res.headers.get('content-type')?.includes('text/event-stream')
      ? text
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => JSON.parse(line.slice(5)))
          .find((msg) => msg.id !== undefined)
      : JSON.parse(text);
    if (payload.error) throw new Error(`MCP ${method} error: ${JSON.stringify(payload.error)}`);
    return payload.result;
  }

  /** Calls a tool and returns its parsed result (structuredContent, or JSON text content). */
  async function callTool(name, args = {}) {
    const result = await rpc('tools/call', { name, arguments: args });
    if (result.isError) {
      const message = result.content?.map((c) => c.text).join('\n');
      throw new Error(`MCP tool ${name} failed: ${message}`);
    }
    if (result.structuredContent) return result.structuredContent;
    const text = result.content?.find((c) => c.type === 'text')?.text;
    try {
      return text ? JSON.parse(text) : result;
    } catch {
      return text;
    }
  }

  return {
    initialize: () =>
      rpc('initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'pixelrich-seed', version: '1.0.0' },
      }),
    listTools: async () => (await rpc('tools/list')).tools,
    callTool,
  };
}
