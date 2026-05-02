// propozycje.js FINAL PREMIUM

const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {
  const CHANNEL_ID = "1499573354712010872";

  client.on(Events.MessageCreate, async (message) => {
    try {
      if (message.author.bot) return;
      if (message.channel.id !== CHANNEL_ID) return;
      if (!message.content) return;

      // usuń zwykłą wiadomość użytkownika
      await message.delete().catch(() => {});

      // avatar
      const avatar =
        message.author.displayAvatarURL({ dynamic: true, size: 512 });

      // data
      const now = new Date().toLocaleString("pl-PL");

      // embed
      const embed = new EmbedBuilder()
        .setColor("#2b59ff")
        .setTitle("💧 StarX Exchange × PROPOZYCJA")
        .setDescription(
          `👤 **Opublikował:** <@${message.author.id}>\n` +
          `📝 **Treść propozycji:** ${message.content}\n` +
          `📅 **Data opublikowania:** ${now}`
        )
        .setThumbnail(avatar)
        .setFooter({
          text: `© 2026 StarX Exchange × Propozycja • ${now}`
        });

      // wyślij embed
      const sent = await message.channel.send({
        embeds: [embed]
      });

      // reakcje
      await sent.react("👍");
      await sent.react("👎");
      await sent.react("🤍");

      // thread
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
