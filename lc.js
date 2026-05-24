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
        money: "<a:money:1501685438103031920>"
    };

    // =====================================
    // INTERACTIONS
    // =====================================
    client.on(Events.InteractionCreate, async interaction => {

        // =====================================
        // /LC
        // =====================================
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "lc") return;

            // tylko realizator
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Brak permisji.",
                    flags: 64
                });
            }

            // =====================================
            // MODAL
            // =====================================
            const modal = new ModalBuilder()
                .setCustomId(`lc_modal_${interaction.user.id}`)
                .setTitle("StarX Exchange • Legit Check");

            // =====================================
            // INPUT
            // =====================================
            const input = new TextInputBuilder()
                .setCustomId("lc_text")
                .setLabel("Wpisz produkt/usługę")
                .setValue("+rep @seller Purchased ")
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

            if (!interaction.customId.startsWith("lc_modal_")) return;

            let text = interaction.fields.getTextInputValue("lc_text");

            // usuń template
            text = text.replace("+rep @seller Purchased", "").trim();

            // finalny tekst
            const finalText =
                `+rep ${interaction.user} Purchased ${text}`;

            // =====================================
            // EMBED
            // =====================================
            const embed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle(`${EMOJI.money} StarX Exchange » Legit Check`)
                .setDescription([
                    `> ${EMOJI.pin} Legit check przygotowany`,
                    "",
                    `## ${EMOJI.zap} Treść`,
                    "```",
                    finalText,
                    "```",
                    "",
                    `${EMOJI.lock} Wyślij wiadomość na <#${LEGIT_CHANNEL_ID}>`
                ].join("\n"))
                .setFooter({
                    text: "StarX Exchange • Legit System"
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }
    });

    // =====================================
    // AUTO CLOSE AFTER +REP
    // =====================================
    client.on(Events.MessageCreate, async message => {

        try {

            if (message.author.bot) return;
            if (message.channel.id !== LEGIT_CHANNEL_ID) return;

            // tylko +rep
            if (!message.content.toLowerCase().includes("+rep")) return;

            const guild = message.guild;

            // =====================================
            // FIND TICKET
            // =====================================
            const ticketChannel = guild.channels.cache.find(c =>
                c.isTextBased() &&
                c.name.includes("ticket")
            );

            if (!ticketChannel) return;

            // =====================================
            // REMOVE ACCESS ROLE
            // =====================================
            const accessRole = guild.roles.cache.get(TICKET_ACCESS_ROLE_ID);

            if (accessRole) {

                const members = [...accessRole.members.values()];

                for (const member of members) {

                    await member.roles
                        .remove(TICKET_ACCESS_ROLE_ID)
                        .catch(() => {});
                }
            }

            // =====================================
            // CLOSE EMBED
            // =====================================
            const closeEmbed = new EmbedBuilder()
                .setColor("#57F287")
                .setDescription(
                    `${EMOJI.lock} Legit check wykryty — zamykam ticket...`
                );

            await ticketChannel.send({
                embeds: [closeEmbed]
            });

            // =====================================
            // DELETE TICKET
            // =====================================
            setTimeout(async () => {

                await ticketChannel.delete().catch(() => {});

            }, 3000);

        } catch (err) {
            console.log("❌ Auto close error:", err);
        }
    });
};
