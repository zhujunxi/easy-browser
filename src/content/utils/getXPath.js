function getXPath(element) {
  if (!element) return null

  if (element.nodeType === 9) return ''

  if (element === document.documentElement) return '/html'

  let path = ''

  while (element && element.nodeType === 1) {
    let name = element.nodeName.toLowerCase()
    let index = 1
    let hasSameTypeSibling = false

    let sibling = element.previousSibling
    while (sibling) {
      if (sibling.nodeType === 1 && sibling.nodeName === element.nodeName) {
        index++
        hasSameTypeSibling = true
      }
      sibling = sibling.previousSibling
    }

    sibling = element.nextSibling
    while (!hasSameTypeSibling && sibling) {
      if (sibling.nodeType === 1 && sibling.nodeName === element.nodeName) {
        hasSameTypeSibling = true
        break
      }
      sibling = sibling.nextSibling
    }

    let pathIndex = hasSameTypeSibling ? '[' + index + ']' : ''
    path = '/' + name + pathIndex + path
    element = element.parentNode
  }

  return path
}

export default getXPath
