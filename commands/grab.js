const { MessageEmbed } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");

module.exports = {
  name: "grab",
  description: "Enregistre la chanson en cours dans vos messages directs (DM)",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["save"],
/**
*
* @param {import("../structures/DiscordMusicBot")} client
* @param {import("discord.js").Message} message
* @param {string[]} args
* @param {*} param3
*/
run: async (client, message, args, { GuildDB }) => {
  let player = await client.Manager.get(message.guild.id);
  if (!player) return client.sendTime(message.channel, "❌ | **Rien n'est joué actuellement...**");
  if (!message.member.voice.channel) return client.sendTime(message.channel, "❌ | **Vous devez être dans un salon vocal pour jouer quelque chose !**");
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return client.sendTime(message.channel, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**");
   message.author.send(new MessageEmbed()
   .setAuthor(`Chanson sauvegardée`, client.user.displayAvatarURL({
    dynamic: true
  }))
  .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
  .setURL(player.queue.current.uri)
  .setColor("RANDOM")
  .setTitle(`**${player.queue.current.title}**`)
  .addField(`⌛ Durée: `, `\`${prettyMilliseconds(player.queue.current.duration, {colonNotation: true})}\``, true)
  .addField(`🎵 Auteur: `, `\`${player.queue.current.author}\``, true)
  .addField(`▶ Jouez-le:`, `\`${GuildDB ? GuildDB.prefix : client.config.DefaultPrefix
  }play ${player.queue.current.uri}\``)
  .addField(`🔎 Sauvegardée dans:`, `<#${message.channel.id}>`)
  .setFooter(`Demandé par: ${player.queue.current.requester.tag}`, player.queue.current.requester.displayAvatarURL({
    dynamic: true
  }))
    ).catch(e=>{
      return message.channel.send("**:x: Vos DMs sont désactivés**")
    })    

    client.sendTime(message.channel, "✅ | **Vérifiez vos DMs !**")
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
    const user = client.users.cache.get(interaction.member.user.id);
    const member = guild.members.cache.get(interaction.member.user.id);
    let player = await client.Manager.get(interaction.guild_id);
    if (!player) return client.sendTime(interaction, "❌ | **Rien n'est joué actuellement**");
    if (!member.voice.channel) return client.sendTime(interaction, "❌ | **Vous devez être dans un salon vocal pour utiliser cette commande.**");
    if (guild.me.voice.channel && !guild.me.voice.channel.equals(member.voice.channel)) return client.sendTime(interaction, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**");
    try{
    let embed = new MessageEmbed()
      .setAuthor(`Chanson sauvegardée: `, client.user.displayAvatarURL())
      .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
      .setURL(player.queue.current.uri)
      .setColor("RANDOM")
      .setTimestamp()
      .setTitle(`**${player.queue.current.title}**`)
      .addField(`⌛ Durée: `, `\`${prettyMilliseconds(player.queue.current.duration, {colonNotation: true})}\``, true)
      .addField(`🎵 Auteur: `, `\`${player.queue.current.author}\``, true)
      .addField(`▶ Jouez-le:`, `\`${GuildDB ? GuildDB.prefix : client.config.DefaultPrefix
        }play ${player.queue.current.uri}\``)
      .addField(`🔎 Sauvegardée dans:`, `<#${interaction.channel_id}>`)
      .setFooter(`Demandé par: ${player.queue.current.requester.tag}`, player.queue.current.requester.displayAvatarURL({
        dynamic: true
      }))
      user.send(embed);
    }catch(e) {
      return client.sendTime(interaction, "**:x: Vos DMs sont désactivés**")
    }

    client.sendTime(interaction, "✅ | **Vérifiez vos DMs!**")
  },
  },
};
