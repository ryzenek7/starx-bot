const {
    Events,
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // CONFIG
    // =========================================
    const SUPPORT_ROLE_ID = "1499507487647338656";

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
    // /PRZEJMIJ
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName !== "przejmij") return;

        try {

            // =====================================
            // SUPPORT CHECK
            // =====================================
            if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {

                return interaction.reply({
                    content: "❌ Nie masz permisji.",
                    flags: 64
                });
            }

            // =====================================
            // USER
            // =====================================
            const customer = interaction.options.getUser("uzytkownik");

            // =====================================
            // HIDE SUPPORT ROLE
            // =====================================
            await interaction.channel.permissionOverwrites.edit(
                SUPPORT_ROLE_ID,
                {
                    ViewChannel: false
                }
            );

            // =====================================
            // SHOW FOR PERSON TAKING TICKET
            // =====================================
            await interaction.channel.permissionOverwrites.edit(
                interaction.user.id,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true
                }
            );

            // =====================================
            // SHOW FOR CUSTOMER
            // =====================================
            await interaction.channel.permissionOverwrites.edit(
                customer.id,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true
                }
            );

            // =====================================
            // EMBED
            // =====================================
            const embed = new EmbedBuilder()

                .setColor("#2b2d31")

                .setTitle(`${EMOJI.lock} StarX Exchange » Ticket Przejęty`)

                .setDescription(
                    [
                        `> ${EMOJI.pin} Ticket został przejęty przez ${interaction.user}`,
                        `> ${EMOJI.zap} Obsługiwany klient: ${customer}`,
                        "",
                        `${EMOJI.money} Tylko przejmujący oraz klient widzą teraz ticket`
                    ].join("\n")
                )

                .setThumbnail(interaction.guild.iconURL())

                .setFooter({
                    text: "StarX Exchange • Ticket System"
                })

                .setTimestamp();

            // =====================================
            // SEND
            // =====================================
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
