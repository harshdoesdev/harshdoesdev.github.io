import Camera from './camera.js';

import { resolveCollision, rectInRect } from './yan/collision.js';

import { qs, on } from './yan/dom.js';

const cnv = qs('#display'),
      ctx = cnv.getContext("2d");

const resize = () => {

  cnv.width = window.innerWidth;

  cnv.height = window.innerHeight;

};

resize();

let running = false;

const camera = new Camera(ctx);

const half_h = cnv.height / 2,
      half_w = cnv.width / 2;

const player = {
  x: 200,
  y: 150,
  w: 20,
  h: 20,
  jumping: false,
  grounded: false,
  vx: 0,
  vy: 0
};

let score = 0;

const platforms = [

  { x: 100, y: half_h, w: 200, h: 20 },

  { x: 360, y: half_h - 80, w: 200, h: 20 },

  { x: 600, y: half_h - 20, w: 200, h: 20 }

];

const coins = [

  { x: 140, y: half_h - 50, visible: true },

  { x: 390, y: half_h - 160, visible: true },

  { x: 650, y: half_h - 70, visible: true },

  { x: 500, y: half_h - 160, visible: true },

  { x: 450, y: half_h - 200, visible: true }

];

const controller = {

  up: false,

  left: false,

  right: false

};

const applyGravity = player => {

  if(controller.up && !player.jumping) {
    player.vy -= 30;
    player.jumping = true;
    player.grounded = false;
  }

  if(controller.left) {

    player.vx -= 0.5;

  }

  if(controller.right) {

    player.vx += 0.5;

  }

  player.vy += 1;
  player.y += player.vy;
  player.x += player.vx;
  player.vx *= 0.9;
  player.vy *= 0.9;

  if(player.grounded) {
    player.jumping = false;
    player.vy = 0;
  }

};

let msg = 'Press any key to start';

let tw = ctx.measureText(msg).width;

const gameloop = () => {

  requestAnimationFrame(gameloop);

  ctx.clearRect(0, 0, cnv.width, cnv.height);

  ctx.font = "30px sans-serif";
  ctx.fillStyle = "#fff";

  if(running) {

    camera.moveTo(player.x, player.y);

    camera.begin();

    ctx.fillText(`Your Score: ${score}`, 100, 100);

    applyGravity(player);

    coins.forEach((coin, i) => {

      if(coin.visible) {

        ctx.fillStyle = "lightgreen";

        ctx.fillRect(coin.x, coin.y, 10, 10);

        if(rectInRect(player.x, player.y, player.w, player.h, coin.x, coin.y, 50, 50)) {

          coin.visible = false;

          score += 1;

        }

      }

    });

    platforms.forEach(platform => {

      const { x, y, w, h, color } = platform;

      ctx.fillStyle = "silver";

      ctx.fillRect(x, y, w, h);

      if(rectInRect(player.x, player.y, player.w, player.h, x, y, w, h)) {

        player.grounded = true;

        resolveCollision(player, platform);

      }

    });

    ctx.fillStyle = "whitesmoke";

    ctx.fillRect(player.x, player.y, player.w, player.h);

    camera.end();

    if(player.y > window.innerHeight) {
      score = 0;
      coins.forEach(coin => coin.visible = true);
      player.x = 200;
      player.y = 150;
    }

  } else {

    ctx.fillText(msg, half_w - tw , half_h - 30);

  }

};

on(window, "load", () => {

  requestAnimationFrame(gameloop);

});

on(window, "resize", resize);

const aud = new Audio();

aud.setAttribute("loop", true);

const playAud = () => {
  if(running) aud.play();
};

on(aud, "load", playAud);

aud.src = "./bg.mp3";

on(window, "keydown", ({ keyCode }) => {

  if(!running) {
    running = true;
    playAud();
  }

  if(keyCode === 32) {

    controller.up = true;

  }

  if(keyCode === 36 || keyCode === 68) {

    controller.right = true

  }

  if(keyCode === 37 || keyCode === 65) {

    controller.left = true

  }

});

on(window, "keyup", ({ keyCode }) => {

  if(keyCode === 32) {

    controller.up = false;

  }

  if(keyCode === 36 || keyCode === 68) {

    controller.right = false

  }

  if(keyCode === 37 || keyCode === 65) {

    controller.left = false

  }

});
