import { clamp, randomInt, random } from './yan/utils.js';

import { invertColor } from './yan/color.js';

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

  const snd = new Audio("data:audio/wav;base64,UklGRu4GAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YcoGAAB/fn5+fHx+enl9d3d8dXV8c3RrbXhtbnlsbHdoaHRkZHBfX2xaW2pXWGlVV2tUV21WWXBYW0hPaVNWblZYbVZWaVNUZlBRY05PYk1PYk5RZlBTalNXblZZcFhbSE5nUVRpU1RoUlJkT1BhTU5gTE5hTVBkT1JoUlVsVVhvV1pvWEZMY09RZlBSZE9QYU1OX0xOYExPYk5RZVBUaVNXbVZZbldZbldYR0xhTU9iTk9gTU5eS01fTE5hTVBkhWlmd15eclpccFlabVZGS2BNT2FOT2BNTl5MTV5MTmBNUGODaGV1XV1wWVtvWFlsVldph2plcVpYZlJSYU5PX0xOYH1jYHCNb2p5YGByW1xvWFlsi21oU1RkUFFgTk5eTE1dS01ee2JfboptaXhfX3FaW25YWWuKbWh0jW9YV2VRUV9NTl1LTV56YV5tiWxod15ecFlabVdYaolsZnKMbmdxWldkUFBeTE1deF9ca4ZqZnSRcmx6YWBxWlprimxnc4xuZ3FaV2RQUF54X1togWZib4psaHWRcm16YV9wWVlqiGtmcoptZnCGaWNsgWZha4JnYW6HamZ0j3BreWBfcFlZa4lsZnKMbmdxh2tkbYJnYWuBZmFthWlkcYxuaneTdG57YWBwjW9pdI1vaHKIa2Vug2hia4FmYWyEaWRxi25pd5J0bntiYXCNb2l1jXBpcohsZW6DaGJsgWdibIRpZHGKbml3knNue2JhcIxwanaOcWp0iW1mb4NpY2yBZ2JthGllcotuaneRc257Y2FxjXFrd49ya3SJbmdwWlhke2NfaoFnY3CIbWh1j3JtemJhcVtcbIltaHSMb2lVVWJQUV9OT153YF1qhGlmc41wbHlhYXFbXG1YWWmGa2ZyXFpnVFNhT1BeTU9eeWFfbYdsaHZfX3BaXG5ZWmxXWWqGa1ZWZVJSYU9QX01OXk1PX3xjYXCMb2t6YWFyXF1vWVpsim5pVFVlUVJhT1BfTU5eTU9gfWRhcI1va3phYXNcXXBaW21YWUhMYE5QYE5PX01PX01PYE5QYoFmZHRdXXBaXHBaW29ZWm1YWGpVVmZTU2NQUWBOUGBOUGJQU2ZSVWlVWG1YWm9ZXG9ZW0pPY1FTZFFTY1BRYU9RYU9SY1FUZ1NWalZZbllbcFpccFtKUGVSVWdUVWZTVGRRUmNQUmRRVGZTVmpWWW5ZXHFbXnJcTFFoVFdqVlhpVVZmU1RlUlRlUlRmU1ZqVlluWVxyXF5NVGtXWm9aXG5ZWmtXWGhVVmZTVWZTVWhUV2tXWm9aXXNdX05URk5nVFhtWFptWFlqVldoVVZnVFZoVVhrWFtvW15zXmFRV0pSalhccF1fcF1eblxdbFpballballcbFtecF5hdGFkd2RmV1xxYGN1YmR0YmNyYWFvX2BuXl9uXmBvYGJyYmV2ZWd5Z2pcYVZcb2FkdGRmdGVlcmNkcWNkcGJkcWNlc2VndmhqeWpsYGVbYXJlaHdpandpanZpaXRnaHNnaHNnaXRoandrbXptb2VpYWZeZHNpa3hsbXhtbXdsbXZsbHVrbHZsbXdtb3lvcXxxc2puZ2tlaXZtb3lwcXlwcXlwcXhwcHhwcXhxcnpyc3tzdH10dm9ybXB5cnR8dHV8dXV7dHV6dHR6dHV6dHV7dXZ8dnd9d3h0dnJ0cXR6dnd8eHh8eHh8eHh8eHh8eHh8eHl8eXp9ent+ent4eXd5d3h8enp9e3t9e3t9e3t9e3t9fHx9fHx+fX1+fX1+fX18fX19fn1+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+");
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

                snd.play();

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

      ctx.fillStyle = pos < neg ? "#990000" : "#009900";

      ctx.fillText(
    
        `${(pos / tot) * 100}% Success`, 
    
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

      beakers.forEach(beaker => beaker.state = 0);

      gameState = "running";

    } else if(gameState !== "running") {

      gameState = "running";

    }

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

});