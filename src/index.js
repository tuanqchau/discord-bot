// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ] 
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`)
})

client.on('messageCreate', (message) => {
    if (message.author.bot) return null

    if (message.content === 'hello') {
        message.reply('Ohayo! Onii-chan! ' + `${message.author.username}`)
    }

    if (message.content.startsWith('!meeting')) {
        const timeString = message.content.split(' ')[1];

    }
})


// Log in to Discord with your client's token
client.login(process.env.TOKEN);