class ClientReceivedEvent extends Event{
  constructor(client, data) {
    super(data.kind)
    this.contents = data
    this._client = client
    Object.assign(this, data)
  }

  data() {
    return this.contents
  }
}

export default ClientReceivedEvent
