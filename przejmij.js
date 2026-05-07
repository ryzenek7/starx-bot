const {
    Events,
    EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // CONFIG
    // =========================================
    const LEGIT_CHANNEL_ID = "1499519884860854505";

    // =========================================
    // CUSTOM EMOJIS
    // =========================================
    const EMOJI = {
        pin: "<:pin:1501697389050986546>",
        zap: "<:zap:1501697151737139350>",
        lock: "<:lock:1501697222901895258>",
        money: "<a:money:1501685438103031920>"
    };

    // =========================================
    // COMMAND
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName !== "przejmij") return;

        try {

            const user = interaction.options.getUser("uzytkownik");
            const metoda = interaction.options.getString("metoda");
            const kwota = interaction.options.getString("kwota");

            // =====================================
            // FORMATKA
            // =====================================
            const vouch =
                `+rep @${user.username} Exchanged ${metoda} ${kwota}`;

            // =====================================
            // EMBED
            // =====================================
            const embed = new EmbedBuilder()

                .setColor("#2b2d31")

                .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)

                .setDescription(
                    [
                        `> ${EMOJI.pin} Prosimy o wystawienie legit checka`,
                        "",
                        `## ${EMOJI.zap} Wzór`,
                        "```",
                        vouch,
                        "```",
                        `${EMOJI.lock} Ticket zostanie zamknięty po wysłaniu voucha na <#${LEGIT_CHANNEL_ID}>`
                    ].join("\n")
                )

                .setThumbnail(interaction.guild.iconURL())

                .setFooter({
                    text: "StarX Exchange • Legit System"
                })

                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

        } catch (err) {

            console.log("❌ Przejmij error:", err);

            if (!interaction.replied) {

                await interaction.reply({
                    content: "❌ Wystąpił błąd.",
                    flags: 64
                });
            }
        }
    });
};
