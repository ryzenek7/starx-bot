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
  // EMOJI
  // =====================
  const EMOJI = {
    list: "<:list:1501693215328440370>",
    admin: "<:admin:1501989271077388500>",
    warning: "<:warning:1501693444030992395>",
    cart: "<:cart:1500243849535033577>",
    zap: "<:zap:1501697151737139350>",
    ticket: "<:ticket:1501697124734206032>",
    clock: "<:clock:1502030015943151868>",
    lock: "<:lock:1501697222901895258>",
    support: "<:support:1500243961124618381>",
    pin: "<:pin:1501697389050986546>",
    money: "<a:money:1501685438103031920>",
    middleman: "<:middleman:1500243884733894716>"
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
            description: "Kupno lub wymiana",
            value: "Wymiana / Zakup",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Pomoc",
            description: "Wsparcie administracji",
            value: "Pomoc",
            emoji: { id: "1500243961124618381" }
          },
          {
            label: "Middleman",
            description: "Usługa pośrednika",
            value: "Middleman",
            emoji: { id: "1500243884733894716" }
          }
        ])
    );
  }

  // =====================
  // PANEL
  // =====================
  client.once(Events.ClientReady, async () => {

    try {

      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI.ticket} StarX Exchange » System Ticketów`)
        .setDescription([
          `> ${EMOJI.list} Wybierz kategorię z menu poniżej`,
          `> ${EMOJI.zap} Szybka pomoc realizatorów`,
          `> ${EMOJI.lock} Prywatny i bezpieczny kontakt`,
          `> ${EMOJI.clock} Odpowiedź zwykle w kilka minut`
        ].join("\n"))
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange"
        })
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

      // =====================
      // CHECK EXISTING
      // =====================
      const existing = interaction.guild.channels.cache.find(
        c =>
          c.name === `ticket-${interaction.user.username}`.toLowerCase()
      );

      if (existing) {
        return interaction.reply({
          content: `${EMOJI.warning} Masz już otwarty ticket: ${existing}`,
          flags: 64
        });
      }

      // =====================
      // CREATE CHANNEL
      // =====================
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,

        permissionOverwrites: [

          // everyone
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },

          // owner
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles
            ]
          },

          // realizator
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

      // =====================
      // BUTTON
      // =====================
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Zamknij Ticket")
          .setEmoji("1501697222901895258")
          .setStyle(ButtonStyle.Danger)
      );

      // =====================
      // EMBED
      // =====================
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI.ticket} Nowy Ticket`)
        .setDescription([
          `${EMOJI.pin} Użytkownik: ${interaction.user}`,
          `${EMOJI.list} Kategoria: **${category}**`,
          `${EMOJI.admin} Support odpowie najszybciej jak to możliwe`,
          `${EMOJI.money} StarX Exchange`
        ].join("\n"))
        .setFooter({
          text: "System Ticketów"
        })
        .setTimestamp();

      await channel.send({
        content: `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
        embeds: [embed],
        components: [row]
      });

      // =====================
      // REPLY
      // =====================
      return interaction.reply({
        content: `${EMOJI.ticket} Ticket został utworzony: ${channel}`,
        flags: 64
      });

    } catch (err) {
      console.log("❌ Create ticket error:", err);
    }
  });

  // =====================
  // CLOSE TICKET
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId !== "close_ticket") return;

    try {

      const member = await interaction.guild.members.fetch(interaction.user.id);

      // =====================
      // ONLY REALIZATOR
      // =====================
      if (!member.roles.cache.has(REALIZATOR_ROLE_ID)) {
        return interaction.reply({
          content: `${EMOJI.warning} Tylko realizator może zamknąć ticket.`,
          flags: 64
        });
      }

      // =====================
      // CLOSE EMBED
      // =====================
      const embed = new EmbedBuilder()
        .setColor("#ED4245")
        .setDescription(
          `${EMOJI.lock} Ticket zostanie zamknięty za 3 sekundy...`
        );

      await interaction.reply({
        embeds: [embed]
      });

      // =====================
      // DELETE CHANNEL
      // =====================
      setTimeout(async () => {

        await interaction.channel.delete().catch(() => {});

      }, 3000);

    } catch (err) {
      console.log("❌ Close ticket error:", err);
    }
  });
};
