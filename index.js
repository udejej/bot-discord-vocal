const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');

// 👉 Ton token est stocké dans Render sous le nom "TOKEN"
const DISCORD_TOKEN = process.env.TOKEN;

// Remplace par les bons IDs :
const GUILD_ID = '1306293608223346808';
const VOICE_CHANNEL_ID = '1306301103373029408';
const AUDIO_PATH = path.join(__dirname, 'son.mp3');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

  const connection = joinVoiceChannel({
    channelId: VOICE_CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator
  });

  const player = createAudioPlayer();

  const playSound = () => {
    const resource = createAudioResource(AUDIO_PATH);
    player.play(resource);
  };

  player.on(AudioPlayerStatus.Idle, () => {
    playSound(); // Relance le son automatiquement
  });

  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('🔊 Connecté au salon vocal');
    playSound();
  });

  connection.on('error', console.error);
  player.on('error', console.error);
});

client.login(DISCORD_TOKEN);

// Ce bloc fait croire à Render que l'app écoute un port
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Discord en ligne ✅');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Serveur HTTP actif sur le port ${PORT}`);
});