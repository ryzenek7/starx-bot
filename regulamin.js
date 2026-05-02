// regulamin.js
const {
  EmbedBuilder,
  Events
} = require("discord.js");

module.exports = (client) => {

  const CHANNEL_ID = "1499573020321124412";

  async function sendPanel() {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return console.log("❌ Nie znaleziono kanału regulamin.");

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("📜 StarX Exchange » REGULAMIN")
        .setDescription(`
1️⃣ Korzystanie z serwera oznacza akceptację regulaminu.  
2️⃣ Każdy użytkownik działa na własną odpowiedzialność.  
3️⃣ Administracja nie odpowiada za transakcje między użytkownikami.  
4️⃣ Wszystkie wymiany i sprzedaże odbywają się dobrowolnie.  
5️⃣ Zakaz sprzedaży i wymiany przedmiotów nielegalnych.  
6️⃣ Każda oferta musi być czytelna i zawierać szczegóły transakcji.  
7️⃣ Zabrania się fałszywych ofert oraz wprowadzania w błąd.  
8️⃣ Zalecane jest korzystanie z middlemana (MM) przy większych transakcjach.  
9️⃣ Administracja nie przechowuje ani nie zarządza środkami użytkowników.  
🔟 Wszystkie transakcje kryptowalutowe są ostateczne i nieodwracalne.  
1️⃣1️⃣ Użytkownik jest zobowiązany do sprawdzenia danych przed wysyłką środków.  
1️⃣2️⃣ Zakaz podszywania się pod innych użytkowników lub administrację.  
1️⃣3️⃣ Zakaz prób obejścia zabezpieczeń serwera lub systemu MM.  
1️⃣4️⃣ Administracja ma prawo usuwać użytkowników naruszających zasady.  
1️⃣5️⃣ Wszelkie spory rozstrzyga administracja serwera.
        `)
        .setFooter({
          text: "© 2026 StarX Exchange x Regulamin"
        });

      await channel.send({
        embeds: [embed]
      });

      console.log("✅ Regulamin wysłany");

    } catch (err) {
      console.log("❌ Błąd regulamin.js:", err);
    }
  }

  if (client.isReady()) {
    sendPanel();
  } else {
    client.once(Events.ClientReady, sendPanel);
  }

};
