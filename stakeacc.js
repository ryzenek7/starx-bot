module.exports = (client) => {
  const fs = require("fs");
  const file = "./stakeData.json";

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    let data = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file));
    }

    const userId = interaction.user.id;
    if (!data[userId]) data[userId] = 0;

    if (interaction.commandName === "stakeadd") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] += amount;
      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return interaction.reply(`✅ Dodano ${amount}\n💰 Masz: ${data[userId]}`);
    }

    if (interaction.commandName === "stakeremove") {
      const amount = interaction.options.getInteger("ilosc");

      data[userId] -= amount;
      if (data[userId] < 0) data[userId] = 0;

      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return interaction.reply(`❌ Usunięto ${amount}\n💰 Masz: ${data[userId]}`);
    }

    if (interaction.commandName === "stakecheck") {
      return interaction.reply(`💰 Twój stan: ${data[userId]}`);
    }
  });
};
