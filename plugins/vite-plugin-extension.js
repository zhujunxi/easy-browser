import * as fs from 'fs'
import * as path from 'path'

export default function extension(defineManifest) {
  return {
    name: 'vite-plugin-extension',
    writeBundle() {
      const distPath = path.resolve('dist')
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true })
      }

      const manifestPath = path.resolve('dist/manifest.json')

      const assetsPath = path.join(distPath, 'assets/css')
      let styleFile = 'src/content/style.css'

      if (fs.existsSync(assetsPath)) {
        const cssFiles = fs.readdirSync(assetsPath)
        const contentStyleFile = cssFiles.find(file => file.startsWith('contentStyle.') && file.endsWith('.css'))

        if (contentStyleFile) {
          styleFile = `assets/css/${contentStyleFile}`
        }
      }

      // instead of content_style.css
      const updatedManifest = {
        ...defineManifest,
        content_scripts: defineManifest.content_scripts.map(script => ({
          ...script,
          css: [styleFile]
        }))
      };

      fs.writeFileSync(
        manifestPath,
        JSON.stringify(updatedManifest, null, 2)
      );

      console.log(`\nManifest file copy complete: ${manifestPath}`)
    },
  };
}