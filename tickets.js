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
  // CONFIG
  // ========================
  const PANEL_CHANNEL_ID = "1499512781861556314";
  const SUPPORT_ROLE_ID = "1499507487647338656";

  // ========================
  // PANEL READY
  // ========================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

      if (!channel) return console.log("❌ Nie znaleziono kanału");

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🌟 StarX Exchange » TICKETY")
        .setDescription("Wybierz kategorię ticketa")
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({ text: "© 2026 StarX Exchange x TICKET" });

      const select = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Wybierz kategorię")
        .addOptions([
          { label: "Wymiana / Zakup", value: "Wymiana / Zakup" },
          { label: "Pomoc", value: "pomoc" },
          { label: "Middleman", value: "mm" }
        ]);

      const row = new ActionRowBuilder().addComponents(select);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Panel wysłany");

    } catch (err) {
      console.log("❌ Błąd panelu:", err);
    }
  });

  // ========================
  // INTERACTIONS
  // ========================
  client.on(Events.InteractionCreate, async (interaction) => {

    // ========================
    // CREATE TICKET
    // ========================
    if (interaction.isStringSelectMenu()) {

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
          .setCustomId("close_ticket")
          .setLabel("🔒 Zamknij ticket")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeButton);

        // wiadomość z pingiem
        const msg = await channel.send({
          content: `<@&${SUPPORT_ROLE_ID}> 👋 ${interaction.user}\nNowy ticket!\n📌 Kategoria: **${category}**`,
          components: [row],
          allowedMentions: {
            roles: [SUPPORT_ROLE_ID]
          }
        });

        // po 1 sekundzie usuwa ping
        setTimeout(async () => {
          try {
            await msg.edit({
              content: `👋 ${interaction.user}\nNowy ticket!\n📌 Kategoria: **${category}**`,
              components: [row]
            });
          } catch (err) {}
        }, 1000);

        await interaction.reply({
          content: `✅ Ticket utworzony: ${channel}`,
          ephemeral: true
        });

      } catch (err) {
        console.log("❌ Błąd tworzenia ticketa:", err);

        if (!interaction.replied) {
          await interaction.reply({
            content: "❌ Nie udało się stworzyć ticketa",
            ephemeral: true
          });
        }
      }
    }

    // ========================
    // CLOSE TICKET
    // ========================
    if (interaction.isButton()) {

      if (interaction.customId !== "close_ticket") return;

      try {
        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (!member.roles.cache.has(SUPPORT_ROLE_ID)) {
          return interaction.reply({
            content: "❌ Nie masz uprawnień support.",
            ephemeral: true
          });
        }

        await interaction.reply({
          content: "🔒 Zamykam ticket za 3 sekundy...",
          ephemeral: true
        });

        setTimeout(() => {
          interaction.channel.delete().catch(console.error);
        }, 3000);

      } catch (err) {
        console.log("❌ Błąd zamykania:", err);
      }
    }

  });

};
