const { Client, Message, GroupMessage, User, Group } = require("wolf.js");
const Player = require("./Player");
const p = require("path");
const fs = require("fs/promises");
const mime = require("mime-types");

module.exports = class CommandContext {
  Client;
  Translations;
  Language;
  Message;
  User;
  Group;
  Rest;
  Player;

  /**
   * @param {{client: Client,player:Player, language: string, translations: any, message: Message | GroupMessage, user: User, group: Group, rest: string}} data
   */
  constructor(data) {
    this.Client = data.client;
    this.Language = data.language;
    this.Translations = data.translations;
    this.Message = data.message;
    this.User = data.user;
    this.Group = data.group;
    this.Rest = data.rest;
    this.Player = data.player;
    // TODO: check for audio change slot if you not have pepole deop stage.
    // TODO : make this all changes in new packge and use suber() here.
  }

  /**
   * @param {string} key
   */
  GetTranslation = (key) => {
    if (!this.Language) return null;
    if (!key) return null;
    return (
      this.Translations.find(
        (t) => t.key.toLowerCase().trim() === key.toLowerCase().trim()
      )?.translations[this.Language] ?? null
    );
  };

  /**
   * Send a text response back
   * @param {string} content
   */
  Reply = async (content) => {
    let trans = this.GetTranslation(content);

    if (trans) content = trans;
    let recipient = this.Message.IsGroup
      ? this.Message.Recipient.Id
      : this.Message.Originator.Id;

    await this.Client.Messages.SendMessage(
      recipient,
      this.Message.IsGroup,
      content,
      "text/plain"
    );
  };

  /**
   * Reply with an image
   * @param {any} content
   */
  ReplyImage = async (content, mimeType) => {
    //TODO: work to replay image . it's easy don't warry
    let recipient = this.Message.IsGroup
      ? this.Message.Recipient.Id
      : this.Message.Originator.Id;
    return await this.Client.Messages.SendMessage(
      recipient,
      this.Message.IsGroup,
      content,
      mimeType
    );
  };
  ReplyPlayer = async (cid, song = null, img = false) => {
    if (!song) {
      await this.Reply(this.Player.Code.getCode(cid, this.Language));
      return;
    }
    await this.Reply(this.Player.Code.getCode(cid, this.Language) + song.Title);
  };
  Play = async () => {
    let gid = this.Message.Recipient.Id;
    if (!(await this.isSlotsRady(gid))) return;
    await this.Player.Play(
      gid,
      this.Rest,
      async (song) => {
        await this.joinStage();
        await this.ReplyPlayer(3, song);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  Prev = async () => {
    let gid = this.Message.Recipient.Id;
    await this.Player.Prev(
      gid,
      async (song) => {
        await this.ReplyPlayer(3, song);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  Next = async (gid) => {
    if (!gid > 0) {
      gid = this.Message.Recipient.Id;
    }
    await this.Player.Next(
      gid,
      async (song) => {
        await this.ReplyPlayer(3, song);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  List = async () => {
    let gid = this.Message.Recipient.Id;
    this.Player.List(
      gid,
      async (info) => {
        await this.Reply(info);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  Clear = async () => {
    let gid = this.Message.Recipient.Id;
    this.Player.Clear(
      gid,
      async (s) => {
        await this.ReplyPlayer(s);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  End = async () => {
    let gid = this.Message.Recipient.Id;
    await this.Player.End(
      gid,
      async (s) => {
        await this.ReplyPlayer(s);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  Add = async () => {
    let gid = this.Message.Recipient.Id;
    await this.Player.Add(
      gid,
      this.Rest,
      async (song) => {
        await this.ReplyPlayer(4, song);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  Current = async () => {
    let gid = this.Message.Recipient.Id;
    await this.Player.Current(
      gid,
      async (song) => {
        this.ReplyPlayer(16, song);
      },
      async (e) => {
        this.ReplyPlayer(e);
      }
    );
  };
  Stop = async () => {
    let gid = this.Message.Recipient.Id;
    await this.Player.Stop(
      gid,
      async (s) => {
        await this.ReplyPlayer(s);
      },
      async (e) => {
        await this.ReplyPlayer(14);
      }
    );
  };
  Remove = async () => {
    let gid = this.Message.Recipient.Id;
    this.Player.Remove(
      gid,
      this.Rest,
      async (s) => {
        await this.ReplyPlayer(s);
      },
      async (e) => {
        await this.ReplyPlayer(e);
      }
    );
  };
  AdminClear = async () => {
    await this.Player.AdminClear();
    await this.ReplyPlayer(22);
  };
  joinStage = async () => {
    if (!this.Group.AudioConfig.Enabled) {
      this.Reply(this.Player.Code.getCode(1, this.Language));
      return;
    }
    let gid = this.Message.Recipient.Id;
    let slots = await this.#isReady(gid);
    if (!slots) return null;
    let sdp = await this.Player.Signal.Offer(gid);
    let answer = await this.Client.Stages.JoinStage(gid, slots[0].id, sdp);
    await this.Player.Signal.Answer(gid, answer);
  };
  /**
   *
   * @param {number} gid
   * @returns {Array}
   */
  #stageSlots = async (gid) => {
    let slots = await this.Client.Stages.StageSlots(gid);
    return slots;
  };
  isSlotsRady = async (gid) => {
    let slots = await this.#stageSlots(gid);
    slots = slots.filter(
      (slot) =>
        (!slot.locked && !slot.uuid) ||
        slot.occupierId === this.Client.CurrentUser.Id
    );
    if (slots.length > 0) return slots;
    await this.Reply(this.Player.Code.getCode(2, this.Language));
    return null;
  };
  /**
   *
   * @param {number} gid
   * @returns {Array}
   */
  #isReady = async (gid) => {
    let slots = await this.isSlotsRady(gid);
    let tslots = slots.filter(
      (slot) => slot.occupierId === this.Client.CurrentUser.Id
    );
    if (tslots.length !== 0) return null;
    return slots;
  };
};
