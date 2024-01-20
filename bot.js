import fetch from "node-fetch";
import cron from "node-cron";
import * as fs from 'fs';

const DISCORD_API_ROOT_URL = 'https://discord.com/api';

const DISCORD_BOT_CONFIGURATION = JSON.parse(process.env.DISCORD_BOT_CONFIGURATION);
const {
    DISCORD_BOT_AUTH_TOKEN,
    DISCORD_BOT_TEACHER_MESSAGE,
    DISCORD_BOT_STUDENT_MESSAGE,
    DISCORD_BOT_CHANNELS_CONFIGURATION,
    DISCORD_BOT_ADMIN_CHANNEL_ID
} = DISCORD_BOT_CONFIGURATION;

Object.keys(DISCORD_BOT_CHANNELS_CONFIGURATION).forEach(teamKey => {
    cron.schedule(DISCORD_BOT_CHANNELS_CONFIGURATION[teamKey].ADMIN_CRON, () => {
        fetch(DISCORD_API_ROOT_URL + `/channels/${DISCORD_BOT_ADMIN_CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': DISCORD_BOT_AUTH_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'content': DISCORD_BOT_TEACHER_MESSAGE.replace('{team}', DISCORD_BOT_CHANNELS_CONFIGURATION[teamKey].ROLE_ID)
            })
        })
            .then(res => res.json())
            .then(res => {
                const message = `[${new Date().toISOString()}] Logged teacher message for Team ${teamKey}.`;
                fs.appendFile('log.txt', message + '\r\n', (err) => {
                    if(err) {
                        console.log('Failed to create a log... ' + err);
                        return;
                    }

                    console.log('[' + new Date().toISOString() + '] ' + 'Log saved successfully.' );
                })
            }).catch(err => console.log(err));
    });

    cron.schedule(DISCORD_BOT_CHANNELS_CONFIGURATION[teamKey].CRON, () => {
        fetch(DISCORD_API_ROOT_URL + `/channels/${DISCORD_BOT_CHANNELS_CONFIGURATION[teamKey].DISCORD_CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': DISCORD_BOT_AUTH_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'content': DISCORD_BOT_STUDENT_MESSAGE.replace('{team}', DISCORD_BOT_CHANNELS_CONFIGURATION[teamKey].ROLE_ID)
            })
        })
            .then(res => res.json())
            .then(res => {
                const message = `[${new Date().toISOString()}] Logged student message for Team ${teamKey}.`;
                fs.appendFile('log.txt', message + '\r\n', (err) => {
                    if(err) {
                        console.log('Failed to create a log... ' + err);
                        return;
                    }

                    console.log('[' + new Date().toISOString() + '] ' + 'Log saved successfully.' );
                })
            }).catch(err => console.log(err));
    });
});