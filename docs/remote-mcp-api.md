# Remote MCP Demo API

This project now exposes a tiny JSON API and a matching set of MCP-aware endpoints that are handy when writing about remote Model Context Protocol servers. The routes live under `app/api` and are safe to call without any authentication.

## Quick reference

| Route | Method | Purpose |
| ----- | ------ | ------- |
| `/api/remote-example` | `GET` | Fetch seeded guide data used in the blog narrative. |
| `/api/remote-example` | `POST` | Build a short planning checklist for a provided topic. |
| `/api/mcp/tools` | `GET` | List Tool descriptors that adhere to the MCP schema. |
| `/api/mcp/run` | `POST` | Invoke a tool and receive MCP-compatible content. |

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
