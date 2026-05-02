const { EmbedBuilder, Events } = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499573354712010872";

  console.log("✅ propozycje.js załadowany");

  client.on(Events.MessageCreate, async (message) => {
    try {
      console.log("NOWA WIADOMOŚĆ:", message.content);

      if (message.author.bot) return;
      if (!message.guild) return;
      if (message.channel.id !== CHANNEL_ID) return;

      const text = message.content.trim();
      if (!text) return;

      await message.delete().catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#2b59ff")
        .setTitle("🌟 StarX Exchange ✖ PROPOZYCJA")
        .setDescription(
          `👤 **Opublikował:** ${message.author}\n` +
          `📝 **Treść Propozycji:** ${text}\n` +
          `📅 **Data:** <t:${Math.floor(Date.now() / 1000)}:F>`
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "© 2026 StarX Exchange"
        })
        .setTimestamp();

      const msg = await message.channel.send({
        embeds: [embed]
      });

      await msg.react("👍");
      await msg.react("👎");

      await msg.startThread({
        name: "Dyskusja na temat propozycji",
        autoArchiveDuration: 1440
      });

      console.log("✅ Propozycja wysłana");
    } catch (err) {
      console.log("❌ propozycje error:", err);
    }
  });
};
