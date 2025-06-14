const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');
const http = require('http');
const sodium = require('libsodium-wrappers');

(async () => {
  await sodium.ready;
})();

const DISCORD_TOKEN = process.env.TOKEN;

const GUILD_ID = '1293654645906083880';
const VOICE_CHANNEL_ID = '1300525691367981117';
const AUDIO_PATHS = [
  path.join(__dirname, 'son.mp3'),
  path.join(__dirname, 'son2.mp3')
];

let currentIndex = 0;

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
    const resource = createAudioResource(AUDIO_PATHS[currentIndex]);
    player.play(resource);
    console.log(`▶️ Lecture de : ${AUDIO_PATHS[currentIndex]}`);
    currentIndex = (currentIndex + 1) % AUDIO_PATHS.length;

    setTimeout(() => {
      if (player.state.status === AudioPlayerStatus.Idle) {
        console.log('🔁 Redémarrage de secours du son');
        playSound();
      }
    }, 5000);
  };

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('🔄 Son terminé, relance');
    playSound();
  });

  player.on('error', error => {
    console.error('❌ Erreur player :', error);
    player.stop();
    playSound();
  });

  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('🔊 Connecté au salon vocal');
    playSound();
  });

  connection.on('error', console.error);
});

client.login(DISCORD_TOKEN);

// 🌐 Serveur HTTP
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Discord en ligne ✅');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Serveur HTTP actif sur le port ${PORT}`);
});