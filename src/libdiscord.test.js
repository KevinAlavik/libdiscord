const { libdiscord, API, Intents } = require('./libdiscord');
const { token, app } = require('./libdiscord.conf');

const client = new libdiscord(token, app, [Intents.GUILDS, Intents.GUILD_MESSAGES, Intents.DIRECT_MESSAGES, Intents.GUILD_MESSAGE_TYPING, Intents.MESSAGE_CONTENT])
const api = new API(token);


client.on("READY", () => {
    console.log("[EVENT] Bot is online!");
})

client.on("MESSAGE_CREATE", (m) => {
    console.log("[EVENT] Message ("+ m.author.username+"): " + m.content);
    if(m.author.id != app) { api.send_guild_message(m.channel_id, m.content) }
})

client.login();