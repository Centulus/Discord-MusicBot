const { MessageEmbed, Message } = require("discord.js");
const { TrackUtils } = require("erela.js");
const _ = require("lodash");
const prettyMilliseconds = require("pretty-ms");

module.exports = {
  name: "search",
  description: "Affiche un résultat de chansons basé sur la requête",
  usage: "[song]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["se"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Vous devez être dans un salon vocal pour jouer quelque chose !**"
      );
      if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return client.sendTime(message.channel, ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**");

    let SearchString = args.join(" ");
    if (!SearchString)
      return client.sendTime(
        message.channel,
        `**Usage - **\`${GuildDB.prefix}search [requête]\``
      );
    let CheckNode = client.Manager.nodes.get(client.config.Lavalink.id);
    if (!CheckNode || !CheckNode.connected) {
      return client.sendTime(
        message.channel,
        "❌ | **Lavalink node non connecté**"
      );
    }
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });

    if (player.state != "CONNECTÉ") await player.connect();

    let Searched = await player.search(SearchString, message.author);
    if (Searched.loadType == "AUCUN_RÉSULTAT")
      return client.sendTime(
        message.channel,
        "Aucun résultat trouvé pour " + SearchString
      );
    else {
      Searched.tracks = Searched.tracks.map((s, i) => {
        s.index = i;
        return s;
      });
      let songs = _.chunk(Searched.tracks, 10);
      let Pages = songs.map((songz) => {
        let MappedSongs = songz.map(
          (s) =>
            `\`${s.index + 1}.\` [${s.title}](${
              s.uri
            }) \nDuration: \`${prettyMilliseconds(s.duration, {
              colonNotation: true,
            })}\``
        );

        let em = new MessageEmbed()
          .setAuthor("Résultats de la recherche pour " + SearchString, client.config.IconURL)
          .setColor("RANDOM")
          .setDescription(MappedSongs.join("\n\n"));
        return em;
      });

      if (!Pages.length || Pages.length === 1)
        return message.channel.send(Pages[0]);
      else client.Pagination(message, Pages);

      let w = (a) => new Promise((r) => setInterval(r, a));
      await w(500); //waits 500ms cuz needed to wait for the above song search embed to send ._.
      let msg = await message.channel.send(
        "**Tapez le numéro de la chanson que vous voulez jouer ! Expire dans `30 secondes`.**"
      );

      let er = false;
      let SongID = await message.channel
        .awaitMessages((msg) => message.author.id === msg.author.id, {
          max: 1,
          errors: ["temps"],
          time: 30000,
        })
        .catch(() => {
          er = true;
          msg.edit(
            "**Vous avez mis trop de temps à répondre. Exécutez à nouveau la commande si vous voulez jouer quelque chose !**"
          );
        });
      if (er) return;
      /**@type {Message} */
      let SongIDmsg = SongID.first();

      if (!parseInt(SongIDmsg.content))
        return client.sendTime(message.channel, "Veuillez envoyer un numéro correct");
      let Song = Searched.tracks[parseInt(SongIDmsg.content) - 1];
      if (!Song) return client.sendTime(message.channel, "Aucune chanson trouvée pour le numéro donné");
      player.queue.add(Song);
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      let SongAddedEmbed = new MessageEmbed();
      SongAddedEmbed.setAuthor(`Ajouté à la playlist`, client.config.IconURL);
      SongAddedEmbed.setThumbnail(Song.displayThumbnail());
      SongAddedEmbed.setColor("RANDOM");
      SongAddedEmbed.setDescription(`[${Song.title}](${Song.uri})`);
      SongAddedEmbed.addField("Auteur", `${Song.author}`, true);
      SongAddedEmbed.addField(
        "Duration",
        `\`${prettyMilliseconds(player.queue.current.duration, {
          colonNotation: true,
        })}\``,
        true
      );
      if (player.queue.totalSize > 1)
        SongAddedEmbed.addField(
          "Position in queue",
          `${player.queue.size - 0}`,
          true
        );
      message.channel.send(SongAddedEmbed);
    }
  },

  SlashCommand: {
    options: [
      {
        name: "chanson",
        value: "chanson",
        type: 3,
        required: true,
        description: "Entrez le nom de la chanson ou l'url que vous voulez rechercher.",
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
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Vous devez être dans un salon vocal pour utiliser cette commande.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          ":x: | **Vous devez être dans le même salon vocal que moi pour utiliser cette commande !**"
        );
      let CheckNode = client.Manager.nodes.get(client.config.Lavalink.id);
      if (!CheckNode || !CheckNode.connected) {
        return client.sendTime(
          interaction,
          "❌ | **Lavalink node non connecté**"
        );
      }
      let player = client.Manager.create({
        guild: interaction.guild_id,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channel_id,
        selfDeafen: false,
      });
      if (player.state != "CONNECTÉ") await player.connect();
      let search = interaction.data.options[0].value;
      let res;

      if (search.match(client.Lavasfy.spotifyPattern)) {
        await client.Lavasfy.requestToken();
        let node = client.Lavasfy.nodes.get(client.config.Lavalink.id);
        let Searched = await node.load(search);

        switch (Searched.loadType) {
          case "ECHEC_DU_CHARGEMENT":
            if (!player.queue.current) player.destroy();
            return client.sendError(interaction, `:x: | **Il y a eu une erreur lors de la recherche**`);

          case "AUCUN_RÉSULTAT":
            if (!player.queue.current) player.destroy();
            return client.sendTime(interaction, ":x: | **Aucun résultat n'a été trouvé**");
          case "PISTE_CHARGÉE":
            player.queue.add(TrackUtils.build(Searched.tracks[0], member.user));
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            return client.sendTime(
              interaction, `**Ajouté à la playlist:** \`[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri}}\`.`
            );

          case "PLAYLIST_CHARGÉE":
            let songs = [];
            for (let i = 0; i < Searched.tracks.length; i++)
              songs.push(TrackUtils.build(Searched.tracks[i], member.user));
            player.queue.add(songs);

            if (
              !player.playing &&
              !player.paused &&
              player.queue.totalSize === Searched.tracks.length
            )
              player.play();
            return client.sendTime(
              interaction, `**Playlist ajoutée à la file d'attente**: \n**${Searched.playlist.name}** \nEn file d'attente: **${Searched.playlistInfo.length} chansons**`
            );
        }
      } else {
        try {
          res = await player.search(search, member.user);
          if (res.loadType === "ECHEC_DU_CHARGEMENT") {
            if (!player.queue.current) player.destroy();
            throw new Error(res.exception.message);
          }
        } catch (err) {
          return client.sendTime(
            interaction, `:x: | **Il y a eu une erreur lors de la recherche:** ${err.message}`
          );
        }
        switch (res.loadType) {
          case "AUCUN_RÉSULTAT":
            if (!player.queue.current) player.destroy();
            return client.sendTime(interaction, ":x: | **Aucun résultat n'a été trouvé**");
          case "PISTE_CHARGÉE":
            player.queue.add(res.tracks[0]);
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            return client.sendTime(
              interaction, `**Ajouté à la playlist:** \`[${res.tracks[0].title}](${res.tracks[0].uri})\`.`
            );
          case "PLAYLIST_CHARGÉE":
            player.queue.add(res.tracks);

            if (
              !player.playing &&
              !player.paused &&
              player.queue.size === res.tracks.length
            )
              player.play();
            return client.sendTime(
              interaction, `**Playlist ajoutée à la file d'attente**: \n**${res.playlist.name}** \nEn file d'attente: **${res.playlistInfo.length} chansons**`
            );
          case "RÉSULTATS":
            let max = 10,
              collected,
              filter = (m) =>
                m.author.id === interaction.member.user.id &&
                /^(\d+|end)$/i.test(m.content);
            if (res.tracks.length < max) max = res.tracks.length;

            const results = res.tracks
              .slice(0, max)
              .map(
                (track, index) =>
                  `\`${++index}\` - [${track.title}](${
                    track.uri
                  }) \n\t\`${prettyMilliseconds(track.duration, {
                    colonNotation: true,
                  })}\`\n`
              )
              .join("\n");

            const resultss = new MessageEmbed()
              .setDescription(
                `${results}\n\n\t**Tapez le numéro de la chanson que vous voulez lire !**\n`
              )
              .setColor("RANDOM")
              .setAuthor(`Résultats de la recherche pour ${search}`, client.config.IconURL);
            interaction.send(resultss);
            try {
              collected = await awaitchannel.awaitMessages(filter, {
                max: 1,
                time: 30e3,
                errors: ["temps"],
              });
            } catch (e) {
              if (!player.queue.current) player.destroy();
              return awaitchannel.send(
                "❌ | **Vous n'avez pas fourni de sélection**"
              );
            }

            const first = collected.first().content;

            if (first.toLowerCase() === "annuler") {
              if (!player.queue.current) player.destroy();
              return awaitchannel.send("Recherche annulée.");
            }

            const index = Number(first) - 1;
            if (index < 0 || index > max - 1)
              return awaitchannel.send(
                `Le nombre que vous avez fourni est supérieur ou inférieur au total de la recherche.. Usage - \`(1-${max})\``
              );
            const track = res.tracks[index];
            player.queue.add(track);

            if (!player.playing && !player.paused && !player.queue.length) {
              player.play();
            } else {
              let SongAddedEmbed = new MessageEmbed();
              SongAddedEmbed.setAuthor(`Added to queue`, client.config.IconURL);
              SongAddedEmbed.setThumbnail(track.displayThumbnail());
              SongAddedEmbed.setColor("RANDOM");
              SongAddedEmbed.setDescription(`[${track.title}](${track.uri})`);
              SongAddedEmbed.addField("Auteur", track.author, true);
              SongAddedEmbed.addField(
                "Duration",
                `\`${prettyMilliseconds(track.duration, {
                  colonNotation: true,
                })}\``,
                true
              );
              if (player.queue.totalSize > 1) SongAddedEmbed.addField("Position in queue", `${player.queue.size - 0}`, true);
              awaitchannel.send(SongAddedEmbed);
            }
        }
      }
    },
  },
};
