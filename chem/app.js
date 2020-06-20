import { clamp, randomInt, random } from './yan/utils.js';

import { invertColor } from './yan/color.js';

import { qs, style, on } from './yan/dom.js';

import { rectInRect, pointInCircle } from './yan/collision.js';

const cnv = qs("#cnv"),
      ctx = cnv.getContext("2d");

cnv.width = clamp((window.innerWidth / 100) * 40, 320, 768);

cnv.height = window.innerHeight;

style(cnv, { background: "#000" });

const mouse = {

  x: 0,

  y: 0

};

const drawCircle = (ctx, { x, y, r, type }) => {

  const color = type === 0 ? "#228B22" : "#980010";

  ctx.beginPath();

  ctx.fillStyle = color;

  ctx.arc(x, y, r, 0, Math.PI * 2, false);

  ctx.fill();

  ctx.closePath();

  ctx.beginPath();

  ctx.strokeStyle = invertColor( color );

  ctx.arc(x, y, r + 5, 0, Math.PI * 2, false);

  ctx.stroke();

  ctx.closePath();

};

const numC = 10, numR = 2;

const s_cols = (cnv.width / numR),

      s_off = cnv.width / (2 * numR);

const beakers = [];

const cols = [];

for(let i = 1; i < (numC + 1); i++) {

  cols[i] = [];

  for(let j = 1; j < (numR + 1); j++) {

    const type = randomInt(0, 1);

    cols[i][j] = {

      x: (s_cols * j) - s_off,
  
      y: -100 * i,
  
      r: 20,
  
      v: 2,
      
      type,

      state: 1
  
    };

  }

}

for(let i = 1; i < (numR + 1); i++) {

  beakers[i] = {

    x: ((s_cols * i) - s_off) - 50,

    y: cnv.height - 200,

    state: 0

  };

}

let gameState = "stopped";

let pos = 0, neg = 0, tot = numC * numR;

const adjf = 32 * (cnv.width / cnv.height);

const loop = () => {

  requestAnimationFrame(loop);

  ctx.clearRect(0, 0, cnv.width, cnv.height);

  if(gameState === "running") {

    if((pos + neg) >= tot) {

      gameState = "done";

    } else {

      cols.forEach(rows => {

        rows.forEach(row => {
    
          if(
          
            row.type === 1 &&
          
            pointInCircle(mouse.x, mouse.y, row.x, row.y, row.r)
          
          ) {

            if(row.state !== 0) {

              row.state = 0;

              pos += 1;

            }
          
          }
    
          if(row.state) {
            
            row.y += row.v;
    
            drawCircle(ctx, row);
    
            beakers.forEach(beaker => {
    
              if(
                
                rectInRect(row.x, row.y, 20, 20, beaker.x, beaker.y, 200, 200)
              
              ) {
                
                if(row.type === 1) {
                  
                  beaker.state = 1;

                  neg += 1;
                
                } else {
  
                  beaker.state = 2;

                  pos += 1;
  
                }
                
                row.state = 0;
    
              }
    
            });
         
          }
    
        });
    
      });
    
      beakers.forEach(beaker => {
        
        ctx.fillStyle = beaker.state === 1 
          
          ? "#990000"
          
          : beaker.state === 2 
          
            ? "#009900" 
            
            : "#fff";
    
        ctx.fillRect(beaker.x, beaker.y, 100, 100);
    
      });

    }

  } else if(gameState === "done") {

    ctx.fillStyle = "#fff";

    ctx.fillText(
  
      `${(pos / tot) * 100}% Success`, 
  
      cnv.width / 2,
  
      cnv.height / 2
    
    );

    ctx.fillText(

      "Tap anywhere to replay.",

      cnv.width / 2, 

      (cnv.height / 2) + adjf + 20
    
    );

  } else {

    ctx.fillStyle = "#fff";

    ctx.font = `${adjf}px sans-serif`;

    ctx.textBaseline = 'middle';
    ctx.textAlign = "center";

    ctx.fillText(

      "Touch anywhere to start.",

      cnv.width / 2, 

      cnv.height / 2
    
    );

  }


};

requestAnimationFrame(loop);

on(cnv, "touchstart", ({ touches }) => {

  if (gameState === "done") {

    pos = 0;
    
    neg = 0;

    cols.forEach((rows, i) => {

      rows.forEach(row => {

        Object.assign(row, {
    
          y: -100 * i,

          state: 1

        });

      });
  
    });

    gameState = "running";

  } else if(gameState !== "running") {

    gameState = "running";

  }

  mouse.x = touches[0].clientX - cnv.offsetLeft;

  mouse.y = touches[0].clientY - cnv.offsetTop;

});

on(cnv, "touchmove", e => {
      
  e.preventDefault();
  
  const { touches } = e;
      
  mouse.x = touches[0].clientX - cnv.offsetLeft;

  mouse.y = touches[0].clientY - cnv.offsetTop;

});

on(cnv, "touchend", () => {

  mouse.x = 0;

  mouse.y = 0;

});
