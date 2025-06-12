const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const path = require('path');
const sodium = require('libsodium-wrappers'); // Pour la crypto audio

const DISCORD_TOKEN = process.env.TOKEN;
const GUILD_ID = '1306293608223346808';
const VOICE_CHANNEL_ID = '1306301103373029408';
const AUDIO_PATH = path.join(__dirname, 'son.mp3');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

(async () => {
  await sodium.ready;
  console.log('libsodium prêt');
})();

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

  // Rejoue le son si le player est idle et si la connexion est prête
  player.on(AudioPlayerStatus.Idle, () => {
    if (connection.state.status === VoiceConnectionStatus.Ready) {
      playSound();
    } else {
      console.log('Connection pas prête, attente...');
    }
  });

  // Gérer les erreurs du player
  player.on('error', error => {
    console.error('Erreur du player audio:', error);
  });

  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('🔊 Connecté au salon vocal');
    playSound();
  });

  // Gérer les erreurs de connexion
  connection.on('error', error => {
    console.error('Erreur de connexion vocale:', error);
  });

  // Gestion reconnexion automatique en cas de déconnexion
  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await entersState(connection, VoiceConnectionStatus.Signalling, 5000);
      await entersState(connection, VoiceConnectionStatus.Connecting, 5000);
      console.log('Tentative de reconnexion réussie');
    } catch (error) {
      console.log('Échec de reconnexion, destruction de la connexion');
      connection.destroy();
    }
  });
});

client.login(DISCORD_TOKEN);

// Serveur HTTP pour Render
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Discord en ligne ✅');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Serveur HTTP actif sur le port ${PORT}`);
});