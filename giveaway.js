# giveaway.js

````js
const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // CONFIG
    // =========================================
    const GIVEAWAY_CHANNEL_ID = "1502022020487970948";

    // rola wymagana do udziału
    const REQUIRED_ROLE_ID = "1499521304146083954";

    // =========================================
    // EMOJI
    // =========================================
    const EMOJI = {
        gift: "<:gift:1502025560606507048>",
        pin: "<:pin:1501697389050986546>",
        zap: "<:zap:1501697151737139350>",
        lock: "<:lock:1501697222901895258>",
        green: "<a:green:1501990166082879538>",
        red: "<a:red:1501989543182864535>"
    };

    // =========================================
    // GIVEAWAY DATA
    // =========================================
    const participants = new Set();

    // =========================================
    // READY
    // =========================================
    client.once(Events.ClientReady, async () => {

        try {

            const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);

            if (!channel) return;

            const embed = new EmbedBuilder()

                .setColor("#2b2d31")

                .setTitle(`${EMOJI.gift} StarX Exchange » GIVEAWAY`)

                .setDescription(
                    [
                        `## ${EMOJI.green} Nagroda`,
                        "```",
                        "Discord Nitro Boost (1 miesiąc)",
                        "```",
                        "",
                        `## ${EMOJI.pin} Wymagania`,
                        `> ${EMOJI.green} Zweryfikowane konto`,
                        `> ${EMOJI.green} Dołączony serwer`,
                        `> ${EMOJI.green} Brak alt kont`,
                        "",
                        `## ${EMOJI.zap} Jak dołączyć?`,
                        `> Kliknij przycisk poniżej`,
                        "",
                        `## ${EMOJI.lock} Informacje`,
                        `> Giveaway jest automatyczny`,
                        `> Winner zostanie wybrany losowo`
                    ].join("\n")
                )

                .setImage(
                    "https://i.imgur.com/4KfOswz_d.webp?maxwidth=760&fidelity=grand"
                )

                .setFooter({
                    text: "StarX Exchange • Giveaway System"
                })

                .setTimestamp();

            const button = new ButtonBuilder()

                .setCustomId("join_giveaway")

                .setLabel("Dołącz do giveaway")

                .setEmoji("🎉")

                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(button);

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            console.log("✅ Giveaway wysłany");

        } catch (err) {

            console.log("❌ Giveaway error:", err);
        }
    });

    // =========================================
    // BUTTON
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isButton()) return;

        if (interaction.customId !== "join_giveaway") return;

        try {

            // =====================================
            // ROLE CHECK
            // =====================================
            if (
                !interaction.member.roles.cache.has(REQUIRED_ROLE_ID)
            ) {

                return interaction.reply({
                    content:
                        `${EMOJI.red} Musisz być zweryfikowany aby dołączyć.`,
                    flags: 64
                });
            }

            // =====================================
            // ALREADY JOINED
            // =====================================
            if (participants.has(interaction.user.id)) {

                return interaction.reply({
                    content:
                        `${EMOJI.red} Już bierzesz udział w giveaway.`,
                    flags: 64
                });
            }

            // =====================================
            // ADD USER
            // =====================================
            participants.add(interaction.user.id);

            return interaction.reply({
                content:
                    `${EMOJI.green} Dołączyłeś do giveaway!`,
                flags: 64
            });

        } catch (err) {

            console.log("❌ Giveaway interaction error:", err);
        }
    });
};
