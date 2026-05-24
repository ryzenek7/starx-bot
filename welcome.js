const { EmbedBuilder, Events } = require("discord.js");

module.exports = (client) => {

  const WELCOME_CHANNEL_ID = "1499527016347865399";

  // =====================
  // EMOJI
  // =====================
  const EMOJI = {
    wave: "👋",
    star: "🌟",
    ticket: "🎫",
    legit: "✅",
    calc: "🧮",
    exchange: "💱",
    users: "<:users:1500243884733894716>",
    green: "<a:green:1501990166082879538>",
    zap: "<:zap:1501697151737139350>",
    pin: "<:pin:1501697389050986546>"
  };

  client.on(Events.GuildMemberAdd, async (member) => {

    try {

      const channel = await client.channels.fetch(WELCOME_CHANNEL_ID);
      if (!channel) return;

      const memberCount = member.guild.memberCount;

      const embed = new EmbedBuilder()

        .setColor("#2b2d31")

        .setTitle(`${EMOJI.wave} StarX Exchange » Welcome`)

        .setDescription(
[
`## ${EMOJI.green} Witaj na serwerze!`,
`> ${member} miło Cię widzieć na **StarX Exchange**`,
`> Jesteś **${memberCount}** osobą na serwerze`,
``,
`## ${EMOJI.pin} Ważne kanały`,
`> ${EMOJI.exchange} Wymiany — <#1499513009188376767>`,
`> ${EMOJI.ticket} Tickety — <#1499512781861556314>`,
`> ${EMOJI.legit} Legit Check — <#1499519884860854505>`,
`> ⭐ Opinie — <#1499519935657935049>`,
`> ${EMOJI.calc} Kalkulator — <#1499568863602540645>`,
``,
`## ${EMOJI.zap} Informacje`,
`> Zachowuj kulturę`,
`> Przeczytaj regulamin`,
`> Życzymy udanych wymian 🔥`
].join("\n")
        )

        .setThumbnail(
          member.user.displayAvatarURL({
            dynamic: true,
            size: 1024
          })
        )

        .setImage(
          "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
        )

        .setFooter({
          text: "© 2026 StarX Exchange"
        })

        .setTimestamp();

      await channel.send({
        content: `${EMOJI.wave} ${member}`,
        embeds: [embed]
      });

      console.log(`✅ Welcome sent to ${member.user.tag}`);

    } catch (err) {

      console.log("❌ Welcome error:", err);
    }
  });
};
