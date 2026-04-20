const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const userMessages = new Map();

client.on('clientReady', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.member) return;

  console.log("Message reçu dans :", message.channel.id);

  const member = message.member;

  // WHITELIST
  if (member.roles.cache.some(role => config.whitelistRoles.includes(role.id))) return;

  const now = Date.now();
  const userId = message.author.id;

  // SALON PIÈGE
  if (message.channel.id === config.trapChannelId) {
    sanction(member, "Piège anti-spam déclenché", message);
    return;
  }

  // TRACK MESSAGES
  if (!userMessages.has(userId)) {
    userMessages.set(userId, []);
  }

  const messages = userMessages.get(userId);
  messages.push({ time: now, channel: message.channel.id });

  const recent = messages.filter(m => now - m.time < config.spam.timeWindow);
  userMessages.set(userId, recent);

  const uniqueChannels = new Set(recent.map(m => m.channel));

  if (
    recent.length >= config.spam.maxMessages &&
    uniqueChannels.size >= config.spam.minChannels
  ) {
    sanction(member, "Spam multi-salons détecté", message);
    userMessages.delete(userId);
  }
});

async function sanction(member, reason, message) {
  try {
    if (config.spam.punishment === "ban") {
      if (member.bannable) {
        await member.ban({ reason });
      }
    } else {
      if (member.kickable) {
        await member.kick(reason);
      }
    }

    const logChannel = message.guild.channels.cache.get(config.logChannelId);
    if (logChannel) {
      logChannel.send(`🚨 ${member.user.tag} sanctionné → ${reason}`);
    }

  } catch (err) {
    console.error("Erreur sanction :", err);
  }
}

// 🔐 TOKEN VIA VARIABLE D'ENVIRONNEMENT
client.login(process.env.TOKEN);