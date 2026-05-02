const fs = require("fs");

const FILE = "stakeData.json";

function load() {
  if (!fs.existsSync(FILE)) return { accounts: [] };
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  addAccount(acc) {
    const data = load();
    data.accounts.push(acc);
    save(data);
  },

  getAccount() {
    const data = load();
    if (data.accounts.length === 0) return null;

    const acc = data.accounts.shift();
    save(data);
    return acc;
  },

  count() {
    return load().accounts.length;
  }
};
