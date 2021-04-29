# concentration-stub
This is a javascript client for a multiplayer Concentration-style game https://en.wikipedia.org/wiki/Concentration_(card_game).

The goal of this turn-based memory game is to find matching pairs of cards, which are presented face down on a grid.

The client is built to connect to a remote socket and send and receive JSON events.

## Events the client can send
- `{kind: "auth", room_roue, user_name}` - to authenticate under a certain name to a certain room/group of players
- `{kind: "start_game" }` - to declare your intention to begin a game session
- `{kind: "reveal", index}` - to flip a card on your turn
- `{kind: "update_display_name", display_name}`

## Events the client consumes
- auth.response
```
{
  kind: "auth.response",
  payload: {
    self: {
      session_id: "authenticated_user_session_id", // the session_id identified a socket connection  
      user: {
        id: user_id,
        display_name: display_name
      }
    }
    peers: [
      {
        session_id,
        user: {id, display_name}
      }
    ],
    room_data: {
      started,
      deck: [
        1, 2, 3, 4, ... // must be even, since the game is about matching pairs
      ]
    }
  }
}
```
- participant_joined
```
{
  kind: "participant_joined"
  payload: {
    session_id,
    user: {id, display_name}
  }
}
- participant_left
```
{
  kind: "participant_left"
  payload: {
    session_id,
    user: {id, display_name}
  }
}
- `{kind: "game_started"}`
- `{kind: "game_stopped"}`

## Other notes
### Client-server identification
Each client is only connected to 1 game session, so they don't send any sort of identifiers for the game room. The server should determine a user by their socket.

### Unhandled events
Some events are unhandled by the client, and bubbled upstream via the EventTarget API https://developer.mozilla.org/en-US/docs/Web/API/EventTarget - i.e. via `dispatchEvent(event)`.

These events should at least include:
- a card being revealed (the server determines whether that is allowed to happen when a client requests it, and broadcasts the event in case it does happen)
- a player's score changing
- the game being finished due to all cards being revealed
- the turn being passed to a certain player

### Heartbeats
The client supports heartbeats - it sends a `{kind: "ping"}` event every ~30 seconds, and if it doesnt receive a `{kind: "pong"}` event within ~60 seconds, it disconnects.
This is disabled by default, but can be optionally enabled if the server supports it.

