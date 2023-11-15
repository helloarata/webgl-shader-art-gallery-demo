import {Resize} from './utils/Resize.js';
import ArtBoard from './ArtBoard/index.js';

window.addEventListener('DOMContentLoaded', () => {
  const resize = new Resize();
  resize.init();
  const artBoard = new ArtBoard();
  resize.update(artBoard);
  artBoard.load()
  .then(() => {
    artBoard.init();
  });
});