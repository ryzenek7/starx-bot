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

    // ROLA DOSTĘPU DO PRZEJĘTEGO TICKETA
    const TICKET_ACCESS_ROLE_ID = "1502020178026696744";

    // ROLE ADMINISTRACJI
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
    // INTERACTION CREATE
    // =========================================
    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isChatInputCommand()) return;

        // =====================================
        // /PRZEJMIJ
        // =====================================
        if (interaction.commandName === "przejmij") {

            // ROLE CHECK
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

                const guild = interaction.guild;

                const customerMember =
                    await guild.members.fetch(customer.id);

                const staffMember =
                    await guild.members.fetch(interaction.user.id);

                // =====================================
                // DAJ ROLE ACCESS
                // =====================================
                await customerMember.roles.add(
                    TICKET_ACCESS_ROLE_ID
                ).catch(() => {});

                await staffMember.roles.add(
                    TICKET_ACCESS_ROLE_ID
                ).catch(() => {});

                // =====================================
                // UKRYJ ADMINISTRACJI
                // =====================================
                for (const roleId of ADMIN_ROLES) {

                    await channel.permissionOverwrites.edit(
                        roleId,
                        {
                            ViewChannel: false
                        }
                    ).catch(() => {});
                }

                // =====================================
                // ACCESS ROLE
                // =====================================
                await channel.permissionOverwrites.edit(
                    TICKET_ACCESS_ROLE_ID,
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

                    .setThumbnail(guild.iconURL())

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

            // ROLE CHECK
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

                return interaction.reply({
                    content: "❌ Nie masz permisji.",
                    flags: 64
                });
            }

            try {

                await interaction.deferReply();

                const channel = interaction.channel;

                const guild = interaction.guild;

                // =====================================
                // PRZYWRÓĆ ADMINISTRACJI DOSTĘP
                // =====================================
                for (const roleId of ADMIN_ROLES) {

                    await channel.permissionOverwrites.edit(
                        roleId,
                        {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        }
                    ).catch(() => {});
                }

                // =====================================
                // ZABIERZ ACCESS ROLE
                // =====================================
                const accessRole =
                    guild.roles.cache.get(
                        TICKET_ACCESS_ROLE_ID
                    );

                if (accessRole) {

                    const members =
                        accessRole.members;

                    for (const member of members.values()) {

                        await member.roles.remove(
                            TICKET_ACCESS_ROLE_ID
                        ).catch(() => {});
                    }
                }

                // =====================================
                // UKRYJ ACCESS ROLE
                // =====================================
                await channel.permissionOverwrites.edit(
                    TICKET_ACCESS_ROLE_ID,
                    {
                        ViewChannel: false
                    }
                );

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

                    .setThumbnail(guild.iconURL())

                    .setFooter({
                        text: "StarX Exchange • Premium Ticket System"
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
