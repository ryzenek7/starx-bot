const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

// CONFIG
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1499478004265517396";
const PROWIZJE_CHANNEL = "1499513009188376767";

// CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// =====================
// MODUŁY MUSZĄ BYĆ TU!
// =====================
require("./tickets")(client);
require("./welcome")(client);
require("./legit")(client);
require("./opinie")(client);
require("./kalkulator")(client);
require("./verify")(client);
require("./verifyping")(client);

// =====================
// PANEL PROWIZJI
// =====================
async function sendProwizjePanel() {
  try {
    const channel = await client.channels.fetch(PROWIZJE_CHANNEL);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 20 });

    const oldPanel = messages.find(
      msg =>
        msg.author.id === client.user.id &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title === "💱 Wymień Hajs × Prowizje"
    );

    if (oldPanel) {
      console.log("✅ Panel prowizji już istnieje");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("💱 Wymień Hajs × Prowizje")
      .setDescription("📦 Wybierz metodę płatności poniżej");

    const select = new StringSelectMenuBuilder()
      .setCustomId("prowizje_select")
      .setPlaceholder("🏆 Wybierz metodę")
      .addOptions([
        { label: "PayPal", value: "paypal" },
        { label: "BLIK", value: "blik" },
        { label: "CRYPTO", value: "crypto" }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    console.log("✅ Panel prowizji wysłany");

  } catch (err) {
    console.log("❌ Błąd panelu prowizji:", err.message);
  }
}

// =====================
// READY
// =====================
client.once(Events.ClientReady, async () => {

  try {

    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    await sendProwizjePanel();

    const commands = [
      new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Restartuje bota")
        .toJSON()
    ];

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ /reset dodane");

  } catch (err) {
    console.log("❌ Błąd ready:", err.message);
  }

});

// =====================
// INTERACTIONS
// =====================
client.on(Events.InteractionCreate, async interaction => {

  try {

    if (interaction.isStringSelectMenu()) {

      if (interaction.customId === "prowizje_select") {

        let txt = "Brak danych";

        if (interaction.values[0] === "paypal")
          txt = "💳 PAYPAL ➜ BLIK 5%";

        if (interaction.values[0] === "blik")
          txt = "💱 BLIK ➜ CRYPTO 8%";

        if (interaction.values[0] === "crypto")
          txt = "🪙 CRYPTO ➜ BLIK 3%";

        return interaction.reply({
          content: txt,
          ephemeral: true
        });
      }
    }

    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "reset") {

        await interaction.reply({
          content: "🔄 Restartuję...",
          ephemeral: true
        });

        setTimeout(() => process.exit(0), 1000);
      }
    }

  } catch (err) {
    console.log("❌ Błąd interaction:", err.message);
  }

});

// =====================
// ERROR HANDLERS
// =====================
process.on("unhandledRejection", err => {
  console.log("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", err => {
  console.log("❌ Uncaught Exception:", err);
});

// LOGIN
client.login(TOKEN);