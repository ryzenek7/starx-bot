const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1499519884860854505";

  // =====================
  // STORAGE (per message)
  // =====================
  const panels = new Map();
  const cooldown = new Map();

  // =====================
  // PANEL
  // =====================
  async function sendPanel() {

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌟 StarX Exchange » CZY JESTEŚMY LEGIT")
      .setDescription(`
<a:1499784353012514917:1499784353012514917> TAK

<a:1499784378992295956:1499784378992295956> NIE

⚠️ Głosuj odpowiedzialnie
      `)
      .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
      .setFooter({ text: "© 2026 StarX Exchange x Legit Check" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("legit_yes")
        .setLabel("0")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("legit_no")
        .setLabel("0")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await channel.send({
      embeds: [embed],
      components: [row]
    });

    panels.set(msg.id, {
      yes: 0,
      no: 0,
      voters: new Set()
    });
  }

  // =====================
  // READY
  // =====================
  client.once(Events.ClientReady, async () => {
    await sendPanel();
    console.log("✅ Legit panel loaded");
  });

  // =====================
  // BUTTONS
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isButton()) return;

    const panel = panels.get(interaction.message.id);
    if (!panel) return;

    const userId = interaction.user.id;

    // =====================
    // COOLDOWN ANTI-SPAM
    // =====================
    const lastClick = cooldown.get(userId) || 0;
    if (Date.now() - lastClick < 3000) {
      return interaction.reply({
        content: "❌ Klikasz za szybko.",
        flags: 64
      });
    }

    cooldown.set(userId, Date.now());

    // =====================
    // ALREADY VOTED
    // =====================
    if (panel.voters.has(userId)) {
      return interaction.reply({
        content: "❌ Już oddałeś głos.",
        flags: 64
      });
    }

    panel.voters.add(userId);

    // =====================
    // VOTE UPDATE
    // =====================
    if (interaction.customId === "legit_yes") panel.yes++;
    if (interaction.customId === "legit_no") panel.no++;

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    const newEmbed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌟 StarX Exchange » CZY JESTEŚMY LEGIT")
      .setDescription(`
<a:1499784353012514917:1499784353012514917> TAK

<a:1499784378992295956:1499784378992295956> NIE

📊 Wyniki:
✔️ TAK: **${panel.yes}**
❌ NIE: **${panel.no}**

⚠️ Głosuj uczciwie
      `)
      .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
      .setFooter({ text: "© 2026 StarX Exchange x Legit Check" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("legit_yes")
        .setLabel(`${panel.yes}`)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("legit_no")
        .setLabel(`${panel.no}`)
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.update({
      embeds: [newEmbed],
      components: [row]
    });
  });
};
