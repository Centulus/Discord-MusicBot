const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

  module.exports = {
    name: "remove",
    description: `Retirer une chanson de la playlist`,
    usage: "[nombre]",
    permissions: {
      channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
      member: [],
    },
    aliases: ["rm"],

    /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.players.get(message.guild.id);
    const song = player.queue.slice(args[0] - 1, 1); 
    if (!player) return client.sendTime(message.channel, "❌ | **Rien n'est joué actuellement...**");
    if (!message.member.voice.channel) return client.sendTime(message.channel, "❌ | **Vous devez être dans un salon vocal pour utiliser cette commande !**");
    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return client.sendTime(message.channel, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande.!**");
        
    if (!player.queue || !player.queue.length || player.queue.length === 0)
      return message.channel.send("Il n'y a rien à supprimer dans la playlist");
    let rm = new MessageEmbed()
      .setDescription(`✅ **|** Piste suprimée **\`${Number(args[0])}\`** de la playlist !`)
      .setColor("GREEN")
      if (isNaN(args[0]))rm.setDescription(`**Usage - **${client.config.prefix}\`supprimer [piste]\``);
      if (args[0] > player.queue.length)
      rm.setDescription(`La playlist à seulement ${player.queue.length} chansons !`);
    await message.channel.send(rm);
    player.queue.remove(Number(args[0]) - 1);
  },

  SlashCommand: {
    options: [
      {
          name: "piste",
          value: "[piste]",
          type: 4,
          required: true,
          description: "Retirer une chanson de la playlist",
      },
  ],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
    run: async (client, interaction, args, { GuildDB }) => {
      let player = await client.Manager.get(interaction.guild_id);
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const song = player.queue.slice(args[0] - 1, 1);
      if (!player) return client.sendTime(interaction, "❌ | **Rien n'est joué actuellement...**");
      if (!member.voice.channel) return client.sendTime(interaction, "❌ | **Vous devez être dans un salon vocal pour utiliser cette commande..**");
      if (guild.me.voice.channel && !guild.me.voice.channel.equals(member.voice.channel)) return client.sendTime(interaction, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande.!**");
  
      if (!player.queue || !player.queue.length || player.queue.length === 0)
      return client.sendTime("❌ | **Rien n'est joué actuellement...**");
      let rm = new MessageEmbed()
        .setDescription(`✅ | **Piste supprimée** \`${Number(args[0])}\` de la playlist !`)
        .setColor("GREEN")
      if (isNaN(args[0])) rm.setDescription(`**Usage:** \`${GuildDB.prefix}suprimmer [piste]\``);
      if (args[0] > player.queue.length)
        rm.setDescription(`La playlist à seulement ${player.queue.length} chansons !`);
      await interaction.send(rm);
      player.queue.remove(Number(args[0]) - 1);
    },
  }
};
