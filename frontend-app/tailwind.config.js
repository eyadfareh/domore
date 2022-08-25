const config = require("./config.json");
module.exports = {
  content: [config.paths.src.pugWatch],
  theme: {
    extend: {},
  },
  plugins: [],
}
