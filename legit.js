const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

module.exports = (client) => {

  // =====================
  // CONFIG
  // =====================
  const CHANNEL_ID = "1499519884860854505";

  // EMOJI
  const YES_EMOJI = "<:tak:1499784353012514917>";
  const NO_EMOJI = "<:nie:1499784378992295956>";

  let yesVotes = 1;
  let noVotes = 1;

  let legitMessageId = null;
  const votedUsers = new Set();

  // =====================
  // SEND PANEL
  // =====================
  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🌟 StarX Exchange » CZY JESTEŚMY LEGIT")
        .setDescription(
`${YES_EMOJI} Jeśli uważasz, że **TAK**, kliknij przycisk poniżej.

${NO_EMOJI} Jeśli uważasz, że **NIE**, kliknij przycisk poniżej.

⚠️ Oddanie głosu ${NO_EMOJI} bez dowodu i sensownego powodu może skutkować karą.`
        )
        .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
        .setFooter({
          text: "© 2026 StarX Exchange x Legit Check"
        });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("legit_yes")
          .setEmoji("1499784353012514917")
          .setLabel(`${yesVotes}`)
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("legit_no")
          .setEmoji("1499784378992295956")
          .setLabel(`${noVotes}`)
          .setStyle(ButtonStyle.Secondary)
      );

      const msg = await channel.send({
        embeds: [embed],
        components: [row]
      });

      legitMessageId = msg.id;

      console.log("✅ Legit panel wysłany");

    } catch (err) {
      console.log("❌ legit.js error:", err);
    }
  }

  // =====================
  // READY
  // =====================
  client.once(Events.ClientReady, async () => {
    await sendPanel();
  });

  // =====================
  // BUTTONS
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
`${YES_EMOJI} Jeśli uważasz, że **TAK**, kliknij przycisk poniżej.

${NO_EMOJI} Jeśli uważasz, że **NIE**, kliknij przycisk poniżej.

⚠️ Oddanie głosu ${NO_EMOJI} bez dowodu i sensownego powodu może skutkować karą.`
      )
      .setImage("https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand")
      .setFooter({
        text: "© 2026 StarX Exchange x Legit Check"
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("legit_yes")
        .setEmoji("1499784353012514917")
        .setLabel(`${yesVotes}`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("legit_no")
        .setEmoji("1499784378992295956")
        .setLabel(`${noVotes}`)
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  });

};
