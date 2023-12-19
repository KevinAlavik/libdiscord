const ws = require("ws");
const { sumOfArray } = require("./utilities")

class libdiscord {
    constructor(token, app, intents) {
        this.gateway = "wss://gateway.discord.gg?v=10&encoding=json";
        this.ws = new WebSocket(this.gateway);

        this.token = token;
        this.appId = app;
        this.intents = sumOfArray(intents);
    }

    login() {
        ws.on()
    }
}