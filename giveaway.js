const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    PermissionFlagsBits
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
    const participants = new Map();

    // =========================================
    // SLASH COMMAND
    // =========================================
    client.once(Events.ClientReady, async () => {

        const data = [
            new SlashCommandBuilder()
                .setName("konkurs")
                .setDescription("Stwórz nowy konkurs")
                .addStringOption(option =>
                    option
                        .setName("nagroda")
                        .setDescription("Na co jest konkurs")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("czas")
                        .setDescription("Np. 1h, 1d, 7d")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("wymagania")
                        .setDescription("Wymagania do udziału")
                        .setRequired(true)
                )
                .setDefaultMemberPermissions(
                    PermissionFlagsBits.Administrator
                )
        ];

        await client.application.commands.set(data);

        console.log("✅ Slash commands loaded");
    });

    // =========================================
    // COMMAND HANDLER
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // SLASH COMMAND
        // =====================================
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "konkurs") return;

            const nagroda =
                interaction.options.getString("nagroda");

            const czas =
                interaction.options.getString("czas");

            const wymagania =
                interaction.options.getString("wymagania");

            const channel = await client.channels.fetch(
                GIVEAWAY_CHANNEL_ID
            );

            const giveawayId = Date.now().toString();

            participants.set(giveawayId, new Set());

            const embed = new EmbedBuilder()

                .setColor("#2b2d31")

                .setTitle(`${EMOJI.gift} StarX Exchange » GIVEAWAY`)

                .setDescription(
                    [
                        `## ${EMOJI.green} Nagroda`,
                        "```",
                        `${nagroda}`,
                        "```",
                        "",
                        `## ${EMOJI.pin} Wymagania`,
                        `> ${wymagania}`,
                        "",
                        `## ${EMOJI.zap} Jak dołączyć?`,
                        `> Kliknij przycisk poniżej`,
                        "",
                        `## ${EMOJI.lock} Informacje`,
                        `> Czas trwania: ${czas}`,
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

                .setCustomId(`join_giveaway_${giveawayId}`)

                .setLabel("Dołącz do giveaway")

                .setEmoji("🎉")

                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(button);

            await channel.send({
                embeds: [embed],
                components: [row]
            });

            await interaction.reply({
                content:
                    `${EMOJI.green} Giveaway został utworzony!`,
                flags: 64
            });

            // =====================================
            // TIMER
            // =====================================
            let timeMs = 0;

            if (czas.endsWith("m")) {
                timeMs =
                    parseInt(czas) * 60 * 1000;
            }

            else if (czas.endsWith("h")) {
                timeMs =
                    parseInt(czas) * 60 * 60 * 1000;
            }

            else if (czas.endsWith("d")) {
                timeMs =
                    parseInt(czas) * 24 * 60 * 60 * 1000;
            }

            setTimeout(async () => {

                const users =
                    [...participants.get(giveawayId)];

                if (users.length <= 0) {

                    return channel.send(
                        `${EMOJI.red} Nikt nie wziął udziału w giveaway.`
                    );
                }

                const winner =
                    users[
                        Math.floor(
                            Math.random() * users.length
                        )
                    ];

                channel.send({
                    content:
                        `${EMOJI.gift} Gratulacje <@${winner}>! Wygrałeś **${nagroda}**`
                });

                participants.delete(giveawayId);

            }, timeMs);
        }

        // =====================================
        // BUTTON
        // =====================================
        if (interaction.isButton()) {

            if (
                !interaction.customId.startsWith(
                    "join_giveaway_"
                )
            ) return;

            const giveawayId =
                interaction.customId.replace(
                    "join_giveaway_",
                    ""
                );

            try {

                // =================================
                // ROLE CHECK
                // =================================
                if (
                    !interaction.member.roles.cache.has(
                        REQUIRED_ROLE_ID
                    )
                ) {

                    return interaction.reply({
                        content:
                            `${EMOJI.red} Musisz być zweryfikowany aby dołączyć.`,
                        flags: 64
                    });
                }

                const users =
                    participants.get(giveawayId);

                // =================================
                // ALREADY JOINED
                // =================================
                if (
                    users.has(interaction.user.id)
                ) {

                    return interaction.reply({
                        content:
                            `${EMOJI.red} Już bierzesz udział w giveaway.`,
                        flags: 64
                    });
                }

                // =================================
                // ADD USER
                // =================================
                users.add(interaction.user.id);

                return interaction.reply({
                    content:
                        `${EMOJI.green} Dołączyłeś do giveaway!`,
                    flags: 64
                });

            } catch (err) {

                console.log(
                    "❌ Giveaway interaction error:",
                    err
                );
            }
        }
    });
};
