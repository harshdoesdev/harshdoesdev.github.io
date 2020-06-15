import loadImage from './yan/loadImage.js';

import { on, ready } from './yan/dom.js';

ready(() => {

  const cnv = document.createElement("canvas"),
        ctx = cnv.getContext("2d");

  cnv.width = 256;

  cnv.height = 132;

  document.body.appendChild(cnv);

  const keyboard = [];

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

      let cx = 0, cy = 0;

      const loop = () => {

        requestAnimationFrame(loop);

        ctx.clearRect(0, 0, cnv.width, cnv.height);

        ctx.save();

        ctx.translate(cx, cy);

        let a = 0;

        for(let i = 0; i < 2; i++) {
          ctx.drawImage(res[0], a, 0, cnv.width, cnv.height);
          a = i + cnv.width;
        }

        ctx.drawImage(res[1], 20, 4, 70, 126);

        ctx.drawImage(res[2], 120, 10, 53, 120);

        for(let i = 0; i < Math.round(window.innerWidth / 2); i++) {

          drawRoad(i, cnv.height - 2);

        }

        if(curr !== prev) {
          if(prev) sprites[prev].stopLoop();
          prev = curr;
          sprites[curr].startLoop();
        }

        if(keyboard[39] || keyboard[68]) {

          curr = 'walk_r';

          player.x += 1;

        } else if(keyboard[37] || keyboard[65]) {

          curr = 'walk_l';

          player.x -= 1;

        } else {

          curr = 'idle';

        }

        if(player.x < 0) player.x = 0;

        if(player.x + 32 > (cnv.width * 2)) player.x = (cnv.width * 2) - 32;

        sprites[curr].draw(ctx, player.x, player.y);

        if(player.x < (cnv.width * 2) - 32 && player.x + 32 > cx + cnv.width) {
          cx = -player.x - 32 + cnv.width;
          console.log(cx)
        }

        ctx.restore();

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

});
