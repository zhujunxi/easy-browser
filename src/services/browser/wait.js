/**
 * Wait Function and Tool Definition
 */

const wait = {
  call: async ({ seconds = 30 }) => {
    try {
      if (!seconds || seconds <= 0) {
        throw new Error('invalid seconds')
      }

      await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
      return `has been delayed for ${seconds} seconds.`
    } catch (error) {
      return error.message
    }
  },
  // 工具定义
  tool: {
    type: 'function',
    function: {
      name: 'wait',
      description:
        'Execute waiting operations, such as the user needs to wait 30 seconds before operating again.',
      parameters: {
        type: 'object',
        properties: {
          seconds: {
            type: 'integer',
            description: 'The number of seconds to wait. The default value is 30',
          },
        },
        required: ['seconds'],
      },
    },
  },
}

export default wait
