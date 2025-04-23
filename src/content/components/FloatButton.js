class FloatButton {
  constructor() {
    this.button = null
    this.init()
  }

  async init() {
    this.button = this._createButton()
    this._bindEvents()

    try {
      const result = await this._getStorageData('floatBtn')
      if (result.floatBtn === false) {
        this.hide()
      } else {
        this.show()
      }

      this._listenForStorageChanges()
    } catch (error) {
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

    document.body.appendChild(toggleButton)
    return toggleButton
  }

  _bindEvents() {
    this.button.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        action: 'TOGGLE_SIDEPANEL',
        fromUserGesture: true,
      })
    })

    this.button.addEventListener('mouseover', () => {
      this.button.classList.add('hover')
    })

    this.button.addEventListener('mouseout', () => {
      this.button.classList.remove('hover')
    })
  }

  _listenForStorageChanges() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
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
      chrome.storage.sync.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(result)
        }
      })
    })
  }

  show() {
    this.button.style.display = 'flex'
  }

  hide() {
    this.button.style.display = 'none'
  }

  toggle() {
    if (this.button.style.display === 'none') {
      this.show()
    } else {
      this.hide()
    }
  }

  destroy() {
    this.button.remove()
    this.button = null
  }
}

export default new FloatButton()
