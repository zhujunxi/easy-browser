/**
 * User Confirm Function and Tool Definition
 */

let resolveCallback = null
let rejectCallback = null

const userConfirm = {
  call: async ({ reason }) => {
    return new Promise((resolve, reject) => {
      resolveCallback = resolve
      rejectCallback = reject
    })
  },
  confirmComplete: () => {
    if (resolveCallback) {
      resolveCallback(`User confirmation completed.`)
      resolveCallback = null
    }
  },
  confirmCancel: () => {
    if (rejectCallback) {
      rejectCallback(`User refuses.`)
      rejectCallback = null
    }
  },
  // Tool Definition
  tool: {
    type: 'function',
    function: {
      name: 'userConfirm',
      description:
        'When users are required to perform certain operations (such as logging in, entering sensitive information, etc.), the process is paused and waits for user confirmation',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description:
              'The reason why user confirmation is required or a description of the action that needs to be performed',
          },
        },
        required: ['reason'],
      },
    },
  },
}
export default userConfirm
