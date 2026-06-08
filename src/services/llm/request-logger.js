const LOG_SERVER_URL = 'http://localhost:5678/log'

class RequestLogger {
  static async log(entry) {
    if (typeof __TEST_MODE__ === 'undefined' || !__TEST_MODE__) return
    try {
      await fetch(LOG_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch {
      // silent - server not running
    }
  }
}

export default RequestLogger
