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
  // EMOJI
  // =========================
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
  // MENU
  // =========================
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

          .setColor("#f7c325")

          .setTitle(
            `${EMOJI.ticket} 🌟 StarX Exchange » System Ticketów`
          )

          .setDescription([

            `> ${EMOJI.list} Wybierz kategorię z menu poniżej`,
            `> ${EMOJI.zap} Szybka pomoc realizatorów`,
            `> ${EMOJI.lock} Prywatny i bezpieczny kontakt`,
            `> ${EMOJI.clock} Odpowiedź zwykle w kilka minut`

          ].join("\n"))

          .setImage(
            "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
          )

          .setFooter({
            text: "© 2026 StarX Exchange"
          });

      await channel.send({

        embeds: [embed],
        components: [createMenu()]
      });

      console.log("✅ Ticket panel wysłany");

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
        interaction.customId === "ticket_select"
      ) {

        const type =
          interaction.values[0];

        // =====================
        // WYMIANA
        // =====================
        if (type === "exchange") {

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
        // EXISTING TICKET
        // =====================
        const existing =
          interaction.guild.channels.cache.find(
            c =>
              c.topic ===
              interaction.user.id
          );

        if (existing)
          return interaction.reply({

            content:
              `${EMOJI.warning} Masz już ticket: ${existing}`,

            flags: 64
          });

        let categoryName =
          "Pomoc";

        if (type === "buy")
          categoryName = "Zakup";

        if (type === "middleman")
          categoryName = "Middleman";

        // =====================
        // CHANNEL
        // =====================
        const channel =
          await interaction.guild.channels.create({

            name:
              `${type}-${interaction.user.username}`.toLowerCase(),

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

            .setColor("#f7c325")

            .setTitle(
              `${EMOJI.ticket} 🌟 StarX Exchange × ${categoryName.toUpperCase()}`
            )

            .setDescription([

              `❯❯ Użytkownik ${interaction.user} utworzył ticket.`,
              `❯❯ Kategoria: **${categoryName}**`,

              "",

              `❯❯ Realizator odpowie najszybciej jak to możliwe.`

            ].join("\n"))

            .setImage(
              "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
            )

            .setFooter({
              text:
                "© 2026 StarX Exchange"
            });

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

      // =====================
      // MODAL
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
        // FROM
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
                emoji: {
                  id: "1499784231608389742"
                }
              },

              {
                label: "KOD BLIK",
                value: "KODBLIK",
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

        // =====================
        // TO
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
                emoji: {
                  id: "1499784231608389742"
                }
              },

              {
                label: "KOD BLIK",
                value: "KODBLIK",
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

        const button =
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
              .addComponents(button)
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
      // CREATE EXCHANGE
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
              `${EMOJI.warning} Masz już ticket: ${existing}`,

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
        // CHANNEL
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

            .setColor("#f7c325")

            .setTitle(
              "🌟 StarX Exchange × WYMIANA"
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
                "© 2026 StarX Exchange"
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
              `${EMOJI.warning} Tylko realizator może zamknąć ticket.`,

            flags: 64
          });
        }

        await interaction.reply({

          content:
            `${EMOJI.lock} Ticket zostanie zamknięty za 3 sekundy...`
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
