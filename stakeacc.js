const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

const fs = require("fs");

module.exports = (client) => {
  const CHANNEL_ID = "1499812157246669001";
  const ADMIN_ID = "1499499185337012377";

  let stock = 0;

  if (fs.existsSync("./stock.json")) {
    stock = JSON.parse(fs.readFileSync("./stock.json")).stock;
  }

  function saveStock() {
    fs.writeFileSync("./stock.json", JSON.stringify({ stock }));
  }

  async function sendPanel() {
    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("⭐ StarX Exchange » KONTO STAKE 🎰")
      .setDescription(
        `💸 Wybierz opcję z menu poniżej.\n\n📦 Dostępne sztuki: **${stock}**`
      )
      .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand")
      .setFooter({ text: "© 2026 StarX Exchange x Stake" });

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
  }

  if (client.isReady()) sendPanel();
  else client.once(Events.ClientReady, sendPanel);

  client.on(Events.InteractionCreate, async (interaction) => {

    // MENU
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "stake_menu") return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("⭐ KONTO STAKE » CENA")
        .setDescription(`
🎮 **KONTO STAKE (2 POZIOM WERYFIKACJI):**

📦 Dostępne sztuki: **${stock}**

💸 **Cena: 40 ZŁ**
        `);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    // KOMENDA
    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "stakestock") {

        if (interaction.user.id !== ADMIN_ID)
          return interaction.reply({
            content: "❌ Brak permisji",
            ephemeral: true
          });

        const amount = interaction.options.getInteger("ilosc");

        stock = amount;
        saveStock();

        return interaction.reply({
          content: `✅ Ustawiono stock: ${stock}`,
          ephemeral: true
        });
      }

    }

  });
};
