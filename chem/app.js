import { clamp, shuffle } from './yan/utils.js';

import { qs, style, on, ready } from './yan/dom.js';

import { rectInRect, pointInCircle } from './yan/collision.js';

ready(() => {

  const cnv = qs("#cnv"),
        
        ctx = cnv.getContext("2d");

  cnv.width = clamp(window.innerWidth, 320, 425);

  cnv.height = window.innerHeight;

  style(cnv, { background: "#000" });

  const mouse = {

    x: 0,

    y: 0,

    isDown: false

  };

  const drawCircle = (ctx, { x, y, r, type, label }) => {

    const color = type === 0 ? "#228B22" : "#980010";

    ctx.save();

    ctx.beginPath();

    ctx.fillStyle = color;

    ctx.arc(x, y, r, 0, Math.PI * 2, false);

    ctx.fill();

    ctx.closePath();

    ctx.beginPath();

    ctx.strokeStyle = "#ccc";

    ctx.arc(x, y, r + 5, 0, Math.PI * 2, false);

    ctx.stroke();

    ctx.closePath();

    ctx.fillStyle = "#fff";

    ctx.font = (16 * (cnv.width / cnv.height)) + "px sans-serif";

    ctx.fillText(label.toUpperCase(), x, y + (r * 2));

    ctx.restore();

  };

  const numR = 1;

  const s_cols = (cnv.width / numR),

        s_off = cnv.width / (2 * numR);

  const plist = [

      // { label: "abc", type: 0 },
      
      // { label: "def", type: 0 }, 
      
      // { label: "ghi", type: 0 },
      
      // { label: "jkl", type: 0 }, 
      
      // { label: "mno", type: 0 },

      // { label: "pqr", type: 0 },
      
      // { label: "stu", type: 0 },

      { label: "Origin of replication", type: 0 },
      
      { label: "Antibiotic resistance", type: 0 }, 
      
      { label: "Multiple Cloning Sites", type: 0 },
      
      { label: "Selection marker", type: 0 }, 
      
      { label: "Promoter", type: 0 },

      // { label: "pqr", type: 0 },
      
      // { label: "stu", type: 0 }
    
  ];

  const nlist = [
    
    { label: "DNase", type: 1 },
    
    { label: "Ribosomal binding site", type: 1 }, 
    
    { label: "Terminator sequence", type: 1},

    { label: "Operator", type: 1 },
    
    // { label: "dbgsg", type: 1 }, 
    
    // { label: "sahah", type: 1}
  
  ];

  const slist = shuffle([...plist, ...nlist]);

  const numC = slist.length;

  const beakers = [];

  let cols = [];

  for(let i = 0; i < (numC / numR); i++) {

    cols[i] = [];

    for(let j = 0; j < numR; j++) {

      const comp = slist.shift();

      const r = 20,

            y = -100 * i;

      cols[i][j] = Object.assign({
  
          x: (s_cols * (j + 1)) - s_off,
      
          y,
      
          r,
      
          v: 2,
  
          state: 1
  
        }, comp);

    }

  }
  
  for(let i = 0; i < numR; i++) {

    beakers[i] = {

      x: ((s_cols * (i + 1)) - s_off) - 40,

      y: cnv.height - 200,

      state: 0

    };

  }

  let gameState = "stopped";

  let score = 0, count = 0;

  const adjf = 32 * (cnv.width / cnv.height);
  
  const loop = () => {

    requestAnimationFrame(loop);
    
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    if(gameState === "running") {

      if(count === numC) {

        gameState = "done";

      } else {

        cols.forEach(rows => {

          rows.forEach(row => {
            
            if(
            
              pointInCircle(mouse.x, mouse.y, row.x, row.y, row.r)
            
            ) {

              if(row.state !== 0) {

                row.state = 0;

                score += row.type === 1 ? 1 : -1;

                count += 1;

              }
            
            }
      
            if(row.state) {
              
              row.y += row.v;
      
              drawCircle(ctx, row);
      
              beakers.forEach(beaker => {
      
                if(
                  
                  rectInRect(row.x, row.y + (row.r * 2), 20, 20, beaker.x, beaker.y, 100, 100)
                
                ) {

                  if(row.type === 1) {

                    score -= 1;
                    
                    beaker.state = 1;

                  } else {

                    beaker.state = 2;
    
                  }

                  count += 1;

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
      
          ctx.fillRect(beaker.x, beaker.y, 80, 100);
      
        });

        ctx.fillStyle = "#fff";

        ctx.fillText("Cloning Vectors", cnv.width / 2, cnv.height - adjf - 20);
      
        ctx.fillStyle = score < nlist.length ? "#990000" : "#009900";
        
        const s = `Score: ${score}/${nlist.length}`;

        ctx.fillText(s, 0 + ctx.measureText(s).width, 0 + adjf + 20);

      }

    } else if(gameState === "done") {
      
      ctx.fillStyle = score < nlist.length ? "#990000" : "#009900";

      ctx.fillText(
    
        `Score: ${(score / nlist.length) * 100}%`, 
    
        cnv.width / 2,
    
        cnv.height / 2
      
      );

      ctx.fillStyle = "#fff";

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

  const stateMan = () => {

    if (gameState === "done") {

      score = 0;
      
      count = 0;

      cols = shuffle(cols.map((rows, i) => {

        return shuffle(rows.map(row => {

          return Object.assign(row, {
      
            y: -100 * i,

            state: 1

          });

        }));
    
      }));

      beakers.forEach(beaker => beaker.state = 0);

      gameState = "running";

    } else if(gameState !== "running") {

      gameState = "running";

    }

  };

  on(cnv, "touchstart", ({ touches }) => {

    stateMan();

    mouse.x = touches[0].clientX - cnv.offsetLeft;

    mouse.y = touches[0].clientY - cnv.offsetTop;

  });

  on(cnv, "touchmove", ({ touches }) => {

    mouse.x = touches[0].clientX - cnv.offsetLeft;

    mouse.y = touches[0].clientY - cnv.offsetTop;

  });

  on(cnv, "touchend", () => {

    mouse.x = 0;

    mouse.y = 0;

  });

  on(cnv, "mousedown", ({ clientX, clientY }) => {
    
    stateMan();

    mouse.x = clientX - cnv.offsetLeft;

    mouse.y = clientY - cnv.offsetTop;

    mouse.isDown = true;

  });

  on(cnv, "mousemove", ({ clientX, clientY }) => {

    if(mouse.isDown) {

      mouse.x = clientX - cnv.offsetLeft;

      mouse.y = clientY - cnv.offsetTop;

    }

  });

  on(cnv, "mouseup", () => {

    mouse.x = 0;

    mouse.y = 0;

    mouse.isDown = false;

  });

});
