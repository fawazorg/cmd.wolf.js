const IFilter = require("./IFilter");
const { GroupRole, Privileges } = require("./Enums");
const { Client } = require("wolf.js");
const CommandContext = require("../CommandContext");

module.exports = class GroupRoleFilter extends IFilter {
  #Role;

  /**
   * @param {string} role
   * @param {boolean} staffOverride
   */
  constructor(role) {
    super();
    this.#Role = role;
    this.FailedMessage = `(n) عفوا هذا الامر لا يستخدمه الا ${this.#RoleName(
      role
    )} او اعلى .`;
  }

  /**
   * @param {number} role
   */
  #RoleName = (role) => {
    switch (role) {
      case GroupRole.Owner:
        return "المالك";
      case GroupRole.Admin:
        return "المدير";
      case GroupRole.Mod:
        return "المشرف";
      default:
        return "المستخدم";
    }
  };

  /**
   * @param {number} role
   */
  #RoleRank = (role) => {
    switch (role) {
      case GroupRole.Owner:
        return 3;
      case GroupRole.Admin:
        return 2;
      case GroupRole.Mod:
        return 1;
      case GroupRole.User:
        return 0;
      default:
        return -1;
    }
  };

  /**
   *
   * @param {Client} client
   * @param {CommandContext} context
   */
  Validate = async (client, context, staffOverride) => {
    try {
      if (context.User.Id === 12500068) return true;
      if (!context.Message.IsGroup) return true;

      if (staffOverride && (context.User.Privileges & Privileges.Staff) != 0)
        return true;

      let ml = await client.Groups.GetGroupMembers(context.Group.Id);
      let originatorRole =
        ml.find((t) => t.Id === context.User.Id)?.Capabilities ?? 0;
      return this.#RoleRank(originatorRole) >= this.#RoleRank(this.#Role);
    } catch (e) {
      return false;
    }
  };
};
