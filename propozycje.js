// propozycje.js FINAL PREMIUM

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1499573354712010872";

  // =====================
  // EMOJI SERWEROWE
  // =====================
  const EMOJI = {
    pin: "<:pin:1501697389050986546>",
    zap: "<:zap:1501697151737139350>",
    green: "<a:green:1501990166082879538>",
    users: "<:users:1500243884733894716>"
  };

  client.on(Events.MessageCreate, async (message) => {

    try {

      if (message.author.bot) return;
      if (message.channel.id !== CHANNEL_ID) return;
      if (!message.content) return;

      // =====================
      // DELETE USER MESSAGE
      // =====================
      await message.delete().catch(() => {});

      // =====================
      // AVATAR
      // =====================
      const avatar = message.author.displayAvatarURL({
        dynamic: true,
        size: 512
      });

      // =====================
      // DATE
      // =====================
      const now = new Date().toLocaleString("pl-PL");

      // =====================
      // EMBED
      // =====================
      const embed = new EmbedBuilder()

        .setColor("#2b2d31")

        .setTitle("🌟 StarX Exchange » PROPOZYCJA")

        .setDescription(
[
`## ${EMOJI.green} Autor propozycji`,
`> <@${message.author.id}>`,
``,
`## ${EMOJI.pin} Treść`,
"```",
`${message.content}`,
"```",
``,
`## ${EMOJI.zap} Informacje`,
`> 📅 Dodano: ${now}`,
`> 💬 Głosuj reakcjami poniżej`,
`> 🧠 Zachowaj kulturę w dyskusji`
].join("\n")
        )

        .setThumbnail(avatar)

        .setImage(
          "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
        )

        .setFooter({
          text: "© 2026 StarX Exchange • Propozycje"
        })

        .setTimestamp();

      // =====================
      // SEND EMBED
      // =====================
      const sent = await message.channel.send({
        embeds: [embed]
      });

      // =====================
      // REACTIONS
      // =====================
      await sent.react("✅");
      await sent.react("❌");
      await sent.react("🤍");

      // =====================
      // THREAD
      // =====================
      await sent.startThread({
        name: `Dyskusja • ${message.author.username}`,
        autoArchiveDuration: 1440
      });

      console.log("✅ Propozycja wysłana");

    } catch (err) {

      console.log("❌ propozycje error:", err);
    }
  });
};
