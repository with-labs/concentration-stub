import dotenv from "dotenv"
import Client from "../src/client.mjs"
import repl from "repl"

const startConsole = async () => {
  dotenv.config()
  console.log(`Starting console - ${process.env.NODE_ENV}`)
  const replServer = repl.start({})
  replServer.context.Client = Client
}

startConsole()
