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
  const PANEL_CHANNEL_ID = "1499512781861556314";
  const REALIZATOR_ROLE_ID = "1500930428993933373";

  // =========================================
  // EMOJI
  // =========================================
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
    ltc: "<:ltc:1499784285211726014>",
    crypto: "<:crypto:1499784635201224724>"
  };

  // =========================================
  // PROWIZJE
  // =========================================
  const rates = {

    "BLIK_PAYPAL": 2,
    "BLIK_CRYPTO": 8,
    "BLIK_LTC": 8,

    "KODBLIK_PAYPAL": 6,
    "KODBLIK_CRYPTO": 11,
    "KODBLIK_LTC": 11,

    "PAYPAL_BLIK": 9,
    "PAYPAL_CRYPTO": 9,
    "PAYPAL_LTC": 9,

    "CRYPTO_BLIK": 4,
    "CRYPTO_PAYPAL": 4,
    "CRYPTO_LTC": 4,

    "LTC_BLIK": 4,
    "LTC_PAYPAL": 4,
    "LTC_CRYPTO": 4
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
            label: "Wymiana",
            description: "Stwórz ticket wymiany",
            value: "exchange",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Zakup",
            description: "Zakup produktu/usługi",
            value: "buy",
            emoji: { id: "1500243849535033577" }
          },
          {
            label: "Pomoc",
            description: "Pomoc administracji",
            value: "support",
            emoji: { id: "1500243961124618381" }
          },
          {
            label: "Middleman",
            description: "Usługa middleman",
            value: "middleman",
            emoji: { id: "1500243884733894716" }
          }
        ])
    );
  }

  // =========================================
  // PANEL
  // =========================================
  client.once(Events.ClientReady, async () => {

    try {

      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(`${EMOJI.ticket} StarX Exchange » TICKETY`)
        .setDescription([
          `> ${EMOJI.pin} Wybierz kategorię z menu poniżej`,
          `> ${EMOJI.zap} Szybka odpowiedź realizatorów`,
          `> ${EMOJI.lock} Prywatny i bezpieczny kontakt`
        ].join("\n"))
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange"
        });

      await channel.send({
        embeds: [embed],
        components: [createMenu()]
      });

      console.log("✅ Ticket panel wysłany");

    } catch (err) {
      console.log("❌ Ticket panel error:", err);
    }
  });

  // =========================================
  // SELECT MENU
  // =========================================
  client.on(Events.InteractionCreate, async (interaction) => {

    // =====================================
    // OPEN MODAL
    // =====================================
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_select"
    ) {

      const type = interaction.values[0];

      // =========================
      // WYMIANA / ZAKUP
      // =========================
      if (type === "exchange" || type === "buy") {

        const modal = new ModalBuilder()
          .setCustomId(`exchange_modal_${type}`)
          .setTitle("Potrzebne informacje");

        const amountInput = new TextInputBuilder()
          .setCustomId("amount")
          .setLabel("JAKA KWOTA?")
          .setPlaceholder("Np. 100")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const row1 = new ActionRowBuilder()
          .addComponents(amountInput);

        modal.addComponents(row1);

        return interaction.showModal(modal);
      }

      // =========================
      // POMOC
      // =========================
      if (type === "support") {

        return createSimpleTicket(
          interaction,
          "pomoc"
        );
      }

      // =========================
      // MIDDLEMAN
      // =========================
      if (type === "middleman") {

        return createSimpleTicket(
          interaction,
          "middleman"
        );
      }
    }

    // =====================================
    // MODAL SUBMIT
    // =====================================
    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("exchange_modal_")
    ) {

      const type =
        interaction.customId.split("_")[2];

      const amount =
        interaction.fields.getTextInputValue("amount");

      // =================================
      // SELECT FROM
      // =================================
      const fromMenu =
        new StringSelectMenuBuilder()

          .setCustomId(
            `from_select_${type}_${amount}`
          )

          .setPlaceholder("📤 Z czego?")

          .addOptions([
            {
              label: "BLIK",
              value: "BLIK",
              emoji: {
                id: "1499784231608389742"
              }
            },
            {
              label: "PAYPAL",
              value: "PAYPAL",
              emoji: {
                id: "1499784258091483236"
              }
            },
            {
              label: "CRYPTO",
              value: "CRYPTO",
              emoji: {
                id: "1499784635201224724"
              }
            },
            {
              label: "LTC",
              value: "LTC",
              emoji: {
                id: "1499784285211726014"
              }
            }
          ]);

      const row =
        new ActionRowBuilder()
          .addComponents(fromMenu);

      return interaction.reply({
        content: "📤 Wybierz metodę wejściową",
        components: [row],
        flags: 64
      });
    }

    // =====================================
    // FROM SELECT
    // =====================================
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId.startsWith("from_select_")
    ) {

      const split =
        interaction.customId.split("_");

      const type = split[2];
      const amount = split[3];

      const from =
        interaction.values[0];

      const toMenu =
        new StringSelectMenuBuilder()

          .setCustomId(
            `to_select_${type}_${amount}_${from}`
          )

          .setPlaceholder("📥 Na co?")

          .addOptions([
            {
              label: "BLIK",
              value: "BLIK",
              emoji: {
                id: "1499784231608389742"
              }
            },
            {
              label: "PAYPAL",
              value: "PAYPAL",
              emoji: {
                id: "1499784258091483236"
              }
            },
            {
              label: "CRYPTO",
              value: "CRYPTO",
              emoji: {
                id: "1499784635201224724"
              }
            },
            {
              label: "LTC",
              value: "LTC",
              emoji: {
                id: "1499784285211726014"
              }
            }
          ]);

      const row =
        new ActionRowBuilder()
          .addComponents(toMenu);

      return interaction.update({
        content: "📥 Wybierz metodę końcową",
        components: [row]
      });
    }

    // =====================================
    // TO SELECT
    // =====================================
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId.startsWith("to_select_")
    ) {

      const split =
        interaction.customId.split("_");

      const type = split[2];
      const amount = split[3];
      const from = split[4];

      const to =
        interaction.values[0];

      const key =
        `${from}_${to}`;

      const percent =
        rates[key] || 0;

      const amountNumber =
        Number(amount);

      let fee =
        (amountNumber * percent) / 100;

      if (fee < 3)
        fee = 3;

      const finalAmount =
        (amountNumber - fee).toFixed(2);

      // =========================
      // CREATE CHANNEL
      // =========================
      const channel =
        await interaction.guild.channels.create({

          name:
            `${type}-${from.toLowerCase()}-${to.toLowerCase()}`,

          type: ChannelType.GuildText,

          permissionOverwrites: [

            {
              id: interaction.guild.id,
              deny: [
                PermissionsBitField.Flags.ViewChannel
              ]
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
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageMessages
              ]
            }
          ]
        });

      // =========================
      // CLOSE BUTTON
      // =========================
      const row =
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("close_ticket")
              .setLabel("Zamknij")
              .setEmoji("1501697222901895258")
              .setStyle(ButtonStyle.Danger)
          );

      // =========================
      // EMBED
      // =========================
      const embed =
        new EmbedBuilder()

          .setColor("#2b2d31")

          .setTitle(
            `${EMOJI.ticket} ${
              type === "exchange"
                ? "Wymiana"
                : "Zakup"
            }`
          )

          .setDescription([
            `${EMOJI.pin} Użytkownik: ${interaction.user}`,
            ``,
            `📤 Z czego: **${from}**`,
            `📥 Na co: **${to}**`,
            ``,
            `${EMOJI.money} Kwota: **${amount} PLN**`,
            `${EMOJI.zap} Prowizja: **${percent}%**`,
            `${EMOJI.cart} Otrzymasz: **${finalAmount} PLN**`
          ].join("\n"))

          .setImage(
            "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
          )

          .setFooter({
            text: "© 2026 StarX Exchange"
          });

      await channel.send({
        content:
          `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.update({
        content:
          `${EMOJI.ticket} Ticket utworzony: ${channel}`,
        components: []
      });
    }

    // =====================================
    // CLOSE
    // =====================================
    if (
      interaction.isButton() &&
      interaction.customId === "close_ticket"
    ) {

      const member =
        await interaction.guild.members.fetch(
          interaction.user.id
        );

      if (
        !member.roles.cache.has(
          REALIZATOR_ROLE_ID
        )
      ) {

        return interaction.reply({
          content:
            `${EMOJI.warning} Brak permisji.`,
          flags: 64
        });
      }

      const embed =
        new EmbedBuilder()

          .setColor("#ED4245")

          .setDescription(
            `${EMOJI.lock} Ticket zostanie zamknięty za 3 sekundy`
          );

      await interaction.reply({
        embeds: [embed]
      });

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 3000);
    }

  });

  // =====================================
  // SIMPLE TICKET
  // =====================================
  async function createSimpleTicket(
    interaction,
    type
  ) {

    const channel =
      await interaction.guild.channels.create({

        name:
          `${type}-${interaction.user.username}`.toLowerCase(),

        type: ChannelType.GuildText,

        permissionOverwrites: [

          {
            id: interaction.guild.id,
            deny: [
              PermissionsBitField.Flags.ViewChannel
            ]
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

    const row =
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Zamknij")
            .setEmoji("1501697222901895258")
            .setStyle(ButtonStyle.Danger)
        );

    const embed =
      new EmbedBuilder()

        .setColor("#2b2d31")

        .setTitle(
          `${EMOJI.ticket} ${type}`
        )

        .setDescription(
          `${EMOJI.pin} Użytkownik: ${interaction.user}`
        );

    await channel.send({
      content:
        `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content:
        `${EMOJI.ticket} Ticket utworzony: ${channel}`,
      flags: 64
    });
  }

};
