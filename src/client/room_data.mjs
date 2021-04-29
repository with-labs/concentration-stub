class RoomData {
  constructor(authData) {
    this._authData = authData
  }

  get deck() {
    return this._authData.room_data.deck
  }

  get authData() {
    return this._authData
  }

  setRoomIsStarted() {
    this.authData.room_data.started = true
  }

  setRoomIsStopped() {
    this.authData.room_data.started = false
  }

  isStarted() {
    return this.authData.room_data.started
  }
}

export default RoomData
