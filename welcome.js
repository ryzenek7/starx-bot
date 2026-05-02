const { EmbedBuilder, Events } = require("discord.js");

module.exports = (client) => {

  const WELCOME_CHANNEL_ID = "1499527016347865399";

  client.on(Events.GuildMemberAdd, async (member) => {
    try {

      console.log("✅ NOWY USER:", member.user.tag);

      const channel = await client.channels.fetch(WELCOME_CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału welcome");

      // numer osoby na serwerze
      const memberCount = member.guild.memberCount;

      const embed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle("👋 Witaj na StarX Exchange!")
        .setDescription(
`**${member}**, witamy na serwerze! 🔥

🎉 Jesteś **${memberCount}** osobą na serwerze!

📌 **Ważne kanały:**

💱 <#1499513009188376767>
🎫 <#1499512781861556314>
✅ <#1499519884860854505>
⭐ <#1499519935657935049>
🧮 <#1499568863602540645>
🥩 <#1499812157246669001>

💡 Życzymy miłego pobytu i udanych wymian!`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "StarX Exchange • 2026"
        })
        .setTimestamp();

      await channel.send({
        content: `🎉 ${member}`,
        embeds: [embed]
      });

    } catch (err) {
      console.log("❌ Welcome error:", err);
    }
  });

};
