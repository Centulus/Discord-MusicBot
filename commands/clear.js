const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "clear",
  description: "Éffacer une playlist du serveur",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["cl", "cls"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.get(message.guild.id);
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Rien n'est joué actuellement...**"
      );

    if (!player.queue || !player.queue.length || player.queue.length === 0)
      return client.sendTime(message.channel, "❌ | **Rien n'est joué actuellement...**");
      if (!message.member.voice.channel) return client.sendTime(message.channel, "❌ | **Vous devez être dans un salon vocal pour jouer quelque chose !**");
      if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return client.sendTime(message.channel, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**");
    player.queue.clear();
    await client.sendTime(message.channel, "✅ | **Playlist effacée!**");
  },

  SlashCommand: {
    /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      if (!member.voice.channel) return client.sendTime(interaction, "❌ | Vous devez être dans un salon vocal pour utiliser cette commande.");
      if (guild.me.voice.channel && !guild.me.voice.channel.equals(member.voice.channel)) return client.sendTime(interaction, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**");
      let player = await client.Manager.get(interaction.guild_id);
      if (!player)
        return client.sendTime(interaction, "❌ | **Rien n'est joué actuellement...**");

      if (!player.queue || !player.queue.length || player.queue.length === 0)
        return client.sendTime(interaction, "❌ | **Rien n'est joué actuellement...**");
      player.queue.clear();
      await client.sendTime(interaction, "✅ | **Playlist effacée!**");
    },
  },
};
