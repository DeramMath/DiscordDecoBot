require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const Config = require('./config.js');
const UserManager = require('./user_manager.js');
const UserDeco = require('./user_deco.js');

//const tc = require('./time_conversion.js');
function min_to_sec(m) { return m*60; }
function min_to_milli(m) { return sec_to_milli(min_to_sec(m)); }

function sec_to_milli(s) { return s*1000; }
function sec_to_min(s) { return s/60; }

function milli_to_sec(mi) { return mi/1000; }
function milli_to_min(mi) { return milli_to_sec(sec_to_min(mi)); }

const CANCEL_NOTHING_MESSAGE = 'Nothing to cancel';

const user_manager = new UserManager();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const config = new Config(msg.content);

    if (config.isValid()) {
        handle_deco(config.args, msg);
    }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (isInVoiceChannel(newMember)) {
        const user = user_manager.get(newMember.id);
        if (user == null) { return; }
        console.log("reconnected");
        user.hasReconnected()
    } else if (isInVoiceChannel(oldMember)) {
        const user = user_manager.get(newMember.id);
        if (user == null) { return; }
        console.log("disconnected");
        user.hasDisconnected()
    }
});

function handle_deco(args, msg) {
    if (args.cancel == true) {
        let user = user_manager.get(msg.member);
        if (user == null) {
            this.msg.reply(CANCEL_NOTHING_MESSAGE);
        } else {
            user.cancel()
        }
    } else if (args.time != null) {
        let user_to_deco = new UserDeco(
            user_manager,
            msg,
            min_to_milli(args.time),
            args.force,
            args.ulti
        );
        user_to_deco.init();
        user_manager.push(user_to_deco);
    }
}

function isInVoiceChannel(member) {
    return member.channelID != null;
}

client.login(process.env.DISCORD_API_KEY);