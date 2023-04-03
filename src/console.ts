import fs from 'fs'
import path from 'path'
import repl from 'repl'
import ts from 'typescript'
import * as tsnode from 'ts-node'
import { connectToDatabase } from './db'

const modelDir = path.join(__dirname, 'models')

const loadModels = (context) => {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key]
  })
  fs.readdirSync(modelDir, 'utf8').forEach((name) => {
    const filePath = path.join(modelDir, name)
    context[name.slice(0, -3)] = require(filePath)
  })
}

// Create a ts-node replService
const replService: tsnode.ReplService = tsnode.createRepl()
const service = tsnode.create({ ...replService.evalAwarePartialHost })
service.ts = ts
replService.setService(service)

const startRepl = () => {
  // create a node-repl server
  const replServer = repl.start({
    ignoreUndefined: true,
    eval: replService.nodeEval
  })
  loadModels(replServer.context)

  replServer.defineCommand('reload!', {
    help: 'Reload the models without resetting the environment',
    action() {
      loadModels(replServer.context)
      this.displayPrompt()
    }
  })
}

const main = async () => {
  try {
    await connectToDatabase()
    startRepl()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
