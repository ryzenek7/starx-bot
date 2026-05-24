const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Events,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

  // =====================
  // CONFIG
  // =====================
  const PANEL_CHANNEL_ID = "1499512781861556314";

  const REALIZATOR_ROLE_ID = "1500930428993933373";

  // =====================
  // EMOJIS
  // =====================
  const EMOJI = {
    ticket: "<:ticket:1501697124734206032>",
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>"
  };

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
        .setDescription(
          [
            `> ${EMOJI.pin} Wybierz kategorię`,
            `> ${EMOJI.zap} Szybka odpowiedź`,
            `> ${EMOJI.lock} Bezpieczny kontakt`
          ].join("\n")
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: "© 2026 StarX Exchange" })
        .setTimestamp();

      await channel.send({
        embeds: [embed],
        components: [createMenu()]
      });

      console.log("✅ Panel ticketów wysłany");
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
      const guild = interaction.guild;
      const user = interaction.user;

      // check duplicate
      const existing = guild.channels.cache.find(
        c => c.name === `ticket-${user.username}`.toLowerCase()
      );

      if (existing) {
        return interaction.reply({
          content: `❌ Masz już ticket: ${existing}`,
          flags: 64
        });
      }

      // create channel
      const channel = await guild.channels.create({
        name: `ticket-${user.username}`.toLowerCase(),
        type: ChannelType.GuildText,

        permissionOverwrites: [
          // ❌ everyone NO ACCESS
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },

          // 👤 CLIENT
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles
            ]
          },

          // 🧑 REALIZATORZY
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

      await channel.send({
        content:
          `👋 ${user}\n` +
          `${EMOJI.pin} Nowy ticket\n` +
          `${EMOJI.ticket} Kategoria: **${category}**`
      });

      await interaction.reply({
        content: `✅ Ticket utworzony: ${channel}`,
        flags: 64
      });

    } catch (err) {
      console.log("❌ Create ticket error:", err);

      if (!interaction.replied) {
        interaction.reply({
          content: "❌ Błąd tworzenia ticketa",
          flags: 64
        }).catch(() => {});
      }
    }
  });
};
