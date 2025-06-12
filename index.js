const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');
const { createReadStream } = require('fs');
const { spawn } = require('child_process');
const http = require('http');

require('dotenv').config();

const DISCORD_TOKEN = process.env.TOKEN;
const GUILD_ID = '1306293608223346808';
const VOICE_CHANNEL_ID = '1306301103373029408';
const AUDIO_PATH = path.join(__dirname, 'son.mp3');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
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

  // ⏺️ Stream ffmpeg infini
  const playLoop = () => {
    const ffmpeg = spawn('ffmpeg', [
      '-stream_loop', '-1', // boucle infinie
      '-i', AUDIO_PATH,
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1'
    ]);

    const resource = createAudioResource(ffmpeg.stdout, {
      inputType: StreamType.Raw
    });

    player.play(resource);
  };

  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('🔊 Connecté au salon vocal');
    playLoop();
  });

  connection.on('error', console.error);
  player.on('error', console.error);
});

// 🔒 HTTP pour Render
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Discord vocal en ligne ✅');
}).listen(PORT, () => {
  console.log(`🌐 Serveur HTTP actif sur le port ${PORT}`);
});

client.login(DISCORD_TOKEN);