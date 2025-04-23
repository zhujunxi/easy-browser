import getXPath from './getXPath.js'

const getElementsDetail = (el) => {
  const baseData = {
    tag: el.tagName,
    xpath: getXPath(el),
  }

  switch (el.tagName) {
    case 'A':
      const linkText = el.innerText
      return {
        ...baseData,
        ...(linkText && { text: el.innerText }),
        ...(!linkText && { href: el.href.slice(0, 20) }),
      }
    case 'BUTTON':
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
    case 'INPUT':
      return {
        ...baseData,
        type: el.getAttribute('type') || null,
        value: el.value.slice(0, 20),
        // placeholder: el.placeholder,
        // isChecked: el.checked,
        // required: el.required
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
        // clickable: true,
        class: el.className.slice(0, 20),
        text: el.innerText,
      }

    default:
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

export default getElementsDetail
