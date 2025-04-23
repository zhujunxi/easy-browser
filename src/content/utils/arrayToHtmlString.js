function arrayToHtmlString(arr) {
  return arr
    .map((item, index) => {
      const { xpath, ...rest } = item

      let html = `${index}: <${rest.tag.toLowerCase()}`

      for (const [key, value] of Object.entries(rest)) {
        if (key !== 'tag' && key !== 'text' && value !== undefined && value !== '') {
          html += ` ${key}="${value}"`
        }
      }

      html += '>'

      if (rest.text) {
        html += rest.text.replace(/\n/g, ' ').trim().slice(0, 20)
      }

      html += `</${rest.tag.toLowerCase()}>`

      return html
    })
    .join('\n')
}

export default arrayToHtmlString
