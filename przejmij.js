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
    // ADMIN / SUPPORT ROLES
    // =========================================
    const ADMIN_ROLES = [
        "1499499185337012377", // owner
        "1500930428993933373", // realizator
        "1499507487647338656"  // support
    ];

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
    // INTERACTION
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        // =====================================
        // ROLE CHECK
        // =====================================
        if (
            interaction.commandName === "przejmij" ||
            interaction.commandName === "odprzyjmij"
        ) {

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

                return interaction.reply({
                    content: "❌ Nie masz permisji.",
                    flags: 64
                });
            }
        }

        // =====================================
        // /PRZEJMIJ
        // =====================================
        if (interaction.commandName === "przejmij") {

            try {

                await interaction.deferReply({
                    flags: 64
                });

                const customer =
                    interaction.options.getUser("uzytkownik");

                const channel = interaction.channel;

                // =====================================
                // ONLY CUSTOMER + STAFF
                // =====================================
                await channel.permissionOverwrites.set([

                    {
                        id: interaction.guild.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    },

                    {
                        id: customer.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    },

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

                await interaction.editReply({
                    embeds: [embed]
                });

            } catch (err) {

                console.log("❌ Przejmij error:", err);

                await interaction.editReply({
                    content: "❌ Wystąpił błąd."
                }).catch(() => {});
            }
        }

        // =====================================
        // /ODPRZYJMIJ
        // =====================================
        if (interaction.commandName === "odprzyjmij") {

            try {

                await interaction.deferReply({
                    flags: 64
                });

                const channel = interaction.channel;

                // =====================================
                // RESET PERMISSIONS
                // =====================================
                const overwrites = [

                    {
                        id: interaction.guild.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    }
                ];

                // =====================================
                // GIVE ACCESS TO ADMIN ROLES
                // =====================================
                for (const roleId of ADMIN_ROLES) {

                    overwrites.push({
                        id: roleId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    });
                }

                // =====================================
                // KEEP ACCESS FOR MEMBERS IN TICKET
                // =====================================
                channel.permissionOverwrites.cache.forEach(overwrite => {

                    if (
                        overwrite.type === 1 &&
                        overwrite.id !== interaction.guild.id
                    ) {

                        overwrites.push({
                            id: overwrite.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.AttachFiles
                            ]
                        });
                    }
                });

                await channel.permissionOverwrites.set(overwrites);

                // =====================================
                // EMBED
                // =====================================
                const embed = new EmbedBuilder()

                    .setColor("#57F287")

                    .setTitle(
                        `${EMOJI.zap} StarX Exchange » Ticket Odprzejęty`
                    )

                    .setDescription(
                        [
                            `> ${EMOJI.pin} Ticket został przywrócony`,
                            "",
                            `${EMOJI.money} Administracja ponownie widzi ticket`
                        ].join("\n")
                    )

                    .setThumbnail(interaction.guild.iconURL())

                    .setFooter({
                        text: "StarX Exchange • Ticket System"
                    })

                    .setTimestamp();

                await interaction.editReply({
                    embeds: [embed]
                });

            } catch (err) {

                console.log("❌ Odprzyjmij error:", err);

                await interaction.editReply({
                    content: "❌ Wystąpił błąd."
                }).catch(() => {});
            }
        }
    });
};
