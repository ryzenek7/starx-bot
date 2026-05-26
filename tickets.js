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
    middleman: "<:middleman:1500243884733894716>",

    blik: "<:blik:1499784231608389742>",
    paypal: "<:paypal:1499784258091483236>",
    ltc: "<:ltc:1499784285211726014>",
    crypto: "<:crypto:1499784635201224724>"
  };

  // =====================
  // PROWIZJE
  // =====================
  const rates = {
    "BLIK->PAYPAL": "2%",
    "BLIK->CRYPTO": "8%",
    "BLIK->LTC": "8%",

    "KODBLIK->PAYPAL": "6%",
    "KODBLIK->CRYPTO": "11%",
    "KODBLIK->LTC": "11%",

    "PAYPAL->BLIK": "9%",
    "PAYPAL->CRYPTO": "9%",
    "PAYPAL->LTC": "9%",

    "CRYPTO->BLIK": "4%",
    "CRYPTO->KODBLIK": "4%",
    "CRYPTO->PAYPAL": "4%",
    "CRYPTO->LTC": "4%",

    "LTC->BLIK": "4%",
    "LTC->KODBLIK": "4%",
    "LTC->PAYPAL": "4%",
    "LTC->CRYPTO": "4%"
  };

  // =====================
  // MENU GŁÓWNE
  // =====================
  function createMenu() {

    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("🎫 Wybierz kategorię")
        .addOptions([
          {
            label: "Wymiana",
            description: "Wymiana walut / metod",
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

  // =====================
  // MENU WYMIANY
  // =====================
  function createExchangeMenu() {

    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("exchange_select")
        .setPlaceholder("💸 Wybierz wymianę")
        .addOptions([

          {
            label: "BLIK ➜ PAYPAL",
            value: "BLIK->PAYPAL",
            emoji: { id: "1499784231608389742" }
          },

          {
            label: "BLIK ➜ CRYPTO",
            value: "BLIK->CRYPTO",
            emoji: { id: "1499784231608389742" }
          },

          {
            label: "BLIK ➜ LTC",
            value: "BLIK->LTC",
            emoji: { id: "1499784231608389742" }
          },

          {
            label: "PAYPAL ➜ BLIK",
            value: "PAYPAL->BLIK",
            emoji: { id: "1499784258091483236" }
          },

          {
            label: "PAYPAL ➜ CRYPTO",
            value: "PAYPAL->CRYPTO",
            emoji: { id: "1499784258091483236" }
          },

          {
            label: "PAYPAL ➜ LTC",
            value: "PAYPAL->LTC",
            emoji: { id: "1499784258091483236" }
          },

          {
            label: "CRYPTO ➜ BLIK",
            value: "CRYPTO->BLIK",
            emoji: { id: "1499784635201224724" }
          },

          {
            label: "CRYPTO ➜ PAYPAL",
            value: "CRYPTO->PAYPAL",
            emoji: { id: "1499784635201224724" }
          },

          {
            label: "LTC ➜ BLIK",
            value: "LTC->BLIK",
            emoji: { id: "1499784285211726014" }
          }
        ])
    );
  }

  // =====================
  // PANEL
  // =====================
  client.once(Events.ClientReady, async () => {

    try {

      const channel =
        await client.channels.fetch(PANEL_CHANNEL_ID);

      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(
          `${EMOJI.ticket} StarX Exchange » System Ticketów`
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
      console.log("❌ Ticket panel error:", err);
    }
  });

  // =====================
  // CREATE TICKET
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    // =================================
    // MENU GŁÓWNE
    // =================================
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_select"
    ) {

      try {

        const type = interaction.values[0];

        // =====================
        // WYMIANA
        // =====================
        if (type === "exchange") {

          return interaction.reply({
            content: `${EMOJI.money} Wybierz wymianę poniżej`,
            components: [createExchangeMenu()],
            flags: 64
          });
        }

        // =====================
        // NORMALNE TICKETY
        // =====================
        const existing =
          interaction.guild.channels.cache.find(
            c =>
              c.topic === interaction.user.id
          );

        if (existing) {
          return interaction.reply({
            content:
              `${EMOJI.warning} Masz już ticket: ${existing}`,
            flags: 64
          });
        }

        let categoryName = "Pomoc";

        if (type === "buy")
          categoryName = "Zakup";

        if (type === "middleman")
          categoryName = "Middleman";

        const channel =
          await interaction.guild.channels.create({

            name:
              `${type}-${interaction.user.username}`.toLowerCase(),

            topic: interaction.user.id,

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
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.AttachFiles
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

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()
              .setCustomId("close_ticket")
              .setLabel("Zamknij Ticket")
              .setEmoji("1501697222901895258")
              .setStyle(ButtonStyle.Danger)
          );

        const embed =
          new EmbedBuilder()

            .setColor("#2b2d31")

            .setTitle(
              `${EMOJI.ticket} Nowy Ticket`
            )

            .setDescription([
              `${EMOJI.pin} Użytkownik: ${interaction.user}`,
              `${EMOJI.list} Kategoria: **${categoryName}**`,
              `${EMOJI.admin} Realizator odpowie najszybciej jak to możliwe`,
              `${EMOJI.money} StarX Exchange`
            ].join("\n"))

            .setFooter({
              text: "System Ticketów"
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

      } catch (err) {
        console.log("❌ Ticket error:", err);
      }
    }

    // =================================
    // WYMIANA SELECT
    // =================================
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "exchange_select"
    ) {

      try {

        const exchange =
          interaction.values[0];

        const existing =
          interaction.guild.channels.cache.find(
            c =>
              c.topic === interaction.user.id
          );

        if (existing) {
          return interaction.reply({
            content:
              `${EMOJI.warning} Masz już ticket: ${existing}`,
            flags: 64
          });
        }

        const channel =
          await interaction.guild.channels.create({

            name:
              `wymiana-${interaction.user.username}`.toLowerCase(),

            topic: interaction.user.id,

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
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.AttachFiles
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

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()
              .setCustomId("close_ticket")
              .setLabel("Zamknij Ticket")
              .setEmoji("1501697222901895258")
              .setStyle(ButtonStyle.Danger)
          );

        const embed =
          new EmbedBuilder()

            .setColor("#2b2d31")

            .setTitle(
              `${EMOJI.money} Ticket Wymiany`
            )

            .setDescription([
              `${EMOJI.pin} Użytkownik: ${interaction.user}`,
              `${EMOJI.list} Wymiana: **${exchange.replace("->", " ➜ ")}**`,
              `${EMOJI.zap} Prowizja: **${rates[exchange]}**`,
              `${EMOJI.warning} Minimalna prowizja: **3 PLN**`,
              `${EMOJI.admin} Realizator odpowie najszybciej jak to możliwe`
            ].join("\n"))

            .setFooter({
              text: "StarX Exchange"
            });

        await channel.send({
          content:
            `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
          embeds: [embed],
          components: [row]
        });

        return interaction.reply({
          content:
            `${EMOJI.ticket} Ticket wymiany utworzony: ${channel}`,
          flags: 64
        });

      } catch (err) {
        console.log("❌ Exchange error:", err);
      }
    }

    // =================================
    // CLOSE
    // =================================
    if (
      interaction.isButton() &&
      interaction.customId === "close_ticket"
    ) {

      try {

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

        const embed =
          new EmbedBuilder()

            .setColor("#ED4245")

            .setDescription(
              `${EMOJI.lock} Ticket zostanie zamknięty za 3 sekundy...`
            );

        await interaction.reply({
          embeds: [embed]
        });

        setTimeout(async () => {

          await interaction.channel
            .delete()
            .catch(() => {});

        }, 3000);

      } catch (err) {
        console.log("❌ Close ticket error:", err);
      }
    }
  });
};
