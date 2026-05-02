const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499812157246669001";

  // STOCK
  let stock = 7;

  // ========================
  // READY
  // ========================
  client.once(Events.ClientReady, async () => {
    console.log(`✅ ${client.user.tag}`);

    // rejestracja komendy
    await client.application.commands.create(
      new SlashCommandBuilder()
        .setName("stakeustaw")
        .setDescription("Ustaw ilość kont stake")
        .addIntegerOption(option =>
          option
            .setName("ilosc")
            .setDescription("Nowa ilość kont")
            .setRequired(true)
        )
        .toJSON()
    );

    sendPanel();
  });

  // ========================
  // PANEL
  // ========================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("⭐ StarX Exchange » KONTO STAKE 🎰")
        .setDescription(
          `💸 Wybierz opcję z menu poniżej.\n\n📦 **Dostępnych kont: ${stock} szt.**`
        )
        .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę konta",
            value: "konto_stake",
            emoji: "💰"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

    } catch (err) {
      console.log(err);
    }
  }

  // ========================
  // INTERACTIONS
  // ========================
  client.on(Events.InteractionCreate, async (interaction) => {

    // slash komenda
    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "stakeustaw") {
        const ilosc = interaction.options.getInteger("ilosc");

        stock = ilosc;

        return interaction.reply({
          content: `✅ Ustawiono ilość kont na **${stock}**`,
          ephemeral: true
        });
      }
    }

    // menu
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "stake_menu") return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("⭐ KONTO STAKE » CENA")
        .setDescription(`
🎮 **KONTO STAKE (2 POZIOM WERYFIKACJI)**

📦 **Dostępnych kont: ${stock} szt.**

💸 **Cena: 40 ZŁ**
        `);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

      // reset menu
      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę konta",
            value: "konto_stake",
            emoji: "💰"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.message.edit({
        components: [row]
      });
    }

  });
};
