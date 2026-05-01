module.exports = (client) => {

    const VERIFIED_ROLE_ID = "1499521304146083954";

    const CHANNELS = [
        { id: "1499519884860854505", emoji: "✅" }, // legit check
        { id: "1499519935657935049", emoji: "⭐" }, // opinie
        { id: "1499512781861556314", emoji: "🎫" }, // ticket
        { id: "1499513009188376767", emoji: "💱" }, // prowizje
        { id: "1499568863602540645", emoji: "🧮" }  // kalkulator
    ];

    client.on("guildMemberUpdate", async (oldMember, newMember) => {

        try {

            const hadRole = oldMember.roles.cache.has(VERIFIED_ROLE_ID);
            const hasRole = newMember.roles.cache.has(VERIFIED_ROLE_ID);

            if (hadRole || !hasRole) return;

            console.log("✅ Zweryfikowano:", newMember.user.tag);

            for (const data of CHANNELS) {

                const channel = await newMember.guild.channels.fetch(data.id);
                if (!channel) continue;

                const msg = await channel.send({
                    content: `${data.emoji} ${newMember}`,
                    allowedMentions: { users: [newMember.id] }
                });

                setTimeout(() => {
                    msg.delete().catch(() => {});
                }, 3000);
            }

        } catch (err) {
            console.log("❌ Błąd verify ping:", err.message);
        }

    });

};