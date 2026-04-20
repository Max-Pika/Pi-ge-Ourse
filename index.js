const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const trapChannelId = "MET TON ID ICI"; // IMPORTANT

client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === trapChannelId) {
    try {
      await message.member.kick("Piège à ourse déclenché");
      console.log(`${message.author.tag} a été kick`);
    } catch (err) {
      console.log("Erreur kick:", err);
    }
  }
});

client.login(process.env.TOKEN);
