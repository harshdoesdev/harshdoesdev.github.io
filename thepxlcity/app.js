import loadImage from './yan/loadImage.js';

import { on, ready } from './yan/dom.js';

ready(() => {

  const cnv = document.createElement("canvas"),
        ctx = cnv.getContext("2d");

  cnv.width = 256;

  cnv.height = 132;

  document.body.appendChild(cnv);

  const keyboard = [];

  const touch = { x: 0, y: 0, isDown: false };

  const player = {
    x: 92,
    y: cnv.height - 2 - 32
  };

  const sources = [
    'bg.png','house1.png','house2.png','road.png', 'idle.png', 'walk_l.png', 'walk_r.png'
  ];

  Promise.all(sources.map(src => loadImage('./assets/' + src)))
    .then(res => {

      const drawRoad = (x, y) => ctx.drawImage(res[3], x, y, 2, 2);

      const sprites = {

        idle: new Sprite(
          res[4],
          {
            frameW: 16,
            frameH: 32,
            interval: 250
          }
        ),

        walk_l: new Sprite(
          res[5],
          {
            frameW: 16,
            frameH: 32
          }
        ),

        walk_r: new Sprite(
          res[6],
          {
            frameW: 16,
            frameH: 32
          }
        )

      };

      let curr = 'idle', prev;

      const loop = () => {

        requestAnimationFrame(loop);

        ctx.clearRect(0, 0, cnv.width, cnv.height);

        ctx.drawImage(res[0], 0, 0, cnv.width, cnv.height);

        ctx.drawImage(res[1], 20, 4, 70, 126);

        ctx.drawImage(res[2], 120, 13, 53, 120);

        for(let i = 0; i < Math.round(window.innerWidth / 2); i++) {
          drawRoad(i, cnv.height - 2);
        }

        if(curr !== prev) {
          if(prev) sprites[prev].stopLoop();
          prev = curr;
          sprites[curr].startLoop();
        }

        if(keyboard[39]) {
          curr = 'walk_r';
          player.x += 1;
        } else if(keyboard[37]) {
          curr = 'walk_l';
          player.x -= 1;
        } else {
          curr = 'idle';
        }

        if(touch.isDown) {
          if(touch.x > cnv.width / 2) {
            curr = 'walk_r';
            player.x += 1;
          } else if(touch.x < cnv.width / 2) {
            curr = 'walk_l';
            player.x -= 1;
          } else {
            curr = 'idle';
          }

        }

        sprites[curr].draw(ctx, player.x, player.y);

      };

      requestAnimationFrame(loop);

    })

    .catch(console.error);

    on(window, "keydown", e => {

      keyboard[e.keyCode] = true;

    });

    on(window, "keyup", e => {

      keyboard[e.keyCode] = false;

    });

    const handleTouch = e => {

      console.log(1)

      touch.isDown = true;

      touch.x = e.touches[0].clientX;

      touch.y = e.touches[0].clientY;

    };

    on(cnv, "touchdown", handleTouch);

    on(cnv, "touchend", () => touch.isDown = false);

});
