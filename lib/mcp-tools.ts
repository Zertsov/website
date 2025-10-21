type JsonSchema = {
  type: 'object'
  description?: string
  properties: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean'
      description?: string
      enum?: string[]
    }
  >
  required?: string[]
}

export type McpTool = {
  name: string
  description: string
  inputSchema: JsonSchema
}

type ToolInvocationResult = {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

export type ToolInvocation = {
  tool: string
  arguments?: Record<string, unknown>
}

type ToolHandler = (
  args: Record<string, unknown>
) => Promise<ToolInvocationResult> | ToolInvocationResult

const tools: McpTool[] = [
  {
    name: 'echo',
    description:
      'Echo back a provided message. Useful for connectivity tests and verifying round trips.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The text to return verbatim.',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'current-time',
    description:
      'Return the current date and time, optionally formatted for a specific locale or time zone.',
    inputSchema: {
      type: 'object',
      properties: {
        locale: {
          type: 'string',
          description:
            'Optional BCP 47 locale string (for example "en-US" or "fr-FR").',
        },
        timeZone: {
          type: 'string',
          description:
            'Optional IANA time zone identifier (for example "UTC" or "America/New_York").',
        },
      },
    },
  },
  {
    name: 'summarize-topic',
    description:
      'Generate a short bullet-point overview for a topic to seed MCP responses.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The subject to summarize in a few bullet points.',
        },
      },
      required: ['topic'],
    },
  },
]

const toolHandlers: Record<string, ToolHandler> = {
  echo: async (args) => {
    const message = expectString(args.message, 'message')
    return {
      content: [{ type: 'text', text: message }],
    }
  },
  'current-time': (args) => {
    const localeRaw = args.locale
    const timeZoneRaw = args.timeZone
    const locale =
      localeRaw === undefined ? undefined : expectString(localeRaw, 'locale')
    const timeZone =
      timeZoneRaw === undefined
        ? undefined
        : expectString(timeZoneRaw, 'timeZone')

    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    return {
      content: [
        {
          type: 'text',
          text: formatter.format(new Date()),
        },
      ],
    }
  },
  'summarize-topic': (args) => {
    const topic = expectString(args.topic, 'topic')
    const summary = [
      `• core idea: ${titleCase(topic)} overview ready for expansion`,
      '• include one practical example',
      '• highlight why it matters to remote MCP clients',
    ].join('\n')

    return {
      content: [{ type: 'text', text: summary }],
    }
  },
}

export function listTools(): McpTool[] {
  return tools
}

export async function invokeTool(
  invocation: ToolInvocation
): Promise<ToolInvocationResult> {
  const handler = toolHandlers[invocation.tool]
  if (!handler) {
    return {
      content: [
        {
          type: 'text',
          text: `Unknown tool "${invocation.tool}".`,
        },
      ],
      isError: true,
    }
  }

  try {
    const args = invocation.arguments ?? {}
    if (!isPlainObject(args)) {
      throw new Error('Expected "arguments" to be an object.')
    }
    return await handler(args)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected tool failure.'
    return {
      content: [{ type: 'text', text: message }],
      isError: true,
    }
  }
}

function expectString(value: unknown, key: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Expected "${key}" to be a non-empty string.`)
  }
  return value
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (segment) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
  })
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && Object.getPrototypeOf(value) === Object.prototype
}