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

  // ========================
  // CONFIG
  // ========================
  const PANEL_CHANNEL_ID = "1499512781861556314";
  const SUPPORT_ROLE_ID = "1499507487647338656";

  // 🎫 CUSTOM EMOJI
  const EMOJI_TICKET = "<:ticket:1501697124734206032>";

  // ========================
  // PANEL READY
  // ========================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału");

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI_TICKET} StarX Exchange » TICKETY`)
        .setDescription(
          `${EMOJI_TICKET} Wybierz kategorię z menu poniżej.\n\n` +
          "⚡ Szybka pomoc supportu\n" +
          "🔒 Bezpieczny kontakt"
        )
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({ text: "© 2026 StarX Exchange x TICKETY" });

      const select = new StringSelectMenuBuilder()
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
            value: "pomoc",
            emoji: { id: "1500243961124618381" }
          },
          {
            label: "Middleman",
            value: "mm",
            emoji: { id: "1500243884733894716" }
          }
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

        const msg = await channel.send({
          content:
            `<@&${SUPPORT_ROLE_ID}> 👋 ${interaction.user}\n` +
            `📌 Nowy ticket\n` +
            `${EMOJI_TICKET} Kategoria: **${category}**`,
          components: [row],
          allowedMentions: {
            roles: [SUPPORT_ROLE_ID]
          }
        });

        // usuń ping po 1s
        setTimeout(async () => {
          try {
            await msg.edit({
              content:
                `👋 ${interaction.user}\n` +
                `📌 Nowy ticket\n` +
                `${EMOJI_TICKET} Kategoria: **${category}**`,
              components: [row]
            });
          } catch {}
        }, 1000);

        await interaction.reply({
          content: `✅ Ticket utworzony: ${channel}`,
          flags: 64
        });

      } catch (err) {
        console.log("❌ Błąd tworzenia ticketa:", err);

        if (!interaction.replied) {
          await interaction.reply({
            content: "❌ Nie udało się stworzyć ticketa.",
            flags: 64
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
            content: "❌ Nie masz permisji support.",
            flags: 64
          });
        }

        await interaction.reply({
          content: "🔒 Zamykam ticket za 3 sekundy...",
          flags: 64
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
