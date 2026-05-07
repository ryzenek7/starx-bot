const {
    Events,
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // =========================================
    // EMOJI
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
        // LOADING
        // =====================================
        await interaction.deferReply();

        try {

            // =====================================
            // USER
            // =====================================
            const customer =
                interaction.options.getUser("uzytkownik");

            // =====================================
            // CURRENT CHANNEL
            // =====================================
            const channel = interaction.channel;

            // =====================================
            // HIDE CHANNEL FOR @everyone
            // =====================================
            await channel.permissionOverwrites.edit(
                interaction.guild.id,
                {
                    ViewChannel: false
                }
            );

            // =====================================
            // REMOVE ALL ROLES ACCESS
            // =====================================
            interaction.guild.roles.cache.forEach(async role => {

                // pomiń everyone
                if (role.id === interaction.guild.id) return;

                await channel.permissionOverwrites.edit(
                    role.id,
                    {
                        ViewChannel: false
                    }
                ).catch(() => {});
            });

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
            // PERSON TAKING TICKET
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
