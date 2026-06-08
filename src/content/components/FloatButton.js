class FloatButton {
  constructor() {
    this.button = null
    this.throttled = false
    this.init()
  }

  async init() {
    this.button = this._createButton()
    this._bindDelegatedEvents()
    this._startHealthCheck()
    this._listenForMessages()

    try {
      const result = await this._getStorageData('floatBtn')
      if (result.floatBtn === false) {
        this.hide()
      } else {
        this.show()
      }

      this._listenForStorageChanges()
    } catch {
      this.hide()
    }
  }

  _createButton() {
    const toggleButton = document.createElement('div')

    const icon = document.createElement('img')
    icon.src = chrome.runtime.getURL('assets/logo/logo.png')
    icon.classList.add('easy-browser-float-btn-icon')

    toggleButton.appendChild(icon)
    toggleButton.classList.add('easy-browser-float-btn')

    if (document.body) {
      document.body.appendChild(toggleButton)
    }
    return toggleButton
  }

  _ensureButton() {
    if (!this.button || !this.button.isConnected) {
      this.button = this._createButton()
    }
  }

  _bindDelegatedEvents() {
    document.addEventListener(
      'click',
      (e) => {
        if (!e.target.closest('.easy-browser-float-btn')) return
        e.stopPropagation()
        if (this.throttled) return
        this.throttled = true
        this._clickFeedback()
        setTimeout(() => {
          this.throttled = false
        }, 500)
        this._sendToggleMessage()
      },
      { capture: true },
    )
  }

  _clickFeedback() {
    const btn = this.button
    if (!btn) return
    btn.style.transition = 'none'
    btn.style.backgroundColor = '#d0b0e0'
    setTimeout(() => {
      btn.style.transition = ''
      btn.style.backgroundColor = ''
    }, 200)
  }

  _startHealthCheck() {
    setInterval(() => {
      if (!this.button || !this.button.isConnected) {
        this.button = this._createButton()
      }
    }, 2000)
  }

  async _sendToggleMessage(retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        await chrome.runtime.sendMessage({
          action: 'TOGGLE_SIDEPANEL',
          fromUserGesture: true,
        })
        return
      } catch (e) {
        console.warn(`FloatButton: sendMessage attempt ${i + 1}/${retries} failed:`, e.message)
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, 500))
        }
      }
    }
  }

  _listenForMessages() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'floatBtnChanged') {
        if (message.value === false) {
          this.hide()
        } else {
          this.show()
        }
      }
    })
  }

  _listenForStorageChanges() {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.floatBtn) {
        if (changes.floatBtn.newValue === false) {
          this.hide()
        } else {
          this.show()
        }
      }
    })
  }

  _getStorageData(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(result)
        }
      })
    })
  }

  show() {
    this._ensureButton()
    this.button.style.display = 'flex'
  }

  hide() {
    if (!this.button) return
    this.button.style.display = 'none'
  }

  toggle() {
    this._ensureButton()
    if (this.button.style.display === 'none') {
      this.show()
    } else {
      this.hide()
    }
  }

  destroy() {
    if (!this.button) return
    this.button.remove()
    this.button = null
  }
}

export default new FloatButton()
