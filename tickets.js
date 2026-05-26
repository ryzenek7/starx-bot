const {
  Client,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

module.exports = (client) => {

  // =========================
  // CONFIG
  // =========================
  const PANEL_CHANNEL_ID = "1499512781861556314";
  const REALIZATOR_ROLE_ID = "1500930428993933373";

  // =========================
  // TEMP DATA
  // =========================
  const exchangeData = new Map();

  // =========================
  // PROWIZJE
  // =========================
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

  // =========================
  // PANEL MENU
  // =========================
  function createPanelMenu() {

    return new ActionRowBuilder().addComponents(

      new StringSelectMenuBuilder()

        .setCustomId("ticket_menu")

        .setPlaceholder("🎫 Wybierz kategorię")

        .addOptions([

          {
            label: "Wymiana waluty",
            description: "Stwórz ticket wymiany",
            value: "exchange",
            emoji: "💸"
          }
        ])
    );
  }

  // =========================
  // READY
  // =========================
  client.once(Events.ClientReady, async () => {

    try {

      const channel =
        await client.channels.fetch(
          PANEL_CHANNEL_ID
        );

      if (!channel) return;

      const embed =
        new EmbedBuilder()

          .setColor("#1e1f22")

          .setTitle(
            "🎫 Goat Exchange • System Ticketów"
          )

          .setDescription([

            "> 💸 Stwórz ticket wymiany",
            "> ⚡ Szybka realizacja",
            "> 🔒 Bezpieczny kontakt",
            "> 🕒 Odpowiedź zwykle w kilka minut"

          ].join("\n"))

          .setImage(
            "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
          )

          .setFooter({
            text: "© 2026 Goat Exchange"
          });

      await channel.send({

        embeds: [embed],
        components: [createPanelMenu()]
      });

      console.log("✅ Panel wysłany");

    } catch (err) {

      console.log(err);
    }
  });

  // =========================
  // INTERACTION
  // =========================
  client.on(
    Events.InteractionCreate,
    async (interaction) => {

      // =====================
      // MAIN MENU
      // =====================
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "ticket_menu"
      ) {

        const modal =
          new ModalBuilder()

            .setCustomId(
              "exchange_amount_modal"
            )

            .setTitle(
              "Potrzebne informacje"
            );

        const amountInput =
          new TextInputBuilder()

            .setCustomId(
              "exchange_amount"
            )

            .setLabel(
              "JAKA KWOTA"
            )

            .setPlaceholder(
              "Przykład: 100"
            )

            .setStyle(
              TextInputStyle.Short
            )

            .setRequired(true);

        modal.addComponents(

          new ActionRowBuilder()
            .addComponents(amountInput)
        );

        return interaction.showModal(modal);
      }

      // =====================
      // AMOUNT MODAL
      // =====================
      if (
        interaction.isModalSubmit() &&
        interaction.customId ===
          "exchange_amount_modal"
      ) {

        const amount =
          interaction.fields.getTextInputValue(
            "exchange_amount"
          );

        exchangeData.set(
          interaction.user.id,
          {
            amount
          }
        );

        // =====================
        // FROM MENU
        // =====================
        const fromMenu =
          new StringSelectMenuBuilder()

            .setCustomId(
              "exchange_from"
            )

            .setPlaceholder(
              "Z CZEGO"
            )

            .addOptions([

              {
                label: "BLIK",
                value: "BLIK",
                emoji: "<:blik:1499784231608389742>"
              },

              {
                label: "KOD BLIK",
                value: "KODBLIK",
                emoji: "<:blik:1499784231608389742>"
              },

              {
                label: "PAYPAL",
                value: "PAYPAL",
                emoji: "<:paypal:1499784258091483236>"
              },

              {
                label: "CRYPTO",
                value: "CRYPTO",
                emoji: "<:crypto:1499784635201224724>"
              },

              {
                label: "LTC",
                value: "LTC",
                emoji: "<:ltc:1499784285211726014>"
              }
            ]);

        // =====================
        // TO MENU
        // =====================
        const toMenu =
          new StringSelectMenuBuilder()

            .setCustomId(
              "exchange_to"
            )

            .setPlaceholder(
              "NA CO"
            )

            .addOptions([

              {
                label: "BLIK",
                value: "BLIK",
                emoji: "<:blik:1499784231608389742>"
              },

              {
                label: "KOD BLIK",
                value: "KODBLIK",
                emoji: "<:blik:1499784231608389742>"
              },

              {
                label: "PAYPAL",
                value: "PAYPAL",
                emoji: "<:paypal:1499784258091483236>"
              },

              {
                label: "CRYPTO",
                value: "CRYPTO",
                emoji: "<:crypto:1499784635201224724>"
              },

              {
                label: "LTC",
                value: "LTC",
                emoji: "<:ltc:1499784285211726014>"
              }
            ]);

        // =====================
        // BUTTON
        // =====================
        const createButton =
          new ButtonBuilder()

            .setCustomId(
              "create_exchange_ticket"
            )

            .setLabel(
              "Utwórz ticket"
            )

            .setEmoji("💸")

            .setStyle(
              ButtonStyle.Success
            );

        return interaction.reply({

          content:
            "## Potrzebne informacje.",

          components: [

            new ActionRowBuilder()
              .addComponents(fromMenu),

            new ActionRowBuilder()
              .addComponents(toMenu),

            new ActionRowBuilder()
              .addComponents(createButton)
          ],

          flags: 64
        });
      }

      // =====================
      // FROM SELECT
      // =====================
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId ===
          "exchange_from"
      ) {

        const data =
          exchangeData.get(
            interaction.user.id
          );

        if (!data) return;

        data.from =
          interaction.values[0];

        exchangeData.set(
          interaction.user.id,
          data
        );

        return interaction.deferUpdate();
      }

      // =====================
      // TO SELECT
      // =====================
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId ===
          "exchange_to"
      ) {

        const data =
          exchangeData.get(
            interaction.user.id
          );

        if (!data) return;

        data.to =
          interaction.values[0];

        exchangeData.set(
          interaction.user.id,
          data
        );

        return interaction.deferUpdate();
      }

      // =====================
      // CREATE TICKET
      // =====================
      if (
        interaction.isButton() &&
        interaction.customId ===
          "create_exchange_ticket"
      ) {

        const data =
          exchangeData.get(
            interaction.user.id
          );

        if (!data)
          return interaction.reply({

            content:
              "❌ Brak danych.",

            flags: 64
          });

        if (!data.from || !data.to)
          return interaction.reply({

            content:
              "❌ Wybierz obie metody.",

            flags: 64
          });

        const existing =
          interaction.guild.channels.cache.find(
            c =>
              c.topic ===
              interaction.user.id
          );

        if (existing)
          return interaction.reply({

            content:
              `❌ Masz już ticket: ${existing}`,

            flags: 64
          });

        const exchange =
          `${data.from}->${data.to}`;

        const percent =
          rates[exchange] || 4;

        const afterFee =
          (
            Number(data.amount) *
            (1 - percent / 100)
          ).toFixed(2);

        // =====================
        // CREATE CHANNEL
        // =====================
        const channel =
          await interaction.guild.channels.create({

            name:
              `${data.from.toLowerCase()}-${data.to.toLowerCase()}`,

            topic:
              interaction.user.id,

            type:
              ChannelType.GuildText,

            permissionOverwrites: [

              {
                id:
                  interaction.guild.id,

                deny: [
                  PermissionsBitField.Flags.ViewChannel
                ]
              },

              {
                id:
                  interaction.user.id,

                allow: [

                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.AttachFiles
                ]
              },

              {
                id:
                  REALIZATOR_ROLE_ID,

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
        // BUTTONS
        // =====================
        const row =
          new ActionRowBuilder()
            .addComponents(

              new ButtonBuilder()

                .setCustomId(
                  "close_ticket"
                )

                .setEmoji("❌")

                .setStyle(
                  ButtonStyle.Danger
                ),

              new ButtonBuilder()

                .setCustomId(
                  "claim_ticket"
                )

                .setEmoji("🔒")

                .setStyle(
                  ButtonStyle.Secondary
                ),

              new ButtonBuilder()

                .setCustomId(
                  "settings_ticket"
                )

                .setEmoji("⚙️")

                .setStyle(
                  ButtonStyle.Secondary
                )
            );

        // =====================
        // EMBED
        // =====================
        const embed =
          new EmbedBuilder()

            .setColor("#1e1f22")

            .setTitle(
              "🐏 Goat Exchange × WYMIANA"
            )

            .setDescription([

              `❯❯ Użytkownik ${interaction.user} jest nowym klientem.`,
              `❯❯ Dokonał on u nas żadnych wymian.`,

              "",

              `❯❯ Kwota wymiany wynosi **${data.amount} PLN** z metody **${data.from}** na **${data.to}**.`,

              `❯❯ Po prowizjach otrzymasz od nas **${afterFee} PLN**.`

            ].join("\n"))

            .setImage(
              "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
            )

            .setFooter({
              text:
                "© 2026 Goat Exchange"
            });

        await channel.send({

          content:
            `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,

          embeds: [embed],
          components: [row]
        });

        exchangeData.delete(
          interaction.user.id
        );

        return interaction.update({

          content:
            `✅ Ticket utworzony: ${channel}`,

          embeds: [],
          components: []
        });
      }

      // =====================
      // CLOSE
      // =====================
      if (
        interaction.isButton() &&
        interaction.customId ===
          "close_ticket"
      ) {

        if (
          !interaction.member.roles.cache.has(
            REALIZATOR_ROLE_ID
          )
        ) {

          return interaction.reply({

            content:
              "❌ Tylko realizator może zamknąć ticket.",

            flags: 64
          });
        }

        await interaction.reply({

          content:
            "🔒 Ticket zostanie zamknięty za 3 sekundy..."
        });

        setTimeout(async () => {

          await interaction.channel
            .delete()
            .catch(() => {});

        }, 3000);
      }
    }
  );
};
