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

  const PANEL_CHANNEL_ID = "1499512781861556314";
  const REALIZATOR_ROLE_ID = "1500930428993933373";

  const exchangeData = new Map();

  const EMOJI = {
    arrow: "<a:arrow:1508094625984811038>",
    ticket: "<:ticket:1501697124734206032>",
    warning: "<:warning:1501693444030992395>",
    money: "<a:money:1501685438103031920>",
    blik: "<:blik:1499784231608389742>",
    paypal: "<:paypal:1499784258091483236>",
    ltc: "<:ltc:1499784285211726014>",
    crypto: "<:crypto:1499784635201224724>"
  };

  const rates = {
    "BLIK->PAYPAL": 2,
    "BLIK->CRYPTO": 8,
    "BLIK->LTC": 8,
    "PAYPAL->BLIK": 9,
    "CRYPTO->BLIK": 4,
    "LTC->BLIK": 4
  };

  function createMenu() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("🎫 Wybierz kategorię")
        .addOptions([
          { label: "Wymiana waluty", value: "exchange" },
          { label: "Zakup", value: "buy" },
          { label: "Pomoc", value: "help" },
          { label: "Middleman", value: "middleman" }
        ])
    );
  }

  // PANEL
  client.once(Events.ClientReady, async () => {

    const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#1e2328")
      .setTitle(`${EMOJI.ticket} 🌟 StarX Exchange`)
      .setDescription("Wybierz kategorię ticketu")
      .setImage("https://i.imgur.com/4KfOswz_d.webp")
      .setFooter({ text: "© 2026 StarX Exchange" });

    channel.send({
      embeds: [embed],
      components: [createMenu()]
    });

    console.log("✅ Panel wysłany");
  });

  client.on(Events.InteractionCreate, async (interaction) => {

    // =========================
    // MENU GŁÓWNE
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

      const type = interaction.values[0];

      if (type === "exchange") {

        const modal = new ModalBuilder()
          .setCustomId("exchange_amount_modal")
          .setTitle("Wymiana waluty");

        const amount = new TextInputBuilder()
          .setCustomId("amount")
          .setLabel("JAKA KWOTA")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(amount));

        return interaction.showModal(modal);
      }

      return interaction.reply({
        content: "Inne tickety wkrótce",
        ephemeral: true
      });
    }

    // =========================
    // KWOTA MODAL
    // =========================
    if (interaction.isModalSubmit() && interaction.customId === "exchange_amount_modal") {

      const amount = interaction.fields.getTextInputValue("amount");

      if (isNaN(amount)) {
        return interaction.reply({
          content: "Kwota musi być liczbą",
          ephemeral: true
        });
      }

      exchangeData.set(interaction.user.id, { amount });

      const row1 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("from")
          .setPlaceholder("Z CZEGO")
          .addOptions([
            { label: "BLIK", value: "BLIK" },
            { label: "PAYPAL", value: "PAYPAL" },
            { label: "CRYPTO", value: "CRYPTO" },
            { label: "LTC", value: "LTC" }
          ])
      );

      const row2 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("to")
          .setPlaceholder("NA CO")
          .addOptions([
            { label: "BLIK", value: "BLIK" },
            { label: "PAYPAL", value: "PAYPAL" },
            { label: "CRYPTO", value: "CRYPTO" },
            { label: "LTC", value: "LTC" }
          ])
      );

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("create_exchange")
          .setLabel("Utwórz ticket")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor("#1e2328")
            .setTitle("Wymiana waluty")
            .setDescription(`Kwota: **${amount} PLN**`)
        ],
        components: [row1, row2, button]
      });
    }

    // =========================
    // FROM
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === "from") {
      const data = exchangeData.get(interaction.user.id) || {};
      data.from = interaction.values[0];
      exchangeData.set(interaction.user.id, data);
      return interaction.deferUpdate();
    }

    // =========================
    // TO
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === "to") {
      const data = exchangeData.get(interaction.user.id) || {};
      data.to = interaction.values[0];
      exchangeData.set(interaction.user.id, data);
      return interaction.deferUpdate();
    }

    // =========================
    // CREATE TICKET
    // =========================
    if (interaction.isButton() && interaction.customId === "create_exchange") {

      const data = exchangeData.get(interaction.user.id);

      if (!data?.from || !data?.to) {
        return interaction.reply({
          content: "Wybierz Z CZEGO i NA CO",
          ephemeral: true
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `exchange-${interaction.user.username}`,
        topic: interaction.user.id,
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
              PermissionsBitField.Flags.SendMessages
            ]
          },
          {
            id: REALIZATOR_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      await channel.send({
        content: `${interaction.user} <@&${REALIZATOR_ROLE_ID}>`,
        embeds: [
          new EmbedBuilder()
            .setColor("#1e2328")
            .setTitle(`${EMOJI.money} Wymiana`)
            .setDescription(
              `Kwota: ${data.amount} PLN\nZ: ${data.from}\nNa: ${data.to}`
            )
        ]
      });

      exchangeData.delete(interaction.user.id);

      return interaction.update({
        content: `Ticket utworzony: ${channel}`,
        embeds: [],
        components: []
      });
    }
  });
};
