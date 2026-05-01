const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  // ========================
  // CONFIG
  // ========================
  const CHANNEL_ID = "1499902366843932763";

  // ========================
  // READY
  // ========================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("💰 StarX Exchange » CENNIK")
        .setDescription(
          "➤ Wybierz kategorię z menu poniżej, aby zobaczyć aktualne ceny kont.\n\n" +
          "⚠️ Cennik ma charakter informacyjny i może ulec zmianie."
        )
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({ text: "© 2026 StarX Exchange" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("starx_cennik")
        .setPlaceholder("Wybierz interesujący cię produkt..")
        .addOptions([
          {
            label: "KONTA PREMIUM",
            value: "konta",
            emoji: "💎"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Cennik wysłany");

    } catch (err) {
      console.log("❌ Błąd:", err);
    }
  });

  // ========================
  // MENU
  // ========================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "starx_cennik") return;

    try {

      // odpowiedź użytkownikowi
      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("💎 StarX Exchange » KONTA PREMIUM")
        .setDescription(
          "🎵 **Spotify Premium Lifetime** — `30 zł`\n\n" +
          "▶️ **YouTube Premium** — `15 zł`\n\n" +
          "🎬 **Netflix Lifetime Account** — `30 zł`"
        )
        .setFooter({ text: "StarX Exchange • Najniższe prowizje" });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

      // reset menu (bez zaznaczenia)
      const menu = new StringSelectMenuBuilder()
        .setCustomId("starx_cennik")
        .setPlaceholder("Wybierz interesujący cię produkt..")
        .addOptions([
          {
            label: "KONTA PREMIUM",
            value: "konta",
            emoji: "💎"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.message.edit({
        components: [row]
      });

    } catch (err) {
      console.log("❌ Błąd menu:", err);
    }

  });

};
