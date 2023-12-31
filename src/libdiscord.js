const { WebSocket } = require("ws");
const { sumOfArray } = require("./utilities")

const Intents = {
    GUILDS: 1 << 0,
    GUILD_MEMBERS: 1 << 1,
    GUILD_MODERATION: 1 << 2,
    GUILD_EMOJIS_AND_STICKERS: 1 << 3,
    GUILD_INTEGRATIONS: 1 << 4,
    GUILD_WEBHOOKS: 1 << 5,
    GUILD_INVITES: 1 << 6,
    GUILD_VOICE_STATES: 1 << 7,
    GUILD_PRESENCES: 1 << 8,
    GUILD_MESSAGES: 1 << 9,
    GUILD_MESSAGE_REACTIONS: 1 << 10,
    GUILD_MESSAGE_TYPING: 1 << 11,
    DIRECT_MESSAGES: 1 << 12,
    DIRECT_MESSAGE_REACTIONS: 1 << 13,
    DIRECT_MESSAGE_TYPING: 1 << 14,
    MESSAGE_CONTENT: 1 << 15,
    GUILD_SCHEDULED_EVENTS: 1 << 16,
    AUTO_MODERATION_CONFIGURATION: 1 << 20,
    AUTO_MODERATION_EXECUTION: 1 << 21,
};

class libdiscord {
    constructor(token, app, intents) {
        this.gateway = "wss://gateway.discord.gg?v=10&encoding=json";
        this.ws = new WebSocket(this.gateway);
        this.eventHandlers = {};

        this.token = token;
        this.appId = app;
        this.intents = sumOfArray(intents);
    }

    login() {
        this.ws.on('open', () => {
            console.log("[EVENT] Connected to the Discord Gateway");
            this.start_socket_communication();
        });

        this.ws.on('close', (code) => {
            console.log(`[EVENT] Disconnected from the Discord Gateway (code: ${code}). Trying to reconnect...`);
            this.start_socket_communication();
        });

        this.ws.on('error', (error) => {
            console.error('[EVENT] WebSocket error:', error);
        });

        this.ws.on('message', (i) => {
            try {
                const payload = JSON.parse(i);

                switch (payload.op) {
                    case 10:
                        this.start_socket_hartbeat(payload.d.heartbeat_interval);
                        break;
                    case 11:
                        console.log('[EVENT] Received heartbeat ACK from the gateway');
                        break;
                    case 0:
                        this.handle_socket_dispatch_payload(payload);
                        break;
                    default:

                        break;
                }
            } catch (error) {
                console.error('[EVENT] Error while parsing the payload message:', error);
            }
        });
    }

    start_socket_communication() {
        const payload = {
            op: 2,
            d: {
                token: this.token,
                intents: this.intents,
                properties: {
                    $os: 'linux',
                    $browser: 'libdiscord',
                    $device: 'libdiscord',
                },
            },
        };

        this.ws.send(JSON.stringify(payload), (error) => {
            if (error) {
                console.error('[EVENT] Error while sending the identify payload:', error);
            } else {
                console.log("[EVENT] Started socket communication between discord and you.");
            }
        });
    }

    start_socket_hartbeat(interval) {
        setInterval(() => {
            const payload = {
                op: 1,
                d: null,
            };

            this.ws.send(JSON.stringify(payload), (error) => {
                if (error) {
                    console.error('[EVENT] Error while sending heartbeat to the gateway:', error);
                }
            });
        }, interval);
    }

    handle_socket_dispatch_payload(payload) {

        const { t, d } = payload;
        if (this.eventHandlers[t]) {
            this.eventHandlers[t](d);
        }
    }

    on(event, handler) {
        this.eventHandlers[event] = handler;
    }
}

class API {
    constructor(token) {
        this.token = token;
    }

    async send_guild_content(channelId, content, ...embeds) {
        await this.send_content(`https://discord.com/api/v10/channels/${channelId}/messages`, content, ...embeds);
    }

    async send_content(endpoint, content, ...embeds) {
        const payload = {
            content,
            embeds,
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${this.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(response.status, response.statusText);
                return;
            }

            console.log('[EVENT] Sent message successfully');
        } catch (error) {
            console.error('[EVENT] Message sending error:', error);
        }
    }
}

class EmbedBuilder {
    constructor(config = {}) {
        this.embed = config;
    }

    setTitle(title) {
        this.embed.title = title;
        return this;
    }

    setDescription(description) {
        this.embed.description = description;
        return this;
    }

    setAuthor(name, iconURL, url) {
        this.embed.author = {
            name,
            iconURL,
            url,
        };
        return this;
    }

    setColor(color) {
        this.embed.color = color;
        return this;
    }

    setFooter(text, iconURL) {
        this.embed.footer = {
            text,
            iconURL,
        };
        return this;
    }

    setImage(url) {
        this.embed.image = {
            url,
        };
        return this;
    }

    setThumbnail(url) {
        this.embed.thumbnail = {
            url,
        };
        return this;
    }

    addField(name, value, inline = false) {
        if (!this.embed.fields) {
            this.embed.fields = [];
        }

        this.embed.fields.push({
            name,
            value,
            inline,
        });

        return this;
    }

    build() {
        console.log("[EVENT] EmbedBuilder: Built embed with title: " + this.embed.title)
        return this.embed;
    }
}

module.exports = { libdiscord, API, Intents, EmbedBuilder }
