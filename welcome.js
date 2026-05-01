const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    const WELCOME_CHANNEL_ID = "1499527016347865399";

    client.on("guildMemberAdd", async (member) => {

        try {

            console.log("NOWY USER:", member.user.tag);

            const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("👋 WITAJ NA SERWERZE!")
                .setDescription(`
**Cześć ${member}!** 👋

📌 Oto ważne kanały:

💱 <#1499513009188376767>
🎫 <#1499512781861556314>
✅ <#1499519884860854505>
⭐ <#1499519935657935049>
🧮 <#1499568863602540645>
🥩<#1499812157246669001>

💡 Życzymy miłego pobytu na serwerze i udanych wymian! 🔥
                `)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: "StarX Exchange • 2026"
                })
                .setTimestamp();

            await channel.send({
                content: `🎉 ${member}`,
                embeds: [embed],
                allowedMentions: { users: [member.id] }
            });

        } catch (err) {
            console.log("❌ Błąd welcome:", err.message);
        }

    });

};
