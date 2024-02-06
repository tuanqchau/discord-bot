
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

const prefix = '!';
client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`)
})

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/)
    console.log(args) //del
    const command = args.shift().toLowerCase() //shift() remove the first element of the array
    const MAX_REACTIONS = 6
    if (message.content === 'hello') {
        message.reply('What\'s up ' + `${message.author.username}`)
    }

    if (command === 'meeting') {
        const timeString = args[0]
        console.log(timeString) //del
        try {
            //send message to channel
            const sentMessage = await message.channel.send('React to this');
            //react to message
            await sentMessage.react('✅');

            //set up filter to collect reactions 
            //dont count bot's reactions
            const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;

            //set up collector with MAX_REACTIONS limit
            const collector = sentMessage.createReactionCollector({
                filter: filter,
                max: MAX_REACTIONS,
                time: 5_000
            });

            collector.on('collect', (reaction, user) => {
                console.log(`Collecting ${reaction.emoji.name} from ${user.tag}`);
            });

            //firs when the time limit or the max is reached
            collector.on('end', (collected, reason) => { 
                //reactions are no longer collected
                //if the emoji is clicked the MAX_REACTIONS times
                if (reason === 'limit') {
                    message.channel.send('reached max count of reactions');
                }
                else if (reason === 'time') {
                    message.channel.send('time limit reached');
                }
                console.log(`Collected ${collected.size} reactions.`);

                if (collected.size >= 1) {
                    
                    scheduleMeetingReminder(timeString, message.channel);
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
});

function testFunct() {
    
}
//Section: helper functions
// async function countReactions(sentMessage, timeString) {
//     const collectorFilter = (reaction, user) => {
//         return ['✅', '❌'].includes(reaction.emoji.name) && user.id === sentMessage.author.id;
//     }
//     const checkCount = 0;
//     const collector = sentMessage.createReactionCollector({filter: collectorFilter, time: 30_000});

//         collector.on('collect', (reaction, user) => {
//             console.log(`Collecting ${reaction.emoji.name} from ${user.tag}`);
//         });

//         collector.on('end', (collected) => { 
//             console.log(`Collected ${collected.size} reactions.`);
//         });
    

//     // await sentMessage.awaitReactions({filter: collectorFilter, time: 30_000, errors: ['time']})
//     // .then((collected) => {
//     //     console.log(collected.size); //total size of reactions collected
        
//     //     checkCount = collected.filter(reaction => reaction.emoji.name === '✅').size;
//     //     //const xCount = collected.filter(reaction => reaction.emoji.name === '❌').size;

//     //     console.log(checkCount);
        
//     //     if (checkCount >= 1) {
//     //         console.log('checkCount >= 1');
//     //         scheduleMeetingReminder(timeString, sentMessage.channel)
//     //     }
//     // })
//     // .catch(collected => {
//     //     console.log(`After 10 minutes, ${collected.size} reactions were collected.`);
//     // })
//     return checkCount;
// }

function scheduleMeetingReminder(timeString, channel) {
    console.log('scheduleMeetingReminder');
    const meetingTime = parseTimeString(timeString);
    const reminderTime = new Date(meetingTime.getTime() - 10 * 60 * 1000);
    console.log(meetingTime + " " + reminderTime + " " + channel);

    console.log(`Meeting scheduled for ${meetingTime}`);
    console.log(`Reminder scheduled for ${reminderTime}`);

    const jobSetup = schedule.scheduleJob(reminderTime, () => {
        channel.send(`@everyone Meeting reminder: The meeting is in 10 minutes!`);
    });

    const job = schedule.scheduleJob(meetingTime, () => {
        channel.send(`@everyone It's meeting time!`);
    });

    
    
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