const getVisibleTextInViewport = async (root) => {
  const textNodes = []
  const walker = root.createTreeWalker(root.body, NodeFilter.SHOW_TEXT, null, false)

  let node
  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim() !== '') {
      textNodes.push(node)
    }
  }

  const visibleTextNodes = textNodes.filter((node) => {
    const element = node.parentElement
    if (!element) return false

    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false
    }

    const rect = element.getBoundingClientRect()

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  })

  return visibleTextNodes.map((node) => node.nodeValue.trim()).join(' ')
}

export default getVisibleTextInViewport
