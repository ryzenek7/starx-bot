const {
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // CONFIG
    // =========================================
    const LEGIT_CHANNEL_ID = "1499519884860854505";

    // ROLA REALIZATORA
    const STAFF_ROLE_ID = "1500930428993933373";

    // ACCESS ROLE
    const TICKET_ACCESS_ROLE_ID = "1502020178026696744";

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
    // INTERACTIONS
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // /LC
        // =====================================
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "lc") return;

            // =====================================
            // ROLE CHECK
            // =====================================
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

                return interaction.reply({
                    content: "❌ Nie masz permisji do tej komendy.",
                    flags: 64
                });
            }

            try {

                // =====================================
                // MODAL
                // =====================================
                const modal = new ModalBuilder()

                    .setCustomId("lc_modal")

                    .setTitle("StarX Exchange • Legit Check");

                // =====================================
                // INPUT
                // =====================================
                const input = new TextInputBuilder()

                    .setCustomId("lc_text")

                    .setLabel("Wpisz legit check")

                    .setPlaceholder(
                        "+rep @jarek.svx Purchased Konto Stake 40 PLN [BLIK]"
                    )

                    .setStyle(TextInputStyle.Paragraph)

                    .setRequired(true);

                const row = new ActionRowBuilder()
                    .addComponents(input);

                modal.addComponents(row);

                await interaction.showModal(modal);

            } catch (err) {

                console.log("❌ LC modal error:", err);
            }
        }

        // =====================================
        // MODAL SUBMIT
        // =====================================
        if (interaction.isModalSubmit()) {

            if (interaction.customId !== "lc_modal") return;

            try {

                const text =
                    interaction.fields.getTextInputValue("lc_text");

                // =====================================
                // EMBED
                // =====================================
                const embed = new EmbedBuilder()

                    .setColor("#2b2d31")

                    .setTitle(
                        `${EMOJI.money} StarX Exchange » Legit Check`
                    )

                    .setDescription(
                        [
                            `> ${EMOJI.pin} Legit check został przygotowany`,
                            "",
                            `## ${EMOJI.zap} Treść`,
                            "```",
                            text,
                            "```",
                            `${EMOJI.lock} Wyślij wiadomość na <#${LEGIT_CHANNEL_ID}> aby zamknąć ticket`
                        ].join("\n")
                    )

                    .setThumbnail(
                        interaction.guild.iconURL()
                    )

                    .setFooter({
                        text: "StarX Exchange • Legit System"
                    })

                    .setTimestamp();

                await interaction.reply({
                    embeds: [embed]
                });

            } catch (err) {

                console.log("❌ LC submit error:", err);

                if (!interaction.replied) {

                    await interaction.reply({
                        content: "❌ Wystąpił błąd.",
                        flags: 64
                    });
                }
            }
        }
    });

    // =========================================
    // AUTO CLOSE AFTER LEGIT CHECK
    // =========================================
    client.on(Events.MessageCreate, async message => {

        try {

            if (message.author.bot) return;

            // =====================================
            // ONLY LEGIT CHANNEL
            // =====================================
            if (
                message.channel.id !== LEGIT_CHANNEL_ID
            ) return;

            const guild = message.guild;

            // =====================================
            // FIND USER TICKET
            // =====================================
            const ticketChannel =
                guild.channels.cache.find(c =>

                    c.name
                        .toLowerCase()
                        .includes(
                            message.author.username.toLowerCase()
                        )
                );

            if (!ticketChannel) return;

            // =====================================
            // REMOVE ACCESS ROLE
            // =====================================
            const accessRole =
                guild.roles.cache.get(
                    TICKET_ACCESS_ROLE_ID
                );

            if (accessRole) {

                for (const member of accessRole.members.values()) {

                    await member.roles.remove(
                        TICKET_ACCESS_ROLE_ID
                    ).catch(() => {});
                }
            }

            // =====================================
            // CLOSE EMBED
            // =====================================
            const closeEmbed = new EmbedBuilder()

                .setColor("#57F287")

                .setDescription(
                    `${EMOJI.lock} Legit check wykryty — zamykam ticket za 3 sekundy`
                );

            await ticketChannel.send({
                embeds: [closeEmbed]
            });

            // =====================================
            // DELETE CHANNEL
            // =====================================
            setTimeout(async () => {

                await ticketChannel
                    .delete()
                    .catch(() => {});

            }, 3000);

        } catch (err) {

            console.log("❌ Auto close error:", err);
        }
    });
};
