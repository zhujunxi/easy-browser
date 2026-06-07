class PageDataStore {
  constructor() {
    if (!PageDataStore.instance) {
      this._data = []
      PageDataStore.instance = this
    }
    return PageDataStore.instance
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

const pageDataStore = new PageDataStore()

export default pageDataStore
