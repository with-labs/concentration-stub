const EventTarget = function() {
  this.listeners = {};
};

EventTarget.prototype.listeners = null;
EventTarget.prototype.addEventListener = function(type, callback) {
  if (!(type in this.listeners)) {
    this.listeners[type] = [];
  }
  this.listeners[type].push(callback);
};

EventTarget.prototype.removeEventListener = function(type, callback) {
  if (!(type in this.listeners)) {
    return;
  }
  var stack = this.listeners[type];
  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i] === callback){
      stack.splice(i, 1);
      return;
    }
  }
};

EventTarget.prototype.dispatchEvent = function(event) {
  if (!(event.type in this.listeners)) {
    return true;
  }
  var stack = this.listeners[event.type].slice();

  for (var i = 0, l = stack.length; i < l; i++) {
    stack[i].call(this, event);
  }
  return !event.defaultPrevented;
};

class Event {
  constructor(type) {
    this.type = type
  }
}

import dotenv from "dotenv"
import Client from "../src/client.mjs"
import repl from "repl"
import ws from 'ws'

global.EventTarget = EventTarget
global.Event = Event
global.WebSocket = ws

const startConsole = async () => {
  dotenv.config()
  console.log(`Starting console - ${process.env.NODE_ENV}`)
  const replServer = repl.start({})
  replServer.context.Client = Client
}

startConsole()
