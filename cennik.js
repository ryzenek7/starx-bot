const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1499902366843932763";

  // ========================
  // EMOJI
  // ========================
  const EMOJI_SPOTIFY = "<:Spotify:1500238701718933627>";
  const EMOJI_NETFLIX = "<:Netflix:1500238788306403398>";
  const EMOJI_YT = "<:ytpremium:1500239415937859605>";
  const EMOJI_HBO = "<:HBOmax:1500239251143524464>";

  const EMOJI_NITRO = "<a:nitro:1501684762601848963>";
  const EMOJI_CRUNCHY = "<:crunchyroll:1501686424158605463>";
  const EMOJI_DISNEY = "<:disney:1501686870025699449>";
  const EMOJI_MONEY = "<a:money:1501685438103031920>";

  // ========================
  // PANEL
  // ========================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("💰 StarX Exchange » CENNIK")
        .setDescription(
`📦 Wybierz kategorię z menu poniżej.

⚡ Szybko • 🔒 Bezpiecznie • 💰 Tanio`
        )
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({ text: "© 2026 StarX Exchange" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("starx_cennik")
        .setPlaceholder("📦 Wybierz kategorię...")
        .addOptions([
          {
            label: "NITRO",
            value: "nitro",
            emoji: { id: "1501684762601848963", name: "nitro" }
          },
          {
            label: "STREAMING",
            value: "streaming",
            emoji: { id: "1500238788306403398", name: "Netflix" }
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      console.log("✅ Cennik wysłany");

    } catch (err) {
      console.log("❌ Cennik error:", err);
    }
  });

  // ========================
  // MENU
  // ========================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "starx_cennik") return;

    try {

      // =====================
      // NITRO
      // =====================
      if (interaction.values[0] === "nitro") {

        const embed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle(`${EMOJI_NITRO} StarX Exchange » NITRO`)
          .setDescription(
`${EMOJI_NITRO} **Nitro Boost (28 dni • Full Warranty)**  
${EMOJI_MONEY} \`20 zł\``
          )
          .setFooter({ text: "StarX Exchange • Najlepsze ceny" });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

      // =====================
      // STREAMING
      // =====================
      if (interaction.values[0] === "streaming") {

        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle(`${EMOJI_NETFLIX} StarX Exchange » STREAMING`)
          .setDescription(
`${EMOJI_SPOTIFY} **Spotify Premium LIFETIME [KEY]**  
${EMOJI_MONEY} \`26 zł\`

${EMOJI_NETFLIX} **Netflix Lifetime**  
${EMOJI_MONEY} \`20 zł\`

${EMOJI_HBO} **Max (HBO) Lifetime**  
${EMOJI_MONEY} \`10 zł\`

${EMOJI_DISNEY} **Disney+ Lifetime**  
${EMOJI_MONEY} \`10 zł\`

${EMOJI_CRUNCHY} **Crunchyroll Fan Lifetime**  
${EMOJI_MONEY} \`10 zł\`

${EMOJI_YT} **YouTube Premium**  
${EMOJI_MONEY} \`x zł\``
          )
          .setFooter({ text: "StarX Exchange • Najniższe ceny" });

        return interaction.reply({
          embeds: [embed],
          flags: 64
        });
      }

    } catch (err) {
      console.log("❌ Menu error:", err);
    }

  });

};
