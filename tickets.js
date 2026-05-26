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

  // ✅ COLOR (dodany jak chciałeś)
  const EMBED_COLOR = "#1b2dff";

  const exchangeData = new Map();

  const EMOJI = {
    arrow: "<a:arrow:1508094625984811038>",
    warning: "<:warning:1501693444030992395>",
    ticket: "<:ticket:1501697124734206032>",
    money: "<a:money:1501685438103031920>",
    lock: "<:lock:1501697222901895258>"
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

  client.once(Events.ClientReady, async () => {

    const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`${EMOJI.ticket} System Ticketów`)
      .setDescription("Wybierz kategorię")
      .setFooter({ text: "© 2026 StarX Exchange" });

    await channel.send({
      embeds: [embed],
      components: [createMenu()]
    });
  });

  client.on(Events.InteractionCreate, async (interaction) => {

    // ===================== MENU =====================
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

      const type = interaction.values[0];

      if (type === "exchange") {

        const modal = new ModalBuilder()
          .setCustomId("exchange_modal")
          .setTitle("Wymiana");

        const amount = new TextInputBuilder()
          .setCustomId("exchange_amount")
          .setLabel("Kwota")
          .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(amount));

        return interaction.showModal(modal);
      }

      let name = type;

      const channel = await interaction.guild.channels.create({
        name: `${type}-${interaction.user.username}`.toLowerCase(),
        topic: interaction.user.id,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          },
          {
            id: REALIZATOR_ROLE_ID,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`Ticket ${name}`)
        .setDescription(`Utworzono ticket`)
        .setFooter({ text: "© 2026 StarX Exchange" });

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed]
      });

      return interaction.reply({
        content: `Ticket: ${channel}`,
        ephemeral: true
      });
    }

    // ===================== MODAL =====================
    if (interaction.isModalSubmit() && interaction.customId === "exchange_modal") {

      const amount = interaction.fields.getTextInputValue("exchange_amount");

      exchangeData.set(interaction.user.id, { amount });

      const fromMenu = new StringSelectMenuBuilder()
        .setCustomId("exchange_from")
        .setPlaceholder("Z czego")
        .addOptions([
          { label: "BLIK", value: "BLIK" },
          { label: "PAYPAL", value: "PAYPAL" },
          { label: "CRYPTO", value: "CRYPTO" },
          { label: "LTC", value: "LTC" }
        ]);

      const toMenu = new StringSelectMenuBuilder()
        .setCustomId("exchange_to")
        .setPlaceholder("Na co")
        .addOptions([
          { label: "BLIK", value: "BLIK" },
          { label: "PAYPAL", value: "PAYPAL" },
          { label: "CRYPTO", value: "CRYPTO" },
          { label: "LTC", value: "LTC" }
        ]);

      const button = new ButtonBuilder()
        .setCustomId("create_exchange_ticket")
        .setLabel("Utwórz ticket")
        .setStyle(ButtonStyle.Success);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("Wymiana")
            .setDescription(`Kwota: ${amount}`)
        ],
        components: [
          new ActionRowBuilder().addComponents(fromMenu),
          new ActionRowBuilder().addComponents(toMenu),
          new ActionRowBuilder().addComponents(button)
        ],
        ephemeral: true
      });
    }

    // ===================== SAVE FROM =====================
    if (interaction.isStringSelectMenu() && interaction.customId === "exchange_from") {
      const data = exchangeData.get(interaction.user.id) || {};
      data.from = interaction.values[0];
      exchangeData.set(interaction.user.id, data);
      return interaction.deferUpdate();
    }

    // ===================== SAVE TO =====================
    if (interaction.isStringSelectMenu() && interaction.customId === "exchange_to") {
      const data = exchangeData.get(interaction.user.id) || {};
      data.to = interaction.values[0];
      exchangeData.set(interaction.user.id, data);
      return interaction.deferUpdate();
    }

    // ===================== CREATE =====================
    if (interaction.isButton() && interaction.customId === "create_exchange_ticket") {

      const data = exchangeData.get(interaction.user.id);

      if (!data?.from || !data?.to)
        return interaction.reply({
          content: "Wybierz opcje",
          ephemeral: true
        });

      const channel = await interaction.guild.channels.create({
        name: `exchange-${interaction.user.username}`,
        topic: interaction.user.id,
        type: ChannelType.GuildText
      });

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("Exchange ticket")
            .setDescription(`${data.from} -> ${data.to}`)
        ]
      });

      exchangeData.delete(interaction.user.id);

      return interaction.update({
        content: `Ticket: ${channel}`,
        embeds: [],
        components: []
      });
    }

    // ===================== CLOSE =====================
    if (interaction.isButton() && interaction.customId === "close_ticket") {

      if (!interaction.member.roles.cache.has(REALIZATOR_ROLE_ID))
        return interaction.reply({ content: "Brak permisji", ephemeral: true });

      await interaction.reply({ content: "Zamykam..." });

      setTimeout(() => interaction.channel.delete(), 3000);
    }
  });
};
