// stakeacc.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
  Events
} = require("discord.js");

module.exports = (client) => {
  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = "1499478004265517396";
  const OWNER_ID = "1367768195167031403";
  const CHANNEL_ID = "1499812157246669001";

  let stock = 4;
  let panelMessageId = null;

  // ===============================
  // REGISTER SLASH COMMANDS
  // ===============================
  async function registerCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName("stakeadd")
        .setDescription("Dodaj stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeremove")
        .setDescription("Usuń stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakeset")
        .setDescription("Ustaw stock")
        .addIntegerOption(option =>
          option.setName("ilosc")
            .setDescription("Ilość")
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName("stakepanel")
        .setDescription("Odśwież panel")
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Slash komendy Stake dodane");
  }

  // ===============================
  // PANEL
  // ===============================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      if (panelMessageId) {
        try {
          const oldMsg = await channel.messages.fetch(panelMessageId);
          if (oldMsg) await oldMsg.delete();
        } catch {}
      }

      const embed = new EmbedBuilder()
        .setColor("#2b59ff")
        .setTitle("🌟 StarX Exchange » KONTO STAKE 🎰")
        .setDescription(
          "⚡ Natychmiastowa realizacja\n" +
          "🔒 Full Access Account\n" +
          "🎯 Zweryfikowane konto\n\n" +
          "📦 Wybierz opcję z menu poniżej"
        )
        .setImage("https://i.imgur.com/IkCEHh1_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange"
        })
        .setTimestamp();

      const menu = new StringSelectMenuBuilder()
        .setCustomId("stake_menu")
        .setPlaceholder("📦 Wybierz opcję")
        .addOptions([
          {
            label: "Zobacz cenę",
            value: "price",
            emoji: "💸"
          },
          {
            label: "Dostępne sztuki",
            value: "stock",
            emoji: "📦"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const msg = await channel.send({
        embeds: [embed],
        components: [row]
      });

      panelMessageId = msg.id;

    } catch (err) {
      console.log("❌ stake panel error:", err);
    }
  }

  // ===============================
  // READY
  // ===============================
  client.once(Events.ClientReady, async () => {
    await registerCommands();
    await sendPanel();
  });

  // ===============================
  // MENU + SLASH
  // ===============================
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      // ================= MENU
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId !== "stake_menu") return;

        if (interaction.values[0] === "price") {
          return interaction.reply({
            content:
              "🎮 **KONTO STAKE (2 POZIOM WERYFIKACJI):**\n" +
              "- 🔓 Pełny dostęp (E-mail oraz Stake)\n" +
              "- 🪪 Zweryfikowane dowodem osobistym\n" +
              "- 🎯 Gotowe do wpłat i wypłat\n\n" +
              "💸 **Cena: 40 ZŁ**",
            flags: 64
          });
        }

        if (interaction.values[0] === "stock") {
          return interaction.reply({
            content: `📦 **Dostępne sztuki: ${stock}**`,
            flags: 64
          });
        }
      }

      // ================= SLASH
      if (!interaction.isChatInputCommand()) return;

      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: "❌ Nie masz permisji.",
          flags: 64
        });
      }

      // /stakeadd
      if (interaction.commandName === "stakeadd") {
        const amount = interaction.options.getInteger("ilosc");

        stock += amount;
        await sendPanel();

        return interaction.reply({
          content: `✅ Dodano ${amount}\n📦 Aktualnie: ${stock}`,
          flags: 64
        });
      }

      // /stakeremove
      if (interaction.commandName === "stakeremove") {
        const amount = interaction.options.getInteger("ilosc");

        stock -= amount;
        if (stock < 0) stock = 0;

        await sendPanel();

        return interaction.reply({
          content: `✅ Usunięto ${amount}\n📦 Aktualnie: ${stock}`,
          flags: 64
        });
      }

      // /stakeset
      if (interaction.commandName === "stakeset") {
        const amount = interaction.options.getInteger("ilosc");

        stock = amount;
        await sendPanel();

        return interaction.reply({
          content: `✅ Ustawiono stock na ${stock}`,
          flags: 64
        });
      }

      // /stakepanel
      if (interaction.commandName === "stakepanel") {
        await sendPanel();

        return interaction.reply({
          content: "✅ Panel odświeżony.",
          flags: 64
        });
      }

    } catch (err) {
      console.log("❌ stake interaction error:", err);
    }
  });
};
