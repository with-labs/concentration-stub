class ClientReceivedEvent extends Event {
  constructor(client, data) {
    super(data.kind)
    this._data = data
    this._client = client
    Object.assign(this, data)
  }

  get data() {
    return this._data
  }
}

export default ClientReceivedEvent
