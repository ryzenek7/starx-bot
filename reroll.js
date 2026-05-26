const {
    Events
} = require("discord.js");

module.exports = (client) => {

    const GIVEAWAY_CHANNEL_ID = "1502022020487970948";

    const EMOJI = {
        gift: "<:gift:1502025560606507048>",
        red: "<a:red:1501989543182864535>",
        green: "<a:green:1501990166082879538>"
    };

    const participants = new Map(); // jeśli masz już w giveaway.js → MUSI BYĆ SHARED (ważne!)

    client.on(Events.InteractionCreate, async (interaction) => {

        try {

            if (!interaction.isChatInputCommand()) return;
            if (interaction.commandName !== "reroll") return;

            const messageId = interaction.options.getString("message_id");

            const channel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);
            if (!channel) {
                return interaction.reply({
                    content: `${EMOJI.red} Nie znaleziono kanału.`,
                    ephemeral: true
                });
            }

            const messages = await channel.messages.fetch(messageId).catch(() => null);

            if (!messages) {
                return interaction.reply({
                    content: `${EMOJI.red} Nie znaleziono giveaway.`,
                    ephemeral: true
                });
            }

            // znajdź giveawayId po messageId
            let giveawayId = null;

            for (const file of require.cache) {} // ignor

            // PROSTE REROLL (bez DB)
            let users = null;

            // jeśli masz participants globalnie w giveaway.js → ten system zadziała tylko jeśli przerzucisz Mapę do global
            if (global.participants) {
                users = global.participants.get(messageId);
            }

            if (!users || users.size === 0) {
                return interaction.reply({
                    content: `${EMOJI.red} Brak uczestników.`,
                    ephemeral: true
                });
            }

            const arr = [...users];
            const winner = arr[Math.floor(Math.random() * arr.length)];

            await channel.send(
                `${EMOJI.gift} 🎉 Nowy zwycięzca: <@${winner}>`
            );

            return interaction.reply({
                content: `${EMOJI.green} Reroll wykonany!`,
                ephemeral: true
            });

        } catch (err) {
            console.log("REROLL ERROR:", err);

            if (!interaction.replied) {
                return interaction.reply({
                    content: "❌ Błąd rerolla",
                    ephemeral: true
                });
            }
        }
    });
};
