const io = require("socket.io-client");

module.exports = class PlayerSignaling {
  Conn;
  constructor(url = "http://127.0.0.1:5000") {
    this.Conn = io(url, { transports: ["websocket"] });
  }
  Offer = async (gid) => {
    await this.Conn.emit("get_offer", { id: gid });
    return new Promise((resolve) => {
      this.Conn.on("offer", (data) => {
        let dd = JSON.parse(data);
        resolve(dd.sdp);
      });
    });
  };
  Answer = async (gid, sdp) => {
    this.Conn.emit("set_offer", {
      id: gid,
      sdp: sdp,
      type: "answer",
    });
  };
  PlaySong = async (gid, song) => {
    await this.Conn.emit("play", { id: gid, path: song.Path });
  };
  StopSong = async (gid) => {
    await this.Conn.emit("stop", { id: gid });
  };
  End = async (gid) => {
    await this.Conn.emit("end", { id: gid });
  };
};
