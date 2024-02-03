// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const schedule = require('node-schedule');

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

        // Parse the time and schedule the meeting reminder
        scheduleMeetingReminder(timeString, message.channel);
    }
})

function scheduleMeetingReminder(timeString, channel) {
    // Parse the time string to a Date object
    const meetingTime = parseTimeString(timeString);
  
    // Calculate the reminder time (10 minutes before the meeting)
    const reminderTime = new Date(meetingTime.getTime() - 10 * 60 * 1000);
  
    // Schedule the reminder job
    const job = schedule.scheduleJob(reminderTime, () => {
      // Send a reminder message to the specified channel
      channel.send(`@everyone Meeting reminder: The meeting is in 10 minutes!`);
    });
  
    console.log(`Meeting scheduled for ${meetingTime}`);
    console.log(`Reminder scheduled for ${reminderTime}`);
  }
  
  function parseTimeString(timeString) {
    // Example: timeString = "20:00"
    const [hours, minutes] = timeString.split(':').map((value) => parseInt(value, 10));
  
    // Set the meeting time to today at the specified hours and minutes
    const meetingTime = new Date();
    meetingTime.setHours(hours);
    meetingTime.setMinutes(minutes);
    meetingTime.setSeconds(0);
    meetingTime.setMilliseconds(0);
  
    return meetingTime;
  }


// Log in to Discord with your client's token
client.login(process.env.TOKEN);