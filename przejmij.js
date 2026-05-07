const {
    Events,
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // STAFF ROLE
    // =========================================
    const STAFF_ROLE_ID = "1500930428993933373";

    // =========================================
    // EMOJIS
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

        // =====================================
        // ROLE CHECK
        // =====================================
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

            return interaction.reply({
                content: "❌ Nie masz permisji.",
                flags: 64
            });
        }

        try {

            // =====================================
            // LOADING
            // =====================================
            await interaction.deferReply({
                flags: 64
            });

            // =====================================
            // DATA
            // =====================================
            const customer =
                interaction.options.getUser("uzytkownik");

            const channel = interaction.channel;

            // =====================================
            // RESET ALL PERMISSIONS
            // =====================================
            await channel.permissionOverwrites.set([

                // everyone hidden
                {
                    id: interaction.guild.id,
                    deny: [
                        PermissionsBitField.Flags.ViewChannel
                    ]
                },

                // customer access
                {
                    id: customer.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AttachFiles
                    ]
                },

                // person taking ticket
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.ManageChannels
                    ]
                }

            ]);

            // =====================================
            // EMBED
            // =====================================
            const embed = new EmbedBuilder()

                .setColor("#2b2d31")

                .setTitle(
                    `${EMOJI.lock} StarX Exchange » Ticket Przejęty`
                )

                .setDescription(
                    [
                        `> ${EMOJI.pin} Ticket został przejęty przez ${interaction.user}`,
                        `> ${EMOJI.zap} Klient: ${customer}`,
                        "",
                        `${EMOJI.money} Ticket widzi tylko klient oraz osoba przejmująca`
                    ].join("\n")
                )

                .setThumbnail(interaction.guild.iconURL())

                .setFooter({
                    text: "StarX Exchange • Premium Ticket System"
                })

                .setTimestamp();

            // =====================================
            // SEND
            // =====================================
            await interaction.editReply({
                embeds: [embed]
            });

        } catch (err) {

            console.log("❌ Przejmij error:", err);

            if (interaction.deferred || interaction.replied) {

                await interaction.editReply({
                    content: "❌ Wystąpił błąd podczas przejmowania ticketu."
                }).catch(() => {});
            }
        }
    });
};
