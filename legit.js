const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

module.exports = (client) => {

  // =====================
  // USTAWIENIA
  // =====================
  const CHANNEL_ID = "1499519884860854505"; // kanał legit
  const START_YES = 1;
  const START_NO = 1;

  let yesVotes = START_YES;
  let noVotes = START_NO;

  const votedUsers = new Set();
  let legitMessageId = null;

  // =====================
  // READY
  // =====================
  client.once(Events.ClientReady, async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału legit.");

      const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('🌟 StarX Exchange » CZY JESTEŚMY LEGIT')
        .setDescription(
`✅ Jeśli uważasz, że **TAK**, zaznacz przycisk ✅

❌ Jeśli uważasz, że **NIE**, zaznacz przycisk ❌

⚠️ Zaznaczenie ❌ bez dowodu oraz sensownego powodu bedzie skutkowało karą.`
        )
        .setImage('https://i.imgur.com/0h2yrK7_d.webp?maxwidth=760&fidelity=grand')
        .setFooter({ text: '© 2026 StarX Exchange x Legit Check' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('legit_yes')
          .setLabel(`${yesVotes}`)
          .setEmoji('✔️')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('legit_no')
          .setLabel(`${noVotes}`)
          .setEmoji('✖️')
          .setStyle(ButtonStyle.Danger)
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
  });

  // =====================
  // BUTTON INTERACTION
  // =====================
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.message.id !== legitMessageId) return;

    const userId = interaction.user.id;

    if (votedUsers.has(userId)) {
      return interaction.reply({
        content: "❌ Już oddałeś głos.",
        ephemeral: true
      });
    }

    votedUsers.add(userId);

    if (interaction.customId === 'legit_yes') yesVotes++;
    if (interaction.customId === 'legit_no') noVotes++;

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('🌟 StarX Exchange » CZY JESTEŚMY LEGIT')
      .setDescription(
`☑️ Jeśli uważasz, że **TAK**, zaznacz przycisk ✅

❌ Jeśli uważasz, że **NIE**, zaznacz przycisk ❌

⚠️ Zaznaczenie ❌ bez dowodu skutkuje karą.`
      )
      .setImage('https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand')
      .setFooter({ text: '© 2026 StarX Exchange x Legit Check' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('legit_yes')
        .setLabel(`${yesVotes}`)
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('legit_no')
        .setLabel(`${noVotes}`)
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  });

};
