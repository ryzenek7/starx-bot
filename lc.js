```js
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
    // INTERACTION
    // =====================================
    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            // =====================================
            // /LC
            // =====================================
            if (
                interaction.isChatInputCommand() &&
                interaction.commandName === "lc"
            ) {

                // perms
                if (
                    !interaction.member.roles.cache.has(STAFF_ROLE_ID)
                ) {

                    return interaction.reply({
                        content:
                            `${EMOJI.warning} Brak permisji.`,
                        ephemeral: true
                    });
                }

                // =====================================
                // MODAL
                // =====================================
                const modal = new ModalBuilder()
                    .setCustomId("lc_modal")
                    .setTitle("StarX Exchange • Legit Check");

                const textInput =
                    new TextInputBuilder()
                        .setCustomId("lc_text")
                        .setLabel("Produkt / Exchange")
                        .setPlaceholder(
                            "Netflix Lifetime 10PLN [BLIK]"
                        )
                        .setStyle(
                            TextInputStyle.Paragraph
                        )
                        .setRequired(true);

                const row =
                    new ActionRowBuilder()
                        .addComponents(textInput);

                modal.addComponents(row);

                // WAŻNE
                return await interaction.showModal(modal);
            }

            // =====================================
            // MODAL SUBMIT
            // =====================================
            if (
                interaction.isModalSubmit() &&
                interaction.customId === "lc_modal"
            ) {

                const text =
                    interaction.fields.getTextInputValue(
                        "lc_text"
                    );

                let finalText = "";

                // =====================================
                // CUSTOM +REP
                // =====================================
                if (
                    text
                        .toLowerCase()
                        .startsWith("+rep")
                ) {

                    finalText = text;

                } else {

                    finalText =
                        `+rep ${interaction.user} Purchased ${text}`;
                }

                // =====================================
                // EMBED
                // =====================================
                const embed = new EmbedBuilder()
                    .setColor("#1b2dff")
                    .setTitle(
                        `${EMOJI.money} StarX Exchange » Legit Check`
                    )
                    .setDescription(
`${EMOJI.pin} Legit został przygotowany

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.zap} Treść:

\`\`\`
${finalText}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━

${EMOJI.lock} Wyślij na <#${LEGIT_CHANNEL_ID}>`
                    )
                    .setFooter({
                        text:
                            "© 2026 StarX Exchange"
                    })
                    .setTimestamp();

                return await interaction.reply({
                    embeds: [embed]
                });
            }

        } catch (err) {

            console.log(
                "❌ LC ERROR:",
                err
            );

            try {

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    await interaction.reply({
                        content:
                            `${EMOJI.warning} Wystąpił błąd.`,
                        ephemeral: true
                    });
                }

            } catch {}
        }
    });
};
```
