
const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const schedule = require('node-schedule');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.MessageEmbeds,
        GatewayIntentBits.MessageReactions,
        GatewayIntentBits.MessageTyping,
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
        message.reply('Meeting scheduled at ' + `${timeString}` + '\nPoll ends in 10 minutes.')
        //+ '\nReact with ✅ if you are attending and ❌ if not'
        .then((sentMessage) => {
            const reactions = ['✅', '❌'];

            Promise.all(reactions.map(emoji => sentMessage.react(emoji)))
        .then(() => {countReactions(sentMessage)}) //passing in current time
        .catch((error) => console.error('Error adding reaction to the reply:', error));
        
        

      //scheduleMeetingReminder(timeString, message.channel);

    })
    .catch((error) => console.error('Error sending reply:', error));
    }
})

function countReactions(sentMessage) {
    const collectorFilter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === sentMessage.author.id;
    }
    const checkCount = 0;

    sentMessage.awaitReactions({filter: collectorFilter, time: 600_000, errors: ['time']})
    .then((collected) => {
        console.log(collected.size); //total size of reactions collected
        
        checkCount = collected.filter(reaction => reaction.emoji.name === '✅').size;
        //const xCount = collected.filter(reaction => reaction.emoji.name === '❌').size;

        console.log(checkCount);
        
        if (checkCount >= 3) {
            
        }
    })
    .catch(collected => {
        console.log(`After 10 minutes, only ${collected.size} reactions were collected.`);
    })
    return checkCount;
}
// function PollStart(startTime, sentMessage) {
//     console.log('Poll started!');
//     const pollEndTime = new Date(startTime.getTime() + 10 * 60 * 1000);
//     const reactCount = 0;
//     schedule.scheduleJob(pollEndTime, () => { //
//         console.log('Poll ended!');
//         //count reactions here

//     });

//     return reactCount;
// }
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