const { EventEmitter } = require("events")

const logEmitter = new EventEmitter()

const log = (message) => {
    logEmitter.emit('new', message)
}

module.exports = {
    log,
    logEmitter
}