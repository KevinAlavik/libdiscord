const { libdiscord, API, EmbedBuilder, Intents } = require('./libdiscord');
const { token, app } = require('./libdiscord.conf');

const client = new libdiscord(token, app, [Intents.GUILDS, Intents.GUILD_MESSAGES, Intents.DIRECT_MESSAGES, Intents.GUILD_MESSAGE_TYPING, Intents.MESSAGE_CONTENT])
const api = new API(token);

const embed = new EmbedBuilder({
    title: "Example Title",
    description: "Example Description",
    color: 0xFF5733,
    footer: {
        text: "Example Footer",
        iconURL: "https://example.com/footer-icon.png",
    },
}).addField("Field 1", "Value 1").addField("Field 2", "Value 2", true).build();


client.on("READY", () => {
    console.log("[EVENT] Bot is online!");
})

client.on("MESSAGE_CREATE", (m) => {
    console.log("[EVENT] Message (" + m.author.username + "): " + (m.embeds.length > 0 ? "[Embed] " : "") + m.content);
    if(m.author.id != app) { api.send_guild_content(m.channel_id, null, embed)}
})

client.login();