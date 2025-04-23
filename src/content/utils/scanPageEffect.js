// Scanner

const scanPageEffect = async () => {
  let easyBrowserScannerContainer = document.getElementById('easy-browser-scanner-container')
  if (easyBrowserScannerContainer) {
    easyBrowserScannerContainer.remove()
  }

  easyBrowserScannerContainer = document.createElement('div')
  easyBrowserScannerContainer.id = 'easy-browser-scanner-container'

  document.body.appendChild(easyBrowserScannerContainer)

  const easyBrowserScanner = document.createElement('div')
  easyBrowserScanner.classList.add('easy-browser-scanner')
  easyBrowserScannerContainer.appendChild(easyBrowserScanner)

  setTimeout(() => {
    easyBrowserScannerContainer.remove()
  }, 2500)
  return () => {
    easyBrowserScannerContainer.remove()
  }
}

export default scanPageEffect
