const {
    Events,
    EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

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
            // USER
            // =====================================
            const customer = interaction.options.getUser("uzytkownik");

            // =====================================
            // HIDE ALL ROLES
            // =====================================
            const roles = interaction.guild.roles.cache;

            for (const role of roles.values()) {

                // pomiń everyone
                if (role.id === interaction.guild.id) continue;

                // ukryj ticket dla wszystkich ról
                await interaction.channel.permissionOverwrites.edit(
                    role.id,
                    {
                        ViewChannel: false
                    }
                ).catch(() => {});
            }

            // =====================================
            // CUSTOMER ACCESS
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
            // PERSON TAKING TICKET
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
