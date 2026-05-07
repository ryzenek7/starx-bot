const {
    Events,
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // ROLE IDS
    // =========================================
    const STAFF_ROLE_ID = "1500930428993933373";

    const ADMIN_ROLES = [
        "1499499185337012377", // owner
        "1499507487647338656", // support
        "1500930428993933373"  // realizator
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
    // INTERACTIONS
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        // =====================================
        // /PRZEJMIJ
        // =====================================
        if (interaction.commandName === "przejmij") {

            // ================================
            // ROLE CHECK
            // ================================
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

                return interaction.reply({
                    content: "❌ Nie masz permisji.",
                    flags: 64
                });
            }

            try {

                await interaction.deferReply();

                const customer =
                    interaction.options.getUser("uzytkownik");

                const channel = interaction.channel;

                // ================================
                // RESET WSZYSTKICH PERMISJI
                // ================================
                await channel.permissionOverwrites.set([

                    // everyone hidden
                    {
                        id: interaction.guild.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    },

                    // klient
                    {
                        id: customer.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    },

                    // osoba przejmująca
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

                // ================================
                // EMBED
                // ================================
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

                if (interaction.deferred || interaction.replied) {

                    await interaction.editReply({
                        content: "❌ Wystąpił błąd."
                    }).catch(() => {});
                }
            }
        }

        // =====================================
        // /ODPRZYJMIJ
        // =====================================
        if (interaction.commandName === "odprzyjmij") {

            // ================================
            // ROLE CHECK
            // ================================
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

                return interaction.reply({
                    content: "❌ Nie masz permisji.",
                    flags: 64
                });
            }

            try {

                await interaction.deferReply();

                const channel = interaction.channel;

                // ================================
                // NOWE PERMISJE
                // ================================
                const overwrites = [

                    // everyone hidden
                    {
                        id: interaction.guild.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    }
                ];

                // ================================
                // ADMIN ROLES ACCESS
                // ================================
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

                // ================================
                // ZOSTAW KLIENTA
                // ================================
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
                                PermissionsBitField.Flags.ReadMessageHistory
                            ]
                        });
                    }
                });

                await channel.permissionOverwrites.set(overwrites);

                // ================================
                // EMBED
                // ================================
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
                        text: "StarX Exchange • Premium Ticket System"
                    })

                    .setTimestamp();

                await interaction.editReply({
                    embeds: [embed]
                });

            } catch (err) {

                console.log("❌ Odprzyjmij error:", err);

                if (interaction.deferred || interaction.replied) {

                    await interaction.editReply({
                        content: "❌ Wystąpił błąd."
                    }).catch(() => {});
                }
            }
        }
    });
};
