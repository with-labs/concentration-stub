class ClientPeerData {
  constructor(roomData) {
     // get our own copy as we do intend to keep it updated
    this._roomData = JSON.parse(JSON.stringify(roomData))
  }

  self() {
    return this._roomData.self
  }

  peersExcludingSelf() {
    return this.peersIncludingSelf().filter((p) => (p.sessionId() == this.sessionId()))
  }

  peersIncludingSelf() {
    return [...this._roomData.peers]
  }

  authenticatedPeers() {
    return this._roomData.peers.filter((p) => (p.authenticated))
  }

  updatePeer(participant) {
    const existingPeer = this.getPeer(participant)
    if(existingPeer) {
      Object.assign(existingPeer, participant)
    } else {
      this._roomData.peers.push(participant)
      if(this.peerAddHandler) {
        this.peerAddHandler(participant)
      }
    }
  }

  getPeer(participant) {
    const peer = this._roomData.peers.find((p) => {
      return p.sessionId == participant.sessionId
    })
    return peer
  }

  removePeer(participant) {
    const index = this._roomData.peers.findIndex((p) => (p.sessionId == participant.sessionId))
    if(index > -1) {
      this._roomData.peers.splice(index, 1)
    }
    if(this.peerRemoveHandler) {
      this.peerRemoveHandler(participant)
    }
  }

  setPeerRemoveHandler(peerRemoveHandler) {
    this.peerRemoveHandler = peerRemoveHandler
  }

  setPeerAddHandler(peerAddHandler) {
    this.peerAddHandler = peerAddHandler
  }

  userId() {
    return this._roomData.self.user.id
  }

  sessionId() {
    return this._roomData.sessionId
  }

}

export default ClientPeerData
