const {
    Events,
    EmbedBuilder
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // STAFF ROLE
    // =========================================
    const STAFF_ROLE_ID = "1500930428993933373";

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

        // =====================================
        // ROLE CHECK
        // =====================================
        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

            return interaction.reply({
                content: "❌ Nie masz permisji do tej komendy.",
                flags: 64
            });
        }

        // =====================================
        // LOADING
        // =====================================
        await interaction.deferReply();

        try {

            // =====================================
            // CUSTOMER
            // =====================================
            const customer =
                interaction.options.getUser("uzytkownik");

            // =====================================
            // CHANNEL
            // =====================================
            const channel = interaction.channel;

            // =====================================
            // HIDE FOR EVERYONE
            // =====================================
            await channel.permissionOverwrites.edit(
                interaction.guild.id,
                {
                    ViewChannel: false
                }
            );

            // =====================================
            // HIDE ALL ROLES
            // =====================================
            for (const role of interaction.guild.roles.cache.values()) {

                // pomiń everyone
                if (role.id === interaction.guild.id) continue;

                await channel.permissionOverwrites.edit(
                    role.id,
                    {
                        ViewChannel: false
                    }
                ).catch(() => {});
            }

            // =====================================
            // CUSTOMER ACCESS
            // =====================================
            await channel.permissionOverwrites.edit(
                customer.id,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true
                }
            );

            // =====================================
            // STAFF ACCESS
            // =====================================
            await channel.permissionOverwrites.edit(
                interaction.user.id,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    EmbedLinks: true,
                    ManageChannels: true
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
