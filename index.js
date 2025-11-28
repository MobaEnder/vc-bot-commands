async function connect(channel) {
  targetChannel = channel;

  console.log("🔌 Joining voice channel:", channel.id);

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: false,
    encryptionModes: [
      "aead_aes256_gcm_rtpsize",
      "aead_xchacha20_poly1305_rtpsize",
    ],
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log("🟢 Voice ready");
    playSilentAudio(connection);
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.log("⚠️ Disconnected → attempting recovery...");
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5000),
      ]);
      console.log("🔄 Recovered without full reconnect");
    } catch {
      console.log("❌ Failed to recover → destroying and rejoining");
      connection.destroy();
      setTimeout(() => connect(targetChannel), 1000);
    }
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log("💀 Connection destroyed → Rejoin in 2s");
    setTimeout(() => connect(targetChannel), 2000);
  });

  return connection;
}
