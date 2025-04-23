/**
 * check if element is hoverable
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function detectHoverableElements(element) {
  if (!element) return false

  const originalClasses = element.className
  const originalStyle = element.getAttribute('style')
  let changed = false

  const observer = new MutationObserver(() => {
    changed = true
  })

  observer.observe(element, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  })

  try {
    simulateMouseEvents(element, true)

    if (
      element.className !== originalClasses ||
      element.getAttribute('style') !== originalStyle ||
      changed
    ) {
      return true
    }

    const beforeHoverStyle = window.getComputedStyle(element)
    const beforeColor = beforeHoverStyle.color
    const beforeBg = beforeHoverStyle.backgroundColor
    const beforeBorder = beforeHoverStyle.borderColor

    simulateMouseEvents(element, true)

    const afterHoverStyle = window.getComputedStyle(element)
    if (
      beforeColor !== afterHoverStyle.color ||
      beforeBg !== afterHoverStyle.backgroundColor ||
      beforeBorder !== afterHoverStyle.borderColor
    ) {
      return true
    }

    return false
  } finally {
    observer.disconnect()

    simulateMouseEvents(element, false)

    if (element.className !== originalClasses) {
      element.className = originalClasses
    }
    if (element.getAttribute('style') !== originalStyle) {
      if (originalStyle) {
        element.setAttribute('style', originalStyle)
      } else {
        element.removeAttribute('style')
      }
    }
  }
}

/**
 * simulate mouse events
 * @param {HTMLElement} element
 * @param {boolean} isOver
 */
function simulateMouseEvents(element, isOver) {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const eventConfig = {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY,
  }

  if (isOver) {
    let parent = element.parentElement
    if (parent) {
      const parentEvent = new MouseEvent('mouseover', eventConfig)
      parent.dispatchEvent(parentEvent)
    }
    element.dispatchEvent(new MouseEvent('mouseover', eventConfig))
    element.dispatchEvent(new MouseEvent('mouseenter', eventConfig))
    element.dispatchEvent(new MouseEvent('mousemove', eventConfig))
  } else {
    element.dispatchEvent(new MouseEvent('mouseout', eventConfig))
    element.dispatchEvent(new MouseEvent('mouseleave', eventConfig))
  }
}

/**
 * check if element is in viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isElementInViewport(root, element) {
  const rect = element.getBoundingClientRect()
  const rootRect =
    root === document
      ? { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth }
      : root.getBoundingClientRect()

  return (
    rect.top >= rootRect.top &&
    rect.left >= rootRect.left &&
    rect.bottom <= rootRect.bottom &&
    rect.right <= rootRect.right
  )
}

/**
 * check if element has interactive parent
 * @param {HTMLElement} element
 * @param {Set} interactiveElementsSet
 * @returns {boolean}
 */
function hasInteractiveParent(element, interactiveElementsSet) {
  let parent = element.parentElement
  while (parent) {
    if (interactiveElementsSet.has(parent)) {
      return true
    }
    parent = parent.parentElement
  }
  return false
}

/**
 * check if element has ad related class
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function hasAdRelatedClass(element) {
  const classList = Array.from(element.classList)
  for (let i = 0; i < classList.length; i++) {
    const className = classList[i].toLowerCase()
    if (
      className.includes('ad') ||
      className.includes('advertisement') ||
      className.includes('easy-browser')
    ) {
      return true
    }
  }
  return false
}

// Get interactive elements
const getInteractiveElements = async (root = document) => {
  const interactiveSelectors = [
    'a[href]', // Links with href attribute
    'area[href]', // Image map areas
    'button', // Buttons
    'input', // Input fields
    'select', // Dropdown select boxes
    'textarea', // Multi-line text input
    'iframe', // Inline frames
    'audio[controls]', // Audio with controls
    'video[controls]', // Video with controls
    '[contenteditable]', // Editable content
    '[tabindex]', // Elements with tabindex
    '[role=button]', // ARIA button role
    '[role=link]', // ARIA link role
    '[role=checkbox]', // ARIA checkbox role
    '[role=radio]', // ARIA radio button role
    '[role=textbox]', // ARIA textbox role
    '[role=combobox]', // ARIA combobox role
    '[role=menuitem]', // ARIA menu item role
    '[role=option]', // ARIA option role
    '[role=tab]', // ARIA tab role
    '[role=treeitem]', // ARIA tree item role
    '[role=slider]', // ARIA slider role
    '[role=spinbutton]', // ARIA spinbutton role
    'div',
    'li',
  ].join(',')

  const allElements = Array.from(root.querySelectorAll(interactiveSelectors))

  const potentialInteractiveElements = allElements.filter((el) => {
    if (hasAdRelatedClass(el)) {
      return false
    }

    if (!isElementInViewport(root, el)) return false

    if (el.disabled) return false

    if (!(el.offsetWidth > 0 && el.offsetHeight > 0)) return false
    if (el.style.display === 'none') return false
    if (el.style.visibility === 'hidden') return false
    if (el.style.opacity === '0') return false

    const tabIndex = el.getAttribute('tabindex')
    if (tabIndex && parseInt(tabIndex) < 0) return false

    if (el.tagName === 'A' && !el.innerText?.trim()) return false

    if (['DIV', 'LI'].includes(el.tagName)) {
      const computedStyle = window.getComputedStyle(el)
      const hasClickHandler =
        el.getAttribute('onclick') !== null || typeof el.onclick === 'function'
      const hasPointerCursor = computedStyle.cursor === 'pointer'
      const hasHoverEffect = detectHoverableElements(el)

      if (hasClickHandler || hasPointerCursor || hasHoverEffect) {
        return true
      }

      if (el.tagName === 'DIV') {
        const classList = el.classList
        const hasTitle = el.hasAttribute('title')

        for (let i = 0; i < classList.length; i++) {
          const className = classList[i].toLowerCase()
          if (
            className.includes('btn') ||
            className.includes('button') ||
            className.includes('upload')
          ) {
            return true
          }
        }

        if (hasTitle) return true

        return false
      }

      if (el.tagName === 'LI') {
        return el.innerText?.trim().length > 0
      }

      return false
    }
    return true
  })

  const interactiveElementsSet = new Set(potentialInteractiveElements)

  const finalInteractiveElements = potentialInteractiveElements.filter((el) => {
    if (el.tagName === 'DIV') {
      return !hasInteractiveParent(el, interactiveElementsSet)
    }
    return true
  })

  return finalInteractiveElements
}

export default getInteractiveElements
