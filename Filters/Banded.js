const IFilter = require("./IFilter");
const { Client } = require("wolf.js");
const CommandContext = require("../CommandContext");

module.exports = class BotMaker extends IFilter {
  #Maker = 12500068;
  /**
   * Only Bot Maker Can Use This Command.
   */
  constructor() {
    super();
    this.FailedMessage = "Only Fawaz (12500068) Can use this.";
  }
  /**
   *
   * @param {Client} client
   * @param {CommandContext} context
   */
  Validate = async (client, context) => {
    try {
      if (context.User.Id === this.#Maker) return true;
    } catch (e) {
      return false;
    }
  };
};
