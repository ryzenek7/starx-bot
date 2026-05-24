const {
  Events,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = (client) => {

  // =====================
  // REALIZATORZY
  // =====================
  const STAFF_ROLE_ID = "1500930428993933373";

  // status ticketa (trzymany w pamięci)
  const claimedTickets = new Map();

  // =====================
  // CREATE TICKET
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_select") return;

    const guild = interaction.guild;
    const user = interaction.user;
    const category = interaction.values[0];

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`.toLowerCase(),
      type: ChannelType.GuildText,

      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },

        // 👤 klient
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },

        // 🧑 REALIZATORZY (OPEN)
        {
          id: STAFF_ROLE_ID,
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
      content: `👋 ${user} | Kategoria: **${category}**`,
      components: [row]
    });

    return interaction.reply({
      content: `✅ Ticket utworzony: ${channel}`,
      flags: 64
    });
  });

  // =====================
  // CLAIM SYSTEM
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isButton()) return;

    const channel = interaction.channel;

    // =====================
    // CLAIM
    // =====================
    if (interaction.customId === "claim_ticket") {

      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Nie jesteś realizatorem.",
          flags: 64
        });
      }

      const already = claimedTickets.get(channel.id);
      if (already) {
        return interaction.reply({
          content: "❌ Ticket już przejęty.",
          flags: 64
        });
      }

      // zapis claim
      claimedTickets.set(channel.id, interaction.user.id);

      // ❌ usuń dostęp innych realizatorów
      await channel.permissionOverwrites.edit(STAFF_ROLE_ID, {
        ViewChannel: false
      }).catch(() => {});

      // 👤 klient zostaje
      const overwrites = channel.permissionOverwrites.cache;

      for (const [, perm] of overwrites) {
        if (perm.id !== interaction.guild.id && perm.id !== interaction.user.id) {
          await channel.permissionOverwrites.delete(perm.id).catch(() => {});
        }
      }

      // 👤 klient + claimujący
      const customerId = channel.topic || null;

      await channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🔵 Ticket przejęty")
        .setDescription(`Przejął: ${interaction.user}`);

      return interaction.reply({ embeds: [embed] });
    }

    // =====================
    // CLOSE
    // =====================
    if (interaction.customId === "close_ticket") {

      await interaction.reply({
        content: "🔒 Zamykam ticket...",
        flags: 64
      });

      setTimeout(() => {
        claimedTickets.delete(channel.id);
        channel.delete().catch(() => {});
      }, 2000);
    }
  });
};
