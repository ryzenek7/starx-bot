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
    // /LC COMMAND
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName !== "lc") return;

        try {

            const embed = new EmbedBuilder()

                .setColor("#2b2d31")

                .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)

                .setDescription(
                    [
                        `> ${EMOJI.pin} Wystaw legit check po zakończonej transakcji`,
                        "",
                        `## ${EMOJI.zap} Wzór`,
                        "```",
                        "+rep @user Exchanged BLIK -> LTC 30 PLN",
                        "```",
                        `${EMOJI.lock} Ticket zamknie się automatycznie po wysłaniu wiadomości na <#${LEGIT_CHANNEL_ID}>`
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

            console.log("❌ LC command error:", err);

            if (!interaction.replied) {

                await interaction.reply({
                    content: "❌ Wystąpił błąd.",
                    flags: 64
                });
            }
        }
    });

    // =========================================
    // AUTO CLOSE AFTER LEGIT CHECK
    // =========================================
    client.on(Events.MessageCreate, async message => {

        try {

            if (message.author.bot) return;

            // tylko legit-check
            if (message.channel.id !== LEGIT_CHANNEL_ID) return;

            const guild = message.guild;

            // znajdź ticket użytkownika
            const ticketChannel = guild.channels.cache.find(c =>
                c.name.includes(message.author.username.toLowerCase())
            );

            if (!ticketChannel) return;

            // info o zamknięciu
            const embed = new EmbedBuilder()

                .setColor("#57F287")

                .setDescription(
                    `${EMOJI.lock} Legit check wykryty — zamykam ticket za 3 sekundy`
                );

            await ticketChannel.send({
                embeds: [embed]
            });

            // delete po 3s
            setTimeout(async () => {

                await ticketChannel.delete().catch(() => {});

            }, 3000);

        } catch (err) {

            console.log("❌ Auto close error:", err);
        }
    });
};
