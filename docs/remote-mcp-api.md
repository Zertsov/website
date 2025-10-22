# Remote MCP Demo API

This project now exposes a tiny JSON API and a matching set of MCP-aware endpoints that are handy when writing about remote Model Context Protocol servers. The routes live under `app/api` and are safe to call without any authentication.

## Quick reference

| Route | Method | Purpose |
| ----- | ------ | ------- |
| `/api/remote-example` | `GET` | Fetch seeded guide data used in the blog narrative. |
| `/api/remote-example` | `POST` | Build a short planning checklist for a provided topic. |
| `/api/mcp/tools` | `GET` | List Tool descriptors that adhere to the MCP schema. |
| `/api/mcp/run` | `POST` | Invoke a tool and receive MCP-compatible content. |
| `/api/articles` | `GET` | List all available articles with metadata. |
| `/api/articles/[slug]` | `GET` | Get a specific article as markdown by slug. |

## JSON example

```bash
curl http://localhost:3000/api/remote-example
```

Sample response:

```json
{
  "message": "Reference data for remote MCP walkthroughs.",
  "guides": [
    {
      "id": "getting-started",
      "title": "Getting started with remote MCP servers",
      "synopsis": "Understand the handshake, connection requirements, and practical deployment options.",
      "tags": ["overview", "setup"]
    }
  ],
  "latestUpdate": "getting-started"
}
```

## MCP tool discovery

Listing available tools:

```bash
curl http://localhost:3000/api/mcp/tools
```

Invoking the `current-time` tool with custom formatting:

```bash
curl -X POST http://localhost:3000/api/mcp/run \
  -H 'Content-Type: application/json' \
  -d '{"tool":"current-time","arguments":{"locale":"en-GB","timeZone":"UTC"}}'
```

Example success response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Friday, 20 December 2024 at 18:42:11 UTC"
    }
  ]
}
```

Error responses set `isError: true` and use HTTP status `400`, which mirrors the contract expected by remote MCP clients.

## Articles API

List all available articles:

```bash
curl http://localhost:3000/api/articles
```

Sample response:

```json
{
  "articles": [
    {
      "slug": "ai/agents-and-tools",
      "author": "Mitch Vostrez",
      "date": "2025-07-06",
      "title": "Understanding AI Agents and Their Tools",
      "description": "Clarify how AI agents decide what to do and the role tools play in executing their plans.",
      "tags": ["ai", "agents", "tools"]
    }
  ],
  "count": 1
}
```

Get a specific article as markdown:

```bash
curl http://localhost:3000/api/articles/ai/agents-and-tools
```

Sample response:

```json
{
  "slug": "ai/agents-and-tools",
  "markdown": "# Agents and Tools: Building Blocks of Modern AI Workflows\n\nAI conversations often mix up...",
  "format": "markdown"
}
```

Error responses for missing articles return HTTP status `404` with an error message.
