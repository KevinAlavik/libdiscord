const { libdiscord, Intents } = require('./libdiscord');
const { token, app } = require('./libdiscord.conf');

const client = new libdiscord(token, app, [Intents.GUILDS, Intents.GUILD_MESSAGES])

client.on("READY", () => {
    console.log("[EVENT] Bot is online!");
})

client.on("MESSAGE_CREATE", (m) => {
    console.log("[EVENT] Got GUILD_MESSAGE, content: " + m.content);
    
})

client.login();
