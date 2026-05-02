// propozycje.js

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  // =========================
  // CONFIG
  // =========================
  const CHANNEL_ID = "1499573354712010872";

  // =========================
  // MESSAGE CREATE
  // =========================
  client.on(Events.MessageCreate, async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;
      if (message.channel.id !== CHANNEL_ID) return;

      const suggestion = message.content.trim();
      if (!suggestion) return;

      await message.delete().catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#2b59ff")
        .setTitle("🌟 StarX Exchange ✖ PROPOZYCJA")
        .setDescription(
          `👤 **Opublikował:** ${message.author}\n` +
          `📝 **Treść Propozycji:** ${suggestion}\n` +
          `📅 **Data Opublikowania:** <t:${Math.floor(Date.now() / 1000)}:F>`
        )
        .setThumbnail(
          message.author.displayAvatarURL({
            dynamic: true,
            size: 1024
          })
        )
        .setFooter({
          text: `© 2026 StarX Exchange x Propozycja • ${new Date().toLocaleString("pl-PL")}`
        })
        .setTimestamp();

      const sent = await message.channel.send({
        embeds: [embed]
      });

      await sent.react("👍");
      await sent.react("👎");

      await sent.startThread({
        name: "Dyskusja na temat propozycji",
        autoArchiveDuration: 1440
      });

      console.log("✅ Propozycja wysłana");

    } catch (err) {
      console.log("❌ propozycje error:", err);
    }
  });

};
