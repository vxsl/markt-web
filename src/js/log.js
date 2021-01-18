const { EventEmitter } = require("events")

const messageEmitter = new EventEmitter()

const log = (message) => {
    messageEmitter.emit('new', message)
}

module.exports = {
    log,
    messageEmitter
}