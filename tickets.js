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

  // =========================================
  // CONFIG
  // =========================================
  const PANEL_CHANNEL_ID = "1509429804770791494";
  const REALIZATOR_ROLE_ID = "1500930428993933373";
  const CLIENT_ROLE_ID = "1499572498604363918";

  // =========================================
  // COLOR
  // =========================================
  const EMBED_COLOR = "#1b2dff";

  // =========================================
  // TEMP DATA
  // =========================================
  const exchangeData = new Map();

  // =========================================
  // EMOJI
  // =========================================
  const EMOJI = {

    arrow: "<a:arrow:1508094625984811038>",

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
    ltc: "<:ltc:1499784285211726014>",
    crypto: "<:crypto:1499784635201224724>"
  };

  // =========================================
  // PROWIZJE
  // =========================================
  const rates = {
    "BLIK->PAYPAL": 2,
    "BLIK->CRYPTO": 8,
    "BLIK->LTC": 8,

    "KODBLIK->PAYPAL": 6,
    "KODBLIK->CRYPTO": 11,
    "KODBLIK->LTC": 11,

    "PAYPAL->BLIK": 9,
    "PAYPAL->CRYPTO": 9,
    "PAYPAL->LTC": 9,

    "CRYPTO->BLIK": 4,
    "CRYPTO->KODBLIK": 4,
    "CRYPTO->PAYPAL": 4,
    "CRYPTO->LTC": 4,

    "LTC->BLIK": 4,
    "LTC->KODBLIK": 4,
    "LTC->PAYPAL": 4,
    "LTC->CRYPTO": 4
  };

  // =========================================
  // MENU
  // =========================================
  function createMenu() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("🎫 Wybierz kategorię")
        .addOptions([
          {
            label: "Wymiana waluty",
            description: "Wymiana metod płatności",
            value: "exchange",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Zakup",
            description: "Kupno produktu/usługi",
            value: "buy",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Pomoc",
            description: "Wsparcie administracji",
            value: "help",
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

  // =========================================
  // READY
  // =========================================
  client.once(Events.ClientReady, async () => {

    const channel = await client.channels.fetch(PANEL_CHANNEL_ID).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`${EMOJI.ticket} 🌟 StarX Exchange » System Ticketów`)
      .setDescription([
        `> ${EMOJI.arrow} Wybierz kategorię z menu poniżej`,
        `> ${EMOJI.arrow} Szybka pomoc realizatorów`,
        `> ${EMOJI.arrow} Prywatny i bezpieczny kontakt`,
        `> ${EMOJI.arrow} Odpowiedź zwykle w kilka minut`
      ].join("\n"))
      .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
      .setFooter({ text: "© 2026 StarX Exchange" });

    await channel.send({
      embeds: [embed],
      components: [createMenu()]
    });

    console.log("✅ Panel ticketów wysłany.");
  });

  // =========================================
  // INTERACTIONS
  // =========================================
  client.on(Events.InteractionCreate, async (interaction) => {

    try {

      // =====================================================
      // MENU
      // =====================================================
      if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

        const type = interaction.values[0];

        const existing = interaction.guild.channels.cache.find(c =>
          c.topic?.startsWith(interaction.user.id)
        );

        if (existing) {
          return interaction.reply({
            content: `${EMOJI.warning} Masz już ticket: ${existing}`,
            ephemeral: true
          });
        }

        // =====================================================
        // MODAL EXCHANGE
        // =====================================================
        if (type === "exchange") {

          const modal = new ModalBuilder()
            .setCustomId("exchange_modal")
            .setTitle("Potrzebne informacje");

          const amountInput = new TextInputBuilder()
            .setCustomId("exchange_amount")
            .setLabel("JAKA KWOTA")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          modal.addComponents(
            new ActionRowBuilder().addComponents(amountInput)
          );

          return interaction.showModal(modal);
        }

        let categoryName = "Pomoc";
        if (type === "buy") categoryName = "Zakup";
        if (type === "middleman") categoryName = "Middleman";

        // =====================================================
        // CREATE CHANNEL
        // =====================================================
        const channel = await interaction.guild.channels.create({
          name: `${type}-${interaction.user.username}`.toLowerCase(),
          topic: `${interaction.user.id}:${type}`,
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
              id: REALIZATOR_ROLE_ID,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            }
          ]
        });

        // =====================================================
        // 🔥 FIX: ROLE CLIENT (pewne działanie)
        // =====================================================
        const member =
          await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

        if (member && !member.roles.cache.has(CLIENT_ROLE_ID)) {
          await member.roles.add(CLIENT_ROLE_ID).catch(() => null);
        }

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setEmoji("❌")
            .setLabel("Zamknij")
            .setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setTitle(`${EMOJI.ticket} 🌟 StarX Exchange × ${categoryName.toUpperCase()}`)
          .setDescription([
            `> ${EMOJI.arrow} Użytkownik ${interaction.user} utworzył ticket`,
            `> ${EMOJI.arrow} Kategoria: \`${categoryName}\``,
            ``,
            `> ${EMOJI.arrow} Realizator odpowie najszybciej jak to możliwe`
          ].join("\n"))
          .setFooter({ text: "© 2026 StarX Exchange" });

        await channel.send({
          content: `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
          embeds: [embed],
          components: [row]
        });

        return interaction.reply({
          content: `${EMOJI.ticket} Ticket został utworzony: ${channel}`,
          ephemeral: true
        });
      }

      // (RESZTA TWOJEGO KODU BEZ ZMIAN – exchange, close itd.)

    } catch (err) {
      console.log("❌ TICKET ERROR:", err);
    }
  });
};
