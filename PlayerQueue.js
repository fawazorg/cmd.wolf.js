const fs = require("fs");
module.exports = class PlayerQueue {
  ID;
  Loop;
  Playing;
  Songs;
  CurrentSong;
  LastSong;
  Live;
  Info;
  constructor(
    id,
    loop = true,
    playing = false,
    songs = [],
    current_song = null,
    last_song = null,
    live = false
  ) {
    this.ID = id;
    this.Loop = loop;
    this.Songs = songs;
    this.Playing = playing;
    this.CurrentSong = current_song;
    this.LastSong = last_song;
    this.Live = live;
  }
  PlaySong = (index = 0, on_success, on_failure) => {
    if (index > this.Songs.length - 1) {
      on_failure(12);
      return;
    }
    let song = this.Songs[index];
    if (song) {
      this.SetCurrent(song);
      this.SetLast(song);
      this.Live = true;
      on_success(song);
      return;
    }
    on_failure(6);
  };
  NextSong = (on_success, on_failure) => {
    let index = this.Songs.indexOf(this.LastSong);
    if (index === this.Songs.length - 1) {
      index = 0;
    } else {
      index = index + 1;
    }
    //index = index === this.Songs.length ? this.Songs.length : index + 1;
    this.PlaySong(
      index,
      (song) => {
        on_success(song);
      },
      () => {
        on_failure(7);
      }
    );
  };
  PrevSong = (on_success, on_failure) => {
    let index = this.Songs.indexOf(this.LastSong);
    if (index === 0) {
      index = this.Songs.length;
    } else {
      index = index - 1;
    }
    //index = index === 0 ? this.Songs.length : index - 1;
    this.PlaySong(
      index,
      (song) => {
        on_success(song);
      },
      () => {
        on_failure(7);
      }
    );
  };
  AddSong = (song, on_failure) => {
    if (this.Songs.length >= 5) {
      on_failure(10);
      return;
    }
    this.Songs.push(song);
  };
  RemoveSong = (song) => {
    try {
      fs.unlinkSync(song.Path);
    } catch (err) {
      console.error(err);
    }
    this.Songs = this.Songs.filter((s) => s.ID !== song.ID);
  };
  SetCurrent = (song) => {
    this.CurrentSong = song;
    this.Playing = true;
  };
  SetLast = (song) => {
    this.LastSong = song;
  };
  GetSongName = (dir) => {
    let path = this.MakeDir(dir);
    return `${path}/${Math.random().toString(36).substr(2, 10)}.mp3`;
  };
  MakeDir = (dir) => {
    var path = `${dir}/${this.ID}`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    return path;
  };
  ClearList = (dir) => {
    this.Songs = [];
    this.last_song = null;
    let path = `${dir}/${this.ID}`;
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path);
      if (files.length > 0) {
        files.forEach(function (filename) {
          if (fs.statSync(path + "/" + filename).isDirectory()) {
            this(path + "/" + filename);
          } else {
            fs.unlinkSync(path + "/" + filename);
          }
        });
        fs.rmdirSync(path);
      } else {
        fs.rmdirSync(path);
      }
    } else {
      console.log("Directory path not found.");
    }
  };
  ListFromat = () => {
    if (this.Songs.length === 0) return;
    var format = "\n";
    this.Songs.forEach((song, index, arry) => {
      if (index === arry.length - 1) {
        format += `${index + 1} ـ ` + this.SongFromat(song);
        return format;
      }
      format += `${index + 1} ـ ` + this.SongFromat(song) + "\n";
    });
    return format;
  };
  SongFromat = (song) => {
    if (!song) return;
    let current =
      this.CurrentSong === null ? false : song.ID === this.CurrentSong.ID;
    return `${current ? "⏹" : ""}${song.Title}`;
  };
};
