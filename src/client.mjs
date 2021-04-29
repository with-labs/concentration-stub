import ClientPeerData from './client/client_peer_data.mjs'
import ClientReceivedEvent from './client/client_received_event.mjs'
import RoomData from './client/room_data.mjs'

let count = 0

class Client extends EventTarget {
  constructor(roomRoute="default", heartbeatIntervalMillis=30000, heartbeatTimeoutMillis=60000) {
    super()
    this.id = count++
    this.eventId = 0
    this.ready = false
    this.roomRoute = roomRoute
    this.promiseResolvers = []

    this.heartbeatIntervalMillis = heartbeatIntervalMillis
    this.heartbeatTimeoutMillis = heartbeatTimeoutMillis

    this.heartbeat = () => {
      this.sendEvent("ping", {})
    }

    this.dieFromTimeout = () =>  {
      this.disconnect()
    }
  }

  /**********************************/
  /* API: usually use these methods */
  /**********************************/
  async connect() {
    return new Promise((resolve, reject) => {
      const socketUrl = `wss://${window.location.host}`
      this.socket = new WebSocket(socketUrl)
      this.socket.addEventListener('open', () => {
        // this.startHeartbeat()
        this.ready = true
        resolve(this)
      })
      this.socket.addEventListener('close', () => {
        this.stopHeartbeat()
        this.ready = false
        this.promiseResolvers.forEach((resolver) => {
          resolver(null, true)
        })
      })
      this.socket.addEventListener('message', (message) => {
        try {
          const event = new ClientReceivedEvent(this, JSON.parse(message.data))
          this.handleEvent(event)
          this.dispatchEvent(event)
        } catch(e) {
          console.log(e)
        }
      })
    })
  }

  /**
    Listen on the `joined_room` event to know when the connection goes through
  */
  joinRoom(userName) {
    this.sendEvent("auth", { room_route: this.roomRoute, user_name: userName })
  }

  onAuthResponse(response) {
    this.peerData = new ClientPeerData(response.payload)
    this.roomData = new RoomData(response.payload)
    const event = new Event("joined_room")
    this.dispatchEvent(event)
  }

  sendGameStart() {
    this.sendEvent('start_game', { })
  }

  reveal(index) {
    this.sendEvent('reveal', { index })
  }

  updateName(newName) {
    return this.sendEvent("update_display_name", { display_name: newName })
  }

  get userId() {
    return this.peerData.userId()
  }

  get sessionId() {
    return this.peerData.sessionId()
  }

  get isStarted() {
    return this.roomData.isStarted()
  }

  get deck() {
    return this.roomData.deck
  }

  get self() {
    return this.peerData.self()
  }

  get peersIncludingSelf() {
    return this.peerData.peersIncludingSelf()
  }

  get isReady() {
    return this.ready
  }

  /******************************************/
  /* semi-public - rarely useful externally */
  /******************************************/
  async disconnect() {
    this.ready = false
    return new Promise((resolve, reject) => {
      this.socket.addEventListener("close", () => {
        resolve(this)
      })
      this.closeSocket()
    })
  }

  broadcast(message) {
    return this.sendEvent("echo", { message })
  }

  sendEvent(event) {
    const stringEvent = JSON.stringify(event)
    this.send(stringEvent)
  }

  /******************************************/
  /* private                                */
  /******************************************/
  closeSocket() {
    this.ready = false
    this.socket.close()
  }

  send(message) {
    this.socket.send(message)
  }

  makeEvent(kind, payload) {
    return {
      id: `${this.id}_${this.eventId++}`,
      kind: kind,
      payload: payload
    }
  }

  handleEvent(event) {
    if(!this.peerData) {
      return
    }
    switch(event.kind) {
      case 'auth.response':
        this.onAuthResponse(event)
      case 'participant_joined':
        /*
          Note: we're not necessarily adding a peer when they join.
          They may have already been added to the room,
          just not yet broadcast their participant_joined event.

          E.g. this protects against certain race conditions:
          1. A socket connect
          2. B socket connect
          3. A join room
          4. B join room
          5. B gets list of authenticated participants: [A, B]
          6. A broadcasts its join event
         (7. B broadcasts its join event)
        */
        this.peerData.addOrUpdatePeer(event.payload)
        break
      case 'participant_left':
        this.peerData.removePeer(event.payload)
        break
      case 'game_started':
        this.roomData.setRoomIsStarted()
        break
      case 'game_stopped':
        this.roomData.setRoomIsStopped()
        break
      case 'pong'
        clearTimeout(this.heartbeatTimeout)
        this.heartbeatTimeout = setTimeout(this.dieFromTimeout, this.heartbeatTimeoutMillis)
        break

    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(this.heartbeat, this.heartbeatIntervalMillis)
    this.heartbeatTimeout = setTimeout(this.dieFromTimeout, this.heartbeatTimeoutMillis)
    this.heartbeat()
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval)
    clearTimeout(this.heartbeatTimeout)
  }
}

export default Client
