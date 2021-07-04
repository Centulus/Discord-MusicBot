const { MessageEmbed } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");

module.exports = {
  name: "skipto",
  description: `Passer à une chanson dans la playlist`,
  usage: "<numéro>",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["st"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });

    if (!player) return client.sendTime(message.channel, "❌ | **Rien n'est joué actuellement...**");
    if (!message.member.voice.channel) return client.sendTime(message.channel, "❌ | **Vous devez être dans un salon vocal pour utiliser cette commande !**");
    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return client.sendTime(message.channel, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**");

    try {
      if (!args[0]) return client.sendTime(message.channel, `**Usage**: \`${GuildDB.prefix}skipto [numéro]\``);
      //if the wished track is bigger then the Queue Size
      if (Number(args[0]) > player.queue.size) return client.sendTime(message.channel, `❌ | Cette chanson n'est pas dans la playlist ! Veuillez réessayer !`);
      //remove all tracks to the jumped song
      player.queue.remove(0, Number(args[0]) - 1);
      //stop the player
      player.stop();
      //Send Success Message
      return client.sendTime(message.channel, `⏭ Passé \`${Number(args[0] - 1)}\` chanson`);
    } catch (e) {
      console.log(String(e.stack).bgRed);
      client.sendError(message.channel, "Quelque chose a mal tourné.");
    }
  },
  SlashCommand: {
    options: [
      {
        name: "position",
        value: "[position]",
        type: 4,
        required: true,
        description: "Passe à une chanson spécifique dans la playlist",
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
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const voiceChannel = member.voice.channel;
      let awaitchannel = client.channels.cache.get(interaction.channel_id); /// thanks Reyansh for this idea ;-;
      if (!member.voice.channel) return client.sendTime(interaction, "❌ | **Vous devez être dans un salon vocal pour utiliser cette commande !**");
      if (guild.me.voice.channel && !guild.me.voice.channel.equals(member.voice.channel)) return client.sendTime(interaction, `:x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**`);
      let CheckNode = client.Manager.nodes.get(client.config.Lavalink.id);
      if (!CheckNode || !CheckNode.connected) {
        return client.sendTime(interaction, "❌ | **Lavalink node non connecté**");
      }

      let player = client.Manager.create({
        guild: interaction.guild_id,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channel_id,
        selfDeafen: false,
      });

      try {
        if (!interaction.data.options) return client.sendTime(interaction, `**Usage**: \`${GuildDB.prefix}skipto <number>\``);
        let skipTo = interaction.data.options[0].value;
        //if the wished track is bigger then the Queue Size
        if (skipTo !== null && (isNaN(skipTo) || skipTo < 1 || skipTo > player.queue.length)) return client.sendTime(interaction, `❌ | Cette chanson n'est pas dans la playlist ! Veuillez réessayer !`);

        player.stop(skipTo);
        //Send Success Message
        return client.sendTime(interaction, `⏭ Passé \`${Number(skipTo)}\` chansons`);
      } catch (e) {
        console.log(String(e.stack).bgRed);
        client.sendError(interaction, "Quelque chose a mal tourné.");
      }
    },
  },
};
