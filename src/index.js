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
    
    if (message.content === 'hello') {
        message.reply('Hello! How can I assist you? ' + `${message.author.username}`)
    }
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/)
    console.log(args) //del
    const command = args.shift().toLowerCase() //shift() remove the first element of the array
    const MAX_REACTIONS = 5
    if (command === 'meeting') {
        const userList = [];
        const timeString = args[0]
        console.log(timeString) //del
        try {
            //send message to channel
            const sentMessage = await message.channel.send(`${message.author.username} wants to schedule a meeting at ${timeString}. React to this message if you can attend the meeting.`);
            //react to message
            await sentMessage.react('✅');

            //set up filter to collect reactions 
            //dont count bot's reactions
            const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;

            //set up collector with MAX_REACTIONS limit
            const collector = sentMessage.createReactionCollector({
                filter: filter,
                max: MAX_REACTIONS,
                time: 6_000
            });

            collector.on('collect', (reaction, user) => {
                console.log(`Collecting ${reaction.emoji.name} from ${user.tag}`);
                userList.push(user.tag);
            });

            //firs when the time limit or the max is reached
            collector.on('end', (collected, reason) => { 
                //reactions are no longer collected
                //if the emoji is clicked the MAX_REACTIONS times
                if (reason === 'limit') {
                    message.channel.send('Reached max number of reactions.');
                }
                else if (reason === 'time') {
                    message.channel.send('Time limit reached.');
                }
                console.log(`Collected ${collected.size} reactions.`);

                if (collected.size >= 1) {
                    console.log(userList);
                    scheduleMeetingReminder(timeString, message.channel, userList);
                }
                else {
                    message.channel.send('Not enough people to schedule a meeting.');
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
});


//Section: helper functions
function scheduleMeetingReminder(timeString, channel, userList) {
    console.log('scheduleMeetingReminder');
    const meetingTime = parseTimeString(timeString);
    const reminderTime = new Date(meetingTime.getTime() - 10 * 60 * 1000);

    const usersString = '@' + userList.join(' @');

    channel.send(`Meeting scheduled successfully for ${meetingTime} with ${usersString} `);
    //console.log(`Reminder scheduled for ${reminderTime}`);
    
    const jobSetup = schedule.scheduleJob(reminderTime, () => {
        channel.send(`Meeting reminder: The meeting is in 10 minutes! ${usersString} `);
    });

    const job = schedule.scheduleJob(meetingTime, () => {
        channel.send(` It's meeting time! ${usersString}`);
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