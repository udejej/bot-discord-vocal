const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const GUILD_ID = '1306293608223346808'; // Remplace par l'ID de ton serveur
const VOICE_CHANNEL_ID = '1306301103373029408'; // Remplace par l'ID du salon vocal
const AUDIO_PATH = path.join(__dirname, 'son.mp3'); // Ton fichier audio

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
    playSound(); // Relance le son à la fin
  });

  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('🔊 Connecté au salon vocal');
    playSound();
  });

  connection.on('error', console.error);
  player.on('error', console.error);
});

client.login(process.env.TOKEN);