const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Events,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
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
    middleman: "<:middleman:1500243884733894716>",

    blik: "<:blik:1499784231608389742>",
    paypal: "<:paypal:1499784258091483236>",
    crypto: "<:crypto:1499784635201224724>",
    ltc: "<:ltc:1499784285211726014>"
  };

  // =====================
  // PROWIZJE
  // =====================
  const PROVISIONS = {
    "BLIK-PAYPAL": 2,
    "BLIK-CRYPTO": 8,
    "BLIK-LTC": 8,

    "KODBLIK-PAYPAL": 6,
    "KODBLIK-CRYPTO": 11,
    "KODBLIK-LTC": 11,

    "PAYPAL-BLIK": 9,
    "PAYPAL-CRYPTO": 9,
    "PAYPAL-LTC": 9,

    "CRYPTO-BLIK": 4,
    "CRYPTO-KODBLIK": 4,
    "CRYPTO-PAYPAL": 4,
    "CRYPTO-CRYPTO": 4,
    "CRYPTO-LTC": 4,

    "LTC-BLIK": 4,
    "LTC-KODBLIK": 4,
    "LTC-PAYPAL": 4,
    "LTC-CRYPTO": 4
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
            label: "Wymiana",
            description: "Stwórz ticket wymiany",
            value: "wymiana",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Zakup",
            description: "Stwórz ticket zakupu",
            value: "zakup",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Pomoc",
            description: "Wsparcie administracji",
            value: "pomoc",
            emoji: { id: "1500243961124618381" }
          },
          {
            label: "Middleman",
            description: "Usługa pośrednika",
            value: "middleman",
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
  // SELECT MENU
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket_select") return;

    const type = interaction.values[0];

    // =====================
    // WYMIANA / ZAKUP MODAL
    // =====================
    if (type === "wymiana" || type === "zakup") {

      const modal = new ModalBuilder()
        .setCustomId(`exchange_modal_${type}`)
        .setTitle("📋 Potrzebne informacje");

      const amountInput = new TextInputBuilder()
        .setCustomId("amount")
        .setLabel("JAKA KWOTA?")
        .setPlaceholder("Przykład: 100")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const fromInput = new TextInputBuilder()
        .setCustomId("from")
        .setLabel("Z CZEGO?")
        .setPlaceholder("np. BLIK")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const toInput = new TextInputBuilder()
        .setCustomId("to")
        .setLabel("NA CO?")
        .setPlaceholder("np. PAYPAL")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(amountInput),
        new ActionRowBuilder().addComponents(fromInput),
        new ActionRowBuilder().addComponents(toInput)
      );

      return interaction.showModal(modal);
    }

    // =====================
    // POMOC / MM
    // =====================
    try {

      const channel = await interaction.guild.channels.create({
        name: `${type}-${interaction.user.username}`.toLowerCase(),
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
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles
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
          .setCustomId("close_ticket")
          .setLabel("Zamknij Ticket")
          .setEmoji("1501697222901895258")
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI.ticket} Nowy Ticket`)
        .setDescription([
          `${EMOJI.pin} Użytkownik: ${interaction.user}`,
          `${EMOJI.list} Kategoria: **${type}**`
        ].join("\n"))
        .setTimestamp();

      await channel.send({
        content: `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: `${EMOJI.ticket} Ticket został utworzony: ${channel}`,
        flags: 64
      });

    } catch (err) {
      console.log(err);
    }
  });

  // =====================
  // MODAL SUBMIT
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith("exchange_modal_")) return;

    try {

      const type =
        interaction.customId.replace("exchange_modal_", "");

      const amount =
        Number(interaction.fields.getTextInputValue("amount"));

      const from =
        interaction.fields
          .getTextInputValue("from")
          .toUpperCase()
          .replace(/\s+/g, "");

      const to =
        interaction.fields
          .getTextInputValue("to")
          .toUpperCase()
          .replace(/\s+/g, "");

      const key = `${from}-${to}`;

      const provision =
        PROVISIONS[key] || 0;

      let after =
        amount - (amount * provision / 100);

      if (provision > 0 && (amount * provision / 100) < 3) {
        after = amount - 3;
      }

      const channel = await interaction.guild.channels.create({
        name: `${type}-${from.toLowerCase()}-${to.toLowerCase()}`,
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
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles
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
          .setCustomId("close_ticket")
          .setLabel("Zamknij Ticket")
          .setEmoji("1501697222901895258")
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI.cart} StarX Exchange » ${type.toUpperCase()}`)
        .setDescription([
          `${EMOJI.pin} Użytkownik ${interaction.user}`,
          ``,
          `${EMOJI.money} Kwota wymiany wynosi **${amount.toFixed(2)} PLN**`,
          `${EMOJI.zap} Z metody **${from}** na **${to}**`,
          ``,
          `${EMOJI.ticket} Prowizja: **${provision}%**`,
          `${EMOJI.money} Po prowizji otrzymasz **${after.toFixed(2)} PLN**`
        ].join("\n"))
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange"
        })
        .setTimestamp();

      await channel.send({
        content: `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: `${EMOJI.ticket} Ticket został utworzony: ${channel}`,
        flags: 64
      });

    } catch (err) {
      console.log("❌ Modal error:", err);
    }
  });

  // =====================
  // CLOSE
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId !== "close_ticket") return;

    try {

      const member =
        await interaction.guild.members.fetch(interaction.user.id);

      if (!member.roles.cache.has(REALIZATOR_ROLE_ID)) {
        return interaction.reply({
          content: `${EMOJI.warning} Tylko realizator może zamknąć ticket.`,
          flags: 64
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#ED4245")
        .setDescription(
          `${EMOJI.lock} Ticket zostanie zamknięty za 3 sekundy...`
        );

      await interaction.reply({
        embeds: [embed]
      });

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 3000);

    } catch (err) {
      console.log("❌ Close ticket error:", err);
    }
  });
};
