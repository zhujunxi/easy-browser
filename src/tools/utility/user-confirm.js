let resolveCallback = null
let rejectCallback = null

const userConfirm = {
  call: async () => {
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

  tool: {
    type: 'function',
    function: {
      name: 'userConfirm',
      description: 'Pause and wait for user confirmation',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Description of action requiring user confirmation',
          },
        },
        required: ['reason'],
      },
    },
  },
}

export default userConfirm
