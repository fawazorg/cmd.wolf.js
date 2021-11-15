const { Client, Message, GroupMessage, User, Group } = require("wolf.js");
const jimp = require("jimp");
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
  ReplyImage = async (content) => {
    let recipient = this.Message.IsGroup
      ? this.Message.Recipient.Id
      : this.Message.Originator.Id;
    let image = await this.imageBuffer(content);
    console.log(image);
    return await this.Client.Messages.SendMessage(
      recipient,
      this.Message.IsGroup,
      image,
      "image/jpeg"
    );
  };

  /**
   * convert a image to buffer
   * @param {String} url
   */
  imageBuffer = async (url) => {
    let imagebuffer;
    await jimp
      .read(url)
      .then(async (data) => {
        await data
          .getBufferAsync(jimp.MIME_JPEG)
          // eslint-disable-next-line no-return-assign
          .then((results) => (imagebuffer = results))
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
    return imagebuffer;
  };
};
