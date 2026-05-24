const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Events,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = (client) => {

  // =====================
  // CONFIG
  // =====================
  const PANEL_CHANNEL_ID = "1499512781861556314";

  const REALIZATOR_ROLE_ID = "1500930428993933373";

  // =====================
  // EMOJIS (twoje stare)
  // =====================
  const EMOJI = {
    ticket: "<:ticket:1501697124734206032>",
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>"
  };

  // =====================
  // CLAIM STORAGE
  // =====================
  const claimed = new Map(); // channelId -> userId

  // =====================
  // MENU
  // =====================
  function createMenu() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("🎫 Wybierz kategorię")
        .addOptions([
          {
            label: "Wymiana / Zakup",
            value: "Wymiana / Zakup",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Pomoc",
            value: "Pomoc",
            emoji: { id: "1500243961124618381" }
          },
          {
            label: "Middleman",
            value: "Middleman",
            emoji: { id: "1500243884733894716" }
          }
        ])
    );
  }

  // =====================
  // READY PANEL
  // =====================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI.ticket} StarX Exchange » TICKETY`)
        .setDescription([
          `> ${EMOJI.pin} Wybierz kategorię z menu poniżej`,
          `> ${EMOJI.zap} Szybka odpowiedź`,
          `> ${EMOJI.lock} Bezpieczny kontakt`
        ].join("\n"))
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({ text: "© 2026 StarX Exchange" })
        .setTimestamp();

      await channel.send({
        embeds: [embed],
        components: [createMenu()]
      });

      console.log("✅ Ticket panel wysłany");
    } catch (err) {
      console.log("❌ Ticket panel error:", err);
    }
  });

  // =====================
  // CREATE TICKET
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_select") return;

    try {
      const category = interaction.values[0];

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,

        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },

          // CLIENT
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles
            ]
          },

          // REALIZATORZY (OPEN)
          {
            id: REALIZATOR_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.ManageMessages
            ]
          }
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("Przejmij")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Zamknij")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content:
          `${EMOJI.pin} Nowy ticket\n` +
          `👤 ${interaction.user}\n` +
          `${EMOJI.ticket} Kategoria: **${category}**`,
        components: [row]
      });

      return interaction.reply({
        content: `✅ Ticket utworzony: ${channel}`,
        flags: 64
      });

    } catch (err) {
      console.log("❌ Create ticket error:", err);
    }
  });

  // =====================
  // BUTTONS (CLAIM + CLOSE)
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const channel = interaction.channel;

    // =====================
    // CLAIM
    // =====================
    if (interaction.customId === "claim_ticket") {

      if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie jesteś realizatorem.",
          flags: 64
        });
      }

      if (claimed.has(channel.id)) {
        return interaction.reply({
          content: "❌ Ticket już przejęty.",
          flags: 64
        });
      }

      claimed.set(channel.id, interaction.user.id);

      // ❌ usuń dostęp całej roli realizatorów
      await channel.permissionOverwrites.edit(REALIZATOR_ROLE_ID, {
        ViewChannel: false
      }).catch(() => {});

      // 🔥 dodaj tylko claimującego
      await channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        ManageMessages: true
      }).catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setDescription(`${EMOJI.zap} Ticket przejął: ${interaction.user}`);

      return interaction.reply({ embeds: [embed] });
    }

    // =====================
    // CLOSE
    // =====================
    if (interaction.customId === "close_ticket") {

      const member = await interaction.guild.members.fetch(interaction.user.id);

      if (!member.roles.cache.has(REALIZATOR_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Brak permisji.",
          flags: 64
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#ED4245")
        .setDescription(`${EMOJI.lock} Ticket zamyka się...`);

      await interaction.reply({ embeds: [embed] });

      setTimeout(async () => {
        claimed.delete(channel.id);
        await channel.delete().catch(() => {});
      }, 3000);
    }
  });
};
