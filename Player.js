const Song = require("./PlayerSong");
const Queue = require("./PlayerQueue");
const signal = require("./PlayerSignaling");
const PlayerCode = require("./PlayerCode");
const youtubedl = require("youtube-dl-exec");

module.exports = class Player {
  Queues;
  Signal;
  DIR;
  Code;
  constructor() {
    this.Signal = new signal();
    this.Queues = [];
    this.DIR = "/tmp/";
    this.Code = new PlayerCode();
  }
  /**
   *
   * @param {number} qid
   * @returns {Queue}
   */
  FirstOrCreate = (qid) => {
    let gq = this.Queues.filter((q) => q.ID === qid);
    if (gq.length > 0) return gq[0];
    gq = new Queue(qid, true, false, [], null, null);
    this.Queues.push(gq);
    return gq;
  };
  isNumeric = (str) => {
    if (typeof str != "string") return false;
    return !isNaN(parseInt(str));
  };

  is_youtube(url) {
    const u = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const p = /^.*(list=)([^#\&\?]*).*/gi;
    return u.test(url) && !p.test(url);
  }
  is_soundcloud(url) {
    const sc = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const msc = /^https?:\/\/(m.soundcloud\.com)\/(.*)$/;
    const mobileSc = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
    return sc.test(url) || mobileSc.test(url) || msc.test(url);
  }
  parse_args(arg) {
    if (arg === "" || this.isNumeric(arg)) return "LIST";
    if (this.is_youtube(arg) || this.is_soundcloud(arg)) return "URL";
    return "SEARCH";
  }
  /**
   *
   * @param {Queue} qeueu
   * @param {String} from
   */
  SaveSong = async (queue, from, on_success, on_failure) => {
    await youtubedl(from, {
      audioFormat: "mp3",
      o: queue.GetSongName(this.DIR),
      x: true,
      printJson: true,
      noWarnings: true,
      matchFilter: "duration < 900",
      noCallHome: true,
      noCheckCertificate: true,
      youtubeSkipDashManifest: true,
    }).then((o) => {
      if (!o) {
        on_failure(20);
        return;
      }
      let song = new Song(
        o.id,
        o.title,
        o.webpage_url,
        o._filename,
        o.thumbnail
      );
      if (!this.is_soundcloud(from)) song.fixYoutube();
      on_success(song);
    });
  };
  /**
   *
   * @param {Queue} queue
   * @param {String} args
   * @param {Boolean} play
   * @param {Boolean} add
   */
  load = async (queue, args, play, add, on_success, on_failure) => {
    let arg = this.parse_args(args);
    switch (arg) {
      case "LIST":
        if (play) {
          queue.PlaySong(
            this.isNumeric(args) ? parseInt(args) - 1 : 0,
            (song) => {
              this.Signal.PlaySong(queue.ID, song);
              queue.Playing = true;
              on_success(song);
              return;
            },
            (e) => {
              on_failure(e);
              return;
            }
          );
          return;
        }
        break;
      case "URL":
        arg = args;
        break;
      case "SEARCH":
        arg = `ytsearch1:${args}`;
        break;
      default:
        break;
    }
    await this.SaveSong(
      queue,
      arg,
      async (song) => {
        if (add) {
          queue.AddSong(song, (e) => {
            on_failure(e);
          });
        } else if (play) {
          await this.Signal.PlaySong(queue.ID, song);
          queue.SetCurrent(song);
          queue.Live = true;
          queue.Playing = true;
        }
        on_success(song);
        return;
      },
      (e) => {
        on_failure(e);
      }
    );
  };
  Play = async (gid, args, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    if (queue.Playing) {
      on_failure(15);
      return;
    }
    await this.load(
      queue,
      args,
      true,
      false,
      (song) => {
        on_success(song);
      },
      (e) => {
        on_failure(e);
      }
    );
  };
  /**
   *
   * @param {number} gid
   */
  Stop = async (gid, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    if (!queue.CurrentSong) {
      on_failure(14);
      return;
    }
    await this.Signal.StopSong(queue.ID);
    queue.Playing = false;
    queue.CurrentSong = null;
    on_success(8);
  };
  Next = (gid, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    if (queue.Songs.length <= 0) {
      on_failure(6);
      return;
    }
    queue.NextSong(
      async (song) => {
        await this.Signal.PlaySong(queue.ID, song);
        on_success(song);
        return;
      },
      (e) => {
        queue.Playing = false;
        on_failure(e);
      }
    );
  };
  Current = (gid, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    let song = queue.CurrentSong;
    if (song) {
      on_success(song);
      return;
    }
    on_failure(14);
  };
  Prev = (gid, on_success, on_failure) => {
    //TODO: Not work :)
    let queue = this.FirstOrCreate(gid);
    if (queue.Songs.length <= 0) {
      on_failure(6);
      return;
    }
    queue.PrevSong(
      async (song) => {
        await this.Signal.PlaySong(queue.ID, song);
        on_success(song);
        return;
      },
      (e) => {
        queue.Playing = false;
        on_failure(e);
      }
    );
  };
  /**
   *
   * @param {number} gid
   * @param {string} args
   * @param {Function} on_success
   * @param {Function} on_failure
   * @returns
   */
  Add = async (gid, args, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    if (queue.Songs.length >= 5) {
      on_failure(10);
      return;
    }
    if (args.length < 5) {
      on_failure(21);
      return;
    }
    await this.load(
      queue,
      args,
      false,
      true,
      (song) => {
        on_success(song);
      },
      (e) => {
        on_failure(e);
      }
    );
  };
  Remove = (gid, args, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    if (!this.isNumeric(args)) {
      on_failure(13);
    } else {
      let index = parseInt(args) - 1;
      if (queue.Songs.length === 0) {
        on_failure(6);
        return;
      }
      let song = queue.Songs[index];
      if (!song) {
        on_failure(12);
        return;
      }
      queue.RemoveSong(song);
      on_success(11);
    }
  };
  List = (gid, on_success, on_failure) => {
    // add respone data + cheak if has list first
    let queue = this.FirstOrCreate(gid);
    if (queue.Songs.length > 0) {
      on_success(queue.ListFromat());
      return;
    }
    on_failure(6);
  };
  Clear = (gid, on_success, on_failure) => {
    let queue = this.FirstOrCreate(gid);
    if (queue.Songs.length > 0) {
      queue.ClearList(this.DIR);
      on_success(17);
      return;
    }
    on_failure(6);
  };
  End = async (gid, on_success, on_failure) => {
    // TODO: add stage staus in queue for better.
    let queue = this.FirstOrCreate(gid);
    if (queue.Live) {
      queue.CurrentSong = null;
      queue.Playing = false;
      queue.Live = false;
      await this.Signal.End(gid);
      on_success(19);
      return;
    }
    on_failure(18);
  };
  song_end = async (gid, callback) => {
    // TODO: if loop go to next song or repaet thes song agein
    // TODO: Set time out of 1 or 2 minets if there not curent song plying drop stage.
    let queue = this.FirstOrCreate(gid);
    let song = queue.CurrentSong;
    // TODO : if song not in songs delete the song
    queue.Playing = false;
    queue.CurrentSong = null;
    callback(queue.Loop && queue.Songs.length > 0);
    return;
  };
  consumerUpdate = async (id, consumerCount, broadcasterCount) => {
    let queue = this.Queues.filter((q) => q.ID === id)[0];
    if (queue) {
      queue.Info = { consumerCount, broadcasterCount };
      setTimeout(() => {
        this.Quite(id);
      }, 90000);
    }
  };

  Quite = (id) => {
    let queue = this.Queues.filter((q) => q.ID === id)[0];
    if (
      queue.Info.consumerCount === 0 &&
      queue.Info.broadcasterCount === 1 &&
      queue.Live
    ) {
      this.End(
        id,
        (s) => {
          return;
        },
        (e) => {
          return;
        }
      );
    }
  };
};
