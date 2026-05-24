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

  const EMOJI = {
    ticket: "<:ticket:1501697124734206032>",
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    lock: "<:lock:1501697222901895258>"
  };

  // =====================
  // CLAIM STORAGE
  // =====================
  const claimed = new Map();

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
            value: "trade",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Pomoc",
            value: "help",
            emoji: { id: "1500243961124618381" }
          },
          {
            label: "Middleman",
            value: "mm",
            emoji: { id: "1500243884733894716" }
          }
        ])
    );
  }

  // =====================
  // READY PANEL
  // =====================
  client.once(Events.ClientReady, async () => {
    const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle(`${EMOJI.ticket} StarX Exchange Tickets`)
      .setDescription(
        `> ${EMOJI.pin} Wybierz kategorię\n` +
        `> ${EMOJI.zap} Szybka obsługa\n` +
        `> ${EMOJI.lock} Bezpieczeństwo`
      )
      .setTimestamp();

    channel.send({
      embeds: [embed],
      components: [createMenu()]
    });

    console.log("✅ Ticket panel ready");
  });

  // =====================
  // CREATE TICKET
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_select") return;

    const user = interaction.user;
    const guild = interaction.guild;
    const category = interaction.values[0];

    const existing = guild.channels.cache.find(
      c => c.name === `ticket-${user.username}`.toLowerCase()
    );

    if (existing) {
      return interaction.reply({
        content: `❌ Masz już ticket: ${existing}`,
        flags: 64
      });
    }

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`.toLowerCase(),
      type: ChannelType.GuildText,

      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: REALIZATOR_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
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
        `👋 ${user}\n` +
        `${EMOJI.ticket} Kategoria: **${category}**`,
      components: [row]
    });

    interaction.reply({
      content: `✅ Ticket utworzony: ${channel}`,
      flags: 64
    });
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
          content: "❌ Brak permisji.",
          flags: 64
        });
      }

      if (claimed.has(channel.id)) {
        return interaction.reply({
          content: "❌ Już przejęty.",
          flags: 64
        });
      }

      claimed.set(channel.id, interaction.user.id);

      await channel.permissionOverwrites.edit(REALIZATOR_ROLE_ID, {
        ViewChannel: false
      });

      await channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription(`🟢 Przejął: ${interaction.user}`)
        ]
      });
    }

    // =====================
    // CLOSE
    // =====================
    if (interaction.customId === "close_ticket") {

      if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Brak permisji.",
          flags: 64
        });
      }

      await interaction.reply({
        content: "🔒 Zamykam ticket...",
        flags: 64
      });

      setTimeout(() => {
        claimed.delete(channel.id);
        channel.delete().catch(() => {});
      }, 2000);
    }
  });
};
