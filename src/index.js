
const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const schedule = require('node-schedule');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] 
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`)
})

client.on('messageCreate', (message) => {
    if (message.author.bot) return null

    if (message.content === 'hello') {
        message.reply('What\'s up ' + `${message.author.username}`)
    }

    if (message.content.startsWith('!meeting')) {
        const timeString = message.content.split(' ')[1];
        message.reply('Meeting scheduled at ' + `${timeString}` + '\nPoll ends in 1 minutes.')
        //+ '\nReact with ✅ if you are attending and ❌ if not'
        .then((sentMessage) => {
            const reactions = ['✅', '❌'];

            Promise.all(reactions.map(emoji => sentMessage.react(emoji)))
        .then(() => {countReactions(sentMessage, timeString)})
        .catch((error) => console.error('Error adding reaction to the reply:', error));
        
        

      //scheduleMeetingReminder(timeString, message.channel);

        })
        .catch((error) => console.error('Error sending reply:', error));
    }
})

async function countReactions(sentMessage, timeString) {
    const collectorFilter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === sentMessage.author.id;
    }
    const checkCount = 0;
    const collector = sentMessage.createReactionCollector({filter: collectorFilter, time: 30_000});

        collector.on('collect', (reaction, user) => {
            console.log(`Collecting ${reaction.emoji.name} from ${user.tag}`);
        });

        collector.on('end', (collected) => { 
            console.log(`Collected ${collected.size} reactions.`);
        });
    

    // await sentMessage.awaitReactions({filter: collectorFilter, time: 30_000, errors: ['time']})
    // .then((collected) => {
    //     console.log(collected.size); //total size of reactions collected
        
    //     checkCount = collected.filter(reaction => reaction.emoji.name === '✅').size;
    //     //const xCount = collected.filter(reaction => reaction.emoji.name === '❌').size;

    //     console.log(checkCount);
        
    //     if (checkCount >= 1) {
    //         console.log('checkCount >= 1');
    //         scheduleMeetingReminder(timeString, sentMessage.channel)
    //     }
    // })
    // .catch(collected => {
    //     console.log(`After 10 minutes, ${collected.size} reactions were collected.`);
    // })
    return checkCount;
}

function scheduleMeetingReminder(timeString, channel) {
    const meetingTime = parseTimeString(timeString);
    const reminderTime = new Date(meetingTime.getTime() - 10 * 60 * 1000);
    const now = new Date();

    const jobSetup = schedule.scheduleJob(reminderTime, () => {
        channel.send(`@everyone Meeting reminder: The meeting is in 10 minutes!`);
    });

    const job = schedule.scheduleJob(meetingTime, () => {
        channel.send(`@everyone It's meeting time!`);
    });

    
    console.log(`Meeting scheduled for ${meetingTime}`);
    console.log(`Reminder scheduled for ${reminderTime}`);
  }
  
  function parseTimeString(timeString) {
    // Example: timeString = "20:00"
    const [hours, minutes] = timeString.split(':').map((value) => parseInt(value, 10));
  
    const meetingTime = new Date();
    meetingTime.setHours(hours);
    meetingTime.setMinutes(minutes);
    meetingTime.setSeconds(0);
    meetingTime.setMilliseconds(0);
  
    return meetingTime;
  }

client.login(process.env.TOKEN);