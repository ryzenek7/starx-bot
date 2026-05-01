const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Events,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = (client) => {

  // ========================
  // 📌 CONFIG
  // ========================
  const PANEL_CHANNEL_ID = "1499512781861556314";
  const SUPPORT_ROLE_ID = "1499507487647338656";

  // ========================
  // 📌 PANEL (ON READY)
  // ========================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

      if (!channel) {
        console.log("❌ Nie znaleziono kanału panelu");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('💸︲🌟 StarX Exchange » TICKETY')
        .setDescription('Wybierz kategorię ticketa poniżej 👇')
        .setImage('https://i.imgur.com/5zjYMiw_d.webp?maxwidth=760&fidelity=grand');
            .setFooter({
                text: "© 2026 StarX Exchange × Weryfikacja"
            });

      const select = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Wybierz kategorię')
        .addOptions([
          { label: 'Wymiana', value: 'wymiana' },
          { label: 'Pomoc', value: 'pomoc' },
          { label: 'Middleman', value: 'mm' }
        ]);

      const row = new ActionRowBuilder().addComponents(select);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Panel ticketów wysłany");
    } catch (err) {
      console.log("❌ Błąd panelu:", err);
    }
  });

  // ========================
  // ⚙️ INTERACTIONS
  // ========================
  client.on(Events.InteractionCreate, async (interaction) => {

    // ========================
    // 🎫 CREATE TICKET
    // ========================
    if (interaction.isStringSelectMenu()) {

      if (interaction.customId !== 'ticket_select') return;

      try {
        const category = interaction.values[0];

        const channelName = `ticket-${interaction.user.username}`.toLowerCase();

        const channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },
            {
              id: SUPPORT_ROLE_ID,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            }
          ]
        });

        const closeButton = new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('🔒 Zamknij ticket')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeButton);

        await channel.send({
          content: `👋 ${interaction.user}\nSupport zaraz się tobą zajmie.\n📌 Kategoria: **${category}**`,
          components: [row]
        });

        await interaction.reply({
          content: `✅ Ticket utworzony: ${channel}`,
          ephemeral: true
        });

      } catch (err) {
        console.log("❌ Błąd tworzenia ticketa:", err);

        if (!interaction.replied) {
          await interaction.reply({
            content: '❌ Nie udało się stworzyć ticketa',
            ephemeral: true
          });
        }
      }
    }

    // ========================
    // 🔒 CLOSE TICKET
    // ========================
    if (interaction.isButton()) {

      if (interaction.customId !== 'close_ticket') return;

      try {
        await interaction.reply({
          content: '🔄 Sprawdzam uprawnienia...',
          ephemeral: true
        });

        const member = await interaction.guild.members.fetch(interaction.user.id);

        const isSupport = member.roles.cache.has(SUPPORT_ROLE_ID);

        if (!isSupport) {
          return interaction.editReply('❌ Nie masz uprawnień support!');
        }

        await interaction.editReply('🔒 Zamykam ticket za 3 sekundy...');

        setTimeout(() => {
          interaction.channel.delete().catch(console.error);
        }, 3000);

      } catch (err) {
        console.log("❌ Błąd zamykania ticketa:", err);

        if (interaction.replied) {
          interaction.editReply('❌ Wystąpił błąd');
        }
      }
    }

  });
};
