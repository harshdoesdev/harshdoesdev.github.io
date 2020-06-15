import { on } from './dom.js';

export default src => {

  return new Promise((res, rej) => {

    if(src) {

      const img = new Image();

      on(img, "load", () => res(img));

      on(img, "error", () => rej("error loading the image."));

      img.src = src;

    } else {

      rej("no src provided.");

    }

  });

};
