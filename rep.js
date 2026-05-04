const { EmbedBuilder, Events } = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1500893110048133253";
  let panelMessageId = null;

  // =========================
  // PANEL
  // =========================
  async function sendPanel(channel) {
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌟 StarX Exchange × LEGIT CHECK")
      .setDescription(
`Dziękujemy za wybranie **StarX Exchange**! Twój legitcheck jest dla nas bardzo ważny i pomaga budować zaufanie.

📄 **WZÓR LEGITCHECKA:**
\`\`\`
+rep @seller Purchased [co] [kwota]PLN [metoda]
\`\`\`

📌 **PRZYKŁAD:**
\`\`\`
+rep @jarek.svx Purchased Konto Stake 40PLN [BLIK]
\`\`\`

© 2026 StarX Exchange`
      )
      .setFooter({ text: "StarX Exchange" });

    const msg = await channel.send({ embeds: [embed] });
    panelMessageId = msg.id;
  }

  // =========================
  // READY
  // =========================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału rep");

      const messages = await channel.messages.fetch({ limit: 50 });
      await channel.bulkDelete(messages, true).catch(() => {});

      await sendPanel(channel);

      console.log("✅ Rep panel uruchomiony");

    } catch (err) {
      console.log("❌ Rep Ready error:", err);
    }
  });

  // =========================
  // BLOKADA + RESET
  // =========================
  client.on(Events.MessageCreate, async (message) => {
    try {
      if (message.channel.id !== CHANNEL_ID) return;
      if (message.author.bot) return;

      await message.delete().catch(() => {});

      const channel = message.channel;

      if (panelMessageId) {
        const oldMsg = await channel.messages.fetch(panelMessageId).catch(() => null);
        if (oldMsg) await oldMsg.delete().catch(() => {});
      }

      await sendPanel(channel);

    } catch (err) {
      console.log("❌ Rep Message error:", err);
    }
  });

};
