class pageDataStore {
  constructor() {
    if (!pageDataStore.instance) {
      this._data = []
      pageDataStore.instance = this
    }
    return pageDataStore.instance
  }

  setData(data) {
    this._data = data
  }

  getData() {
    return this._data
  }

  getItem(index) {
    return this._data[index]
  }

  getLength() {
    return this._data.length
  }

  clear() {
    this._data = []
  }
}

const instance = new pageDataStore()

export default instance
