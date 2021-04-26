module.exports = class PlayerSong {
  ID;
  Title;
  URL;
  Path;
  Image;
  constructor(id, title, url, path, image) {
    this.ID = id;
    this.Title = title;
    this.URL = url;
    this.Path = path;
    this.Image = image;
  }
  fixYoutube = () => {
    this.Image = `https://img.youtube.com/vi/${this.ID}/hqdefault.jpg`;
  };
};
