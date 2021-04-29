class RoomData {
  constructor(authData) {
    this._authData = authData
  }

  get deck() {
    return this._authData.roomData.deck
  }

  get authData() {
    return this._authData
  }

  setRoomIsStarted() {
    this.authData.roomData.started = true
  }

  setRoomIsStopped() {
    this.authData.roomData.started = false
  }

  isStarted() {
    return this.authData.roomData.started
  }
}

export default RoomData
