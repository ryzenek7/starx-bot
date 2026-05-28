````js
const {
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = (client) => {

    // =====================================
    // CONFIG
    // =====================================
    const LEGIT_CHANNEL_ID = "1500893110048133253";
    const STAFF_ROLE_ID = "1500930428993933373";
    const TICKET_ACCESS_ROLE_ID = "1502020178026696744";

    // =====================================
    // EMOJI
    // =====================================
    const EMOJI = {
        pin: "<:pin:1501697389050986546>",
        zap: "<:zap:1501697151737139350>",
        lock: "<:lock:1501697222901895258>",
        money: "<a:money:1501685438103031920>",
        warning: "<:warning:1501693444030992395>"
    };

    // =====================================
    // INTERACTIONS
    // =====================================
    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // /LC
        // =====================================
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "lc")
                return;

            // =====================================
            // PERMS
            // =====================================
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

                return interaction.reply({
                    content: `${EMOJI.warning} Brak permisji.`,
                    flags: 64
                });
            }

            // =====================================
            // MODAL
            // =====================================
            const modal = new ModalBuilder()
                .setCustomId(`lc_modal_${interaction.user.id}`)
                .setTitle("StarX Exchange • Legit Check");

            const input = new TextInputBuilder()
                .setCustomId("lc_text")
                .setLabel("Produkt / exchange")
                .setPlaceholder("Netflix Lifetime 10PLN [BLIK]")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input)
            );

            return interaction.showModal(modal);
        }

        // =====================================
        // MODAL SUBMIT
        // =====================================
        if (interaction.isModalSubmit()) {

            if (!interaction.customId.startsWith("lc_modal_"))
                return;

            try {

                const text =
                    interaction.fields
                        .getTextInputValue("lc_text");

                // =====================================
                // AUTO FORMAT
                // =====================================
                let finalText = "";

                // jeśli wpisano własne +rep
                if (
                    text
                        .toLowerCase()
                        .startsWith("+rep")
                ) {

                    finalText = text;

                } else {

                    // auto purchased
                    finalText =
                        `+rep ${interaction.user} Purchased ${text}`;
                }

                // =====================================
                // EMBED
                // =====================================
                const embed = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle(
                        `${EMOJI.money} StarX Exchange » Legit Check`
                    )
                    .setDescription([
                        `> ${EMOJI.pin} Legit check został przygotowany`,
                        "",
                        `## ${EMOJI.zap} Treść`,
                        "```",
                        finalText,
                        "```",
                        "",
                        `${EMOJI.lock} Wyślij na <#${LEGIT_CHANNEL_ID}>`
                    ].join("\n"))
                    .setFooter({
                        text: "StarX Exchange • Legit System"
                    })
                    .setTimestamp();

                // =====================================
                // PUBLIC REPLY
                // =====================================
                await interaction.reply({
                    embeds: [embed]
                });

            } catch (err) {

                console.log("❌ LC modal error:", err);

                if (!interaction.replied) {

                    await interaction.reply({
                        content:
                            `${EMOJI.warning} Wystąpił błąd.`,
                        flags: 64
                    });
                }
            }
        }
    });

    // =====================================
    // AUTO CLOSE AFTER +REP
    // =====================================
    client.on(Events.MessageCreate, async message => {

        try {

            if (message.author.bot)
                return;

            if (message.channel.id !== LEGIT_CHANNEL_ID)
                return;

            // =====================================
            // ONLY +REP
            // =====================================
            if (
                !message.content
                    .toLowerCase()
                    .includes("+rep")
            ) return;

            const guild = message.guild;

            // =====================================
            // FIND TICKET
            // =====================================
            const ticketChannel =
                guild.channels.cache.find(c =>
                    c.isTextBased() &&
                    c.name.startsWith("ticket-")
                );

            if (!ticketChannel)
                return;

            // =====================================
            // REMOVE ACCESS ROLE
            // =====================================
            const accessRole =
                guild.roles.cache.get(
                    TICKET_ACCESS_ROLE_ID
                );

            if (accessRole) {

                const members =
                    [...accessRole.members.values()];

                for (const member of members) {

                    await member.roles
                        .remove(
                            TICKET_ACCESS_ROLE_ID
                        )
                        .catch(() => {});
                }
            }

            // =====================================
            // CLOSE EMBED
            // =====================================
            const closeEmbed =
                new EmbedBuilder()
                    .setColor("#57F287")
                    .setDescription(
                        `${EMOJI.lock} Legit check wykryty — zamykam ticket...`
                    );

            await ticketChannel.send({
                embeds: [closeEmbed]
            });

            // =====================================
            // DELETE
            // =====================================
            setTimeout(async () => {

                await ticketChannel
                    .delete()
                    .catch(() => {});

            }, 3000);

        } catch (err) {

            console.log(
                "❌ Auto close error:",
                err
            );
        }
    });
};
````
