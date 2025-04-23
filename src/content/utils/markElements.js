import getInteractiveElements from './getInteractiveElements'

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const markElements = async () => {
  const elements = await getInteractiveElements(document)

  let markContainer = document.getElementById('elements-mark-container')
  if (markContainer) {
    markContainer.remove()
  }

  const bodyZoom = parseFloat(window.getComputedStyle(document.body).zoom) || 1

  markContainer = document.createElement('div')
  markContainer.id = 'elements-mark-container'
  markContainer.style.position = 'absolute'
  markContainer.style.top = '0'
  markContainer.style.left = '0'
  markContainer.style.width = '100%'
  markContainer.style.height = '100%'
  markContainer.style.pointerEvents = 'none'
  markContainer.style.zIndex = '2147483647'

  document.body.appendChild(markContainer)

  const updateContainerSize = () => {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    )
    const docWidth = Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth,
    )
    markContainer.style.height = `${docHeight}px`
    markContainer.style.width = `${docWidth}px`
  }

  updateContainerSize()

  const getAbsolutePosition = (element) => {
    const rect = element.getBoundingClientRect()
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    const position = {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height,
    }

    if (bodyZoom !== 1) {
      position.top /= bodyZoom
      position.left /= bodyZoom
      position.width /= bodyZoom
      position.height /= bodyZoom
    }

    return position
  }

  elements.forEach((el, index) => {
    const color = getRandomColor()
    const position = getAbsolutePosition(el)

    const overlay = document.createElement('div')
    overlay.className = 'element-mark-overlay'
    overlay.style.position = 'absolute'
    overlay.style.top = `${position.top}px`
    overlay.style.left = `${position.left}px`
    overlay.style.width = `${position.width}px`
    overlay.style.height = `${position.height}px`
    overlay.style.border = `2px solid ${color}`
    overlay.style.boxSizing = 'border-box'
    overlay.style.pointerEvents = 'none'

    const label = document.createElement('span')
    label.className = 'element-mark-label'
    label.textContent = index
    label.style.position = 'absolute'
    label.style.top = '0'
    label.style.left = '0'
    label.style.backgroundColor = color
    label.style.color = 'white'
    label.style.fontSize = '10px'
    label.style.padding = '2px 5px'
    label.style.borderRadius = '0 0 5px 0'
    label.style.zIndex = '2147483647'
    label.style.fontFamily = 'Arial, sans-serif'
    label.style.fontWeight = 'bold'
    label.style.lineHeight = '1'
    label.style.boxSizing = 'border-box'

    overlay.appendChild(label)

    markContainer.appendChild(overlay)
  })

  const updateMarkPositions = () => {
    updateContainerSize()

    const overlays = markContainer.querySelectorAll('.element-mark-overlay')
    elements.forEach((el, index) => {
      if (index < overlays.length) {
        const overlay = overlays[index]
        const position = getAbsolutePosition(el)

        overlay.style.top = `${position.top}px`
        overlay.style.left = `${position.left}px`
        overlay.style.width = `${position.width}px`
        overlay.style.height = `${position.height}px`
      }
    })
  }

  const intervalId = setInterval(updateMarkPositions, 500)
  window.addEventListener('scroll', updateMarkPositions)
  window.addEventListener('resize', updateMarkPositions)

  return () => {
    clearInterval(intervalId)
    window.removeEventListener('scroll', updateMarkPositions)
    window.removeEventListener('resize', updateMarkPositions)
    markContainer.remove()
  }
}

export default markElements
