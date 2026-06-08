import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR = path.resolve(__dirname, '../api-logs')

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/log') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try {
        const date = new Date().toISOString().slice(0, 10)
        const logFile = path.join(LOG_DIR, `${date}.log`)
        fs.appendFileSync(logFile, body + '\n')
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('ok')
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(err.message)
      }
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('not found')
  }
})

const PORT = 5678
server.listen(PORT, () => {
  console.log(`[log-server] Listening on port ${PORT}, writing to ${LOG_DIR}`)
})
