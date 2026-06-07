/**
 * Page scanner - Detects and details interactive elements in the viewport
 */

import getXPath from './getXPath.js'

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

const getInteractiveElements = async (root = document) => {
  const interactiveSelectors = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]',
    '[tabindex]',
    '[role=button]',
    '[role=link]',
    '[role=checkbox]',
    '[role=radio]',
    '[role=textbox]',
    '[role=combobox]',
    '[role=menuitem]',
    '[role=option]',
    '[role=tab]',
    '[role=treeitem]',
    '[role=slider]',
    '[role=spinbutton]',
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

const getElementsDetail = (el) => {
  const baseData = {
    tag: el.tagName,
    xpath: getXPath(el),
  }

  switch (el.tagName) {
    case 'A': {
      const linkText = el.innerText
      return {
        ...baseData,
        ...(linkText && { text: el.innerText }),
        ...(!linkText && { href: el.href.slice(0, 20) }),
      }
    }
    case 'BUTTON': {
      let buttonText = ''
      const buttonAriaLabel = el.getAttribute('aria-label')
      if (buttonAriaLabel) {
        buttonText = buttonAriaLabel
      } else if (el.innerText) {
        buttonText = el.innerText.trim()
      }
      return {
        ...baseData,
        ...(buttonText && { text: buttonText }),
        ...(!buttonText && { class: el.className.slice(0, 20) }),
      }
    }
    case 'INPUT':
      return {
        ...baseData,
        type: el.getAttribute('type') || null,
        value: el.value.slice(0, 20),
      }
    case 'TEXTAREA':
      return {
        ...baseData,
        value: el.value,
        placeholder: el.placeholder.slice(0, 20),
      }
    case 'SELECT':
      return {
        ...baseData,
        options: Array.from(el.options).map((opt) => ({
          text: opt.text,
          value: opt.value,
          selected: opt.selected,
        })),
        selectedIndex: el.selectedIndex,
        multiple: el.multiple,
        selectType: 'select',
      }
    case 'IFRAME':
      return {
        ...baseData,
        src: el.getAttribute('src') || null,
        title: el.getAttribute('title') || null,
        iframeType: 'iframe',
      }
    case 'AUDIO':
    case 'VIDEO':
      return {
        ...baseData,
        src: el.getAttribute('src') || null,
        controls: el.controls,
        autoplay: el.autoplay,
        loop: el.loop,
        muted: el.muted,
        mediaType: el.tagName.toLowerCase(),
      }
    case 'DIV':
    case 'H1':
    case 'H2':
    case 'H3':
    case 'UL':
    case 'OL':
    case 'LI':
      return {
        ...baseData,
        class: el.className.slice(0, 20),
        text: el.innerText,
      }
    default: {
      const role = el.getAttribute('role')
      if (role) {
        return {
          ...baseData,
          role: role,
          ariaLabel: el.getAttribute('aria-label') || null,
          ariaType: 'aria-' + role,
        }
      }
      return baseData
    }
  }
}

export default getInteractiveElements
export { getElementsDetail }
