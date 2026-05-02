const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

module.exports = (client) => {

  // =====================
  // USTAWIENIA
  // =====================
  const CHANNEL_ID = "1499519884860854505";

  const START_YES = 1;
  const START_NO = 1;

  let yesVotes = START_YES;
  let noVotes = START_NO;

  const votedUsers = new Set();
  let legitMessageId = null;

  // =====================
  // PANEL
  // =====================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału legit.");

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🌟 StarX Exchange » CZY JESTEŚMY LEGIT")
        .setDescription(
`<:yes:1499784353012514917> Jeśli uważasz, że **TAK**, kliknij przycisk poniżej.

<:no:1499784378992295956> Jeśli uważasz, że **NIE**, kliknij przycisk poniżej.

⚠️ Oddanie głosu <:no:1499784378992295956> bez dowodu i sensownego powodu może skutkować karą.`
        )
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({ text: "© 2026 StarX Exchange x Legit Check" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("legit_yes")
          .setLabel(`${yesVotes}`)
          .setEmoji("1499784353012514917")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("legit_no")
          .setLabel(`${noVotes}`)
          .setEmoji("1499784378992295956")
          .setStyle(ButtonStyle.Secondary)
      );

      const msg = await channel.send({
        embeds: [embed],
        components: [row]
      });

      legitMessageId = msg.id;

      console.log("✅ Panel legit wysłany.");

    } catch (err) {
      console.log("❌ Błąd legit.js:", err);
    }
  }

  // =====================
  // READY
  // =====================
  client.once(Events.ClientReady, async () => {
    await sendPanel();
  });

  // =====================
  // BUTTONY
  // =====================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.message.id !== legitMessageId) return;

    const userId = interaction.user.id;

    if (votedUsers.has(userId)) {
      return interaction.reply({
        content: "❌ Już oddałeś głos.",
        flags: 64
      });
    }

    votedUsers.add(userId);

    if (interaction.customId === "legit_yes") yesVotes++;
    if (interaction.customId === "legit_no") noVotes++;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌟 StarX Exchange » CZY JESTEŚMY LEGIT")
      .setDescription(
`<:yes:1499784353012514917> Jeśli uważasz, że **TAK**, kliknij przycisk poniżej.

<:no:1499784378992295956> Jeśli uważasz, że **NIE**, kliknij przycisk poniżej.

⚠️ Oddanie głosu <:no:1499784378992295956> bez dowodu i sensownego powodu może skutkować karą.`
      )
      .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
      .setFooter({ text: "© 2026 StarX Exchange x Legit Check" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("legit_yes")
        .setLabel(`${yesVotes}`)
        .setEmoji("1499784353012514917")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("legit_no")
        .setLabel(`${noVotes}`)
        .setEmoji("1499784378992295956")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  });

};
