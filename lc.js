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

        try {

            // =====================================
            // /LC
            // =====================================
            if (interaction.isChatInputCommand()) {

                if (interaction.commandName !== "lc")
                    return;

                // perms
                if (
                    !interaction.member.roles.cache.has(STAFF_ROLE_ID)
                ) {

                    return interaction.reply({
                        content:
                            `${EMOJI.warning} Brak permisji.`,
                        flags: 64
                    });
                }

                // =====================================
                // MODAL
                // =====================================
                const modal = new ModalBuilder()
                    .setCustomId("lc_modal")
                    .setTitle("StarX Exchange • Legit Check");

                const input =
                    new TextInputBuilder()
                        .setCustomId("lc_text")
                        .setLabel("Produkt / exchange")
                        .setPlaceholder(
                            "Netflix Lifetime 10PLN [BLIK]"
                        )
                        .setStyle(
                            TextInputStyle.Paragraph
                        )
                        .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder()
                        .addComponents(input)
                );

                return await interaction.showModal(modal);
            }

            // =====================================
            // MODAL SUBMIT
            // =====================================
            if (interaction.isModalSubmit()) {

                if (
                    interaction.customId !== "lc_modal"
                ) return;

                const text =
                    interaction.fields.getTextInputValue(
                        "lc_text"
                    );

                let finalText = "";

                // custom +rep
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
                        text:
                            "StarX Exchange • Legit System"
                    })
                    .setTimestamp();

                // =====================================
                // PUBLIC
                // =====================================
                return await interaction.reply({
                    embeds: [embed]
                });
            }

        } catch (err) {

            console.log(
                "❌ LC SYSTEM ERROR:",
                err
            );

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                await interaction.reply({
                    content:
                        `${EMOJI.warning} Wystąpił błąd.`,
                    flags: 64
                }).catch(() => {});
            }
        }
    });
};
````
