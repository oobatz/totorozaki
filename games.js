/* ============================================
   TOTOROZAKI — games.js
   Логика страницы игр (games.html)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  updateStageScale();
  updateCartBadge();
});

window.addEventListener('resize', updateStageScale);

function updateStageScale() {
  const scale = Math.max(window.innerWidth / 1200, window.innerHeight / 675);
  document.documentElement.style.setProperty('--stage-scale', String(scale));
}

// ── Открыть игру ──────────────────────────────
function openGame(type) {
  const modal     = document.getElementById('modal-game');
  const container = document.getElementById('game-container');
  modal.classList.remove('hidden');
  container.innerHTML = '';

  const builders = {
    snake:    () => buildSnake(container),
    '2048':   () => build2048(container),
    tetris:   () => buildTetris(container),
    solitaire:() => { container.innerHTML = noGame('🃏', 'Пасьянс — скоро!'); },
    sudoku:   () => { container.innerHTML = noGame('📊', 'Судоку — скоро!'); },
  };

  if (builders[type]) builders[type]();
}

function noGame(icon, text) {
  return `<div style="text-align:center;color:rgba(255,255,255,0.4);padding:50px 20px;font-size:1rem;">
    <div style="font-size:3rem;margin-bottom:12px">${icon}</div>${text}</div>`;
}

// ── Наблюдатель за закрытием модала ───────────
function watchModalClose(onClose) {
  const modal = document.getElementById('modal-game');
  const obs = new MutationObserver(() => {
    if (modal.classList.contains('hidden')) { onClose(); obs.disconnect(); }
  });
  obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
  return obs;
}

/* =============================================
   ЗМЕЙКА
   ============================================= */
function buildSnake(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">
      <div style="font-family:var(--font-main);color:var(--neon-cyan);font-size:.8rem;letter-spacing:2px">
        ЗМЕЙКА &nbsp;—&nbsp; <span id="snake-score">0</span>
      </div>
      <canvas id="snake-canvas" width="320" height="320"
        style="border:1px solid rgba(0,229,255,.3);border-radius:8px;background:rgba(5,2,15,.95)"></canvas>
      <div style="font-size:.68rem;color:rgba(255,255,255,.35)">Стрелки / WASD для управления · Enter — перезапуск</div>
    </div>`;

  const canvas = document.getElementById('snake-canvas');
  const ctx    = canvas.getContext('2d');
  const SZ = 20, COLS = 16, ROWS = 16;

  let snake    = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
  let dir      = {x:1,y:0};
  let nextDir  = {x:1,y:0};
  let food     = rndFood();
  let score    = 0;
  let dead     = false;
  let interval;

  function rndFood() {
    let f;
    do { f = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) }; }
    while (snake.some(s => s.x===f.x && s.y===f.y));
    return f;
  }

  function draw() {
    ctx.fillStyle = 'rgba(5,2,15,.95)';
    ctx.fillRect(0, 0, 320, 320);

    // Сетка
    ctx.strokeStyle = 'rgba(192,132,252,.05)';
    ctx.lineWidth   = .5;
    for (let i=0;i<=COLS;i++){ctx.beginPath();ctx.moveTo(i*SZ,0);ctx.lineTo(i*SZ,320);ctx.stroke();}
    for (let j=0;j<=ROWS;j++){ctx.beginPath();ctx.moveTo(0,j*SZ);ctx.lineTo(320,j*SZ);ctx.stroke();}

    // Еда
    ctx.fillStyle   = '#ff6b9d';
    ctx.shadowColor = '#ff6b9d';
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(food.x*SZ+SZ/2, food.y*SZ+SZ/2, SZ/2-2, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Змейка
    snake.forEach((s, i) => {
      const t = 1 - i / snake.length;
      ctx.fillStyle   = i===0 ? '#00e5ff' : `rgba(${Math.round(t*80)},${Math.round(229*t)},${Math.round(255*t)},${.4+t*.6})`;
      ctx.shadowColor = i===0 ? '#00e5ff' : 'transparent';
      ctx.shadowBlur  = i===0 ? 8 : 0;
      ctx.fillRect(s.x*SZ+1, s.y*SZ+1, SZ-2, SZ-2);
    });
    ctx.shadowBlur = 0;

    // Game over
    if (dead) {
      ctx.fillStyle = 'rgba(5,2,15,.75)';
      ctx.fillRect(0,0,320,320);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff6b9d';
      ctx.font = 'bold 20px Orbitron,monospace';
      ctx.fillText('ИГРА ОКОНЧЕНА', 160, 140);
      ctx.fillStyle = '#00e5ff';
      ctx.font = '14px Orbitron,monospace';
      ctx.fillText('Счёт: ' + score, 160, 168);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.font = '11px Nunito,sans-serif';
      ctx.fillText('Нажмите Enter для перезапуска', 160, 196);
    }
  }

  function step() {
    if (dead) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      dead = true; draw(); return;
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      food = rndFood();
      const el = document.getElementById('snake-score');
      if (el) el.textContent = score;
    } else { snake.pop(); }
    draw();
  }

  interval = setInterval(step, 130);

  const DIR_MAP = {
    ArrowUp:{x:0,y:-1}, w:{x:0,y:-1}, W:{x:0,y:-1},
    ArrowDown:{x:0,y:1}, s:{x:0,y:1}, S:{x:0,y:1},
    ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0}, A:{x:-1,y:0},
    ArrowRight:{x:1,y:0}, d:{x:1,y:0}, D:{x:1,y:0},
  };

  const onKey = e => {
    if (e.key === 'Enter' && dead) {
      snake = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
      dir = nextDir = {x:1,y:0};
      food = rndFood(); score = 0; dead = false;
      const el = document.getElementById('snake-score');
      if (el) el.textContent = 0;
      return;
    }
    const nd = DIR_MAP[e.key];
    if (nd && (nd.x !== -dir.x || nd.y !== -dir.y)) { nextDir = nd; e.preventDefault(); }
  };
  document.addEventListener('keydown', onKey);
  watchModalClose(() => { clearInterval(interval); document.removeEventListener('keydown', onKey); });
  draw();
}

/* =============================================
   2048
   ============================================= */
function build2048(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">
      <div style="font-family:var(--font-main);color:var(--neon-cyan);font-size:.8rem;letter-spacing:2px">
        2048 &nbsp;—&nbsp; Счёт: <span id="g2048-score">0</span>
      </div>
      <div id="g2048-board"
        style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;
               background:rgba(192,132,252,.08);border:1px solid rgba(192,132,252,.3);
               border-radius:10px;padding:8px;width:288px"></div>
      <div style="font-size:.68rem;color:rgba(255,255,255,.35)">Стрелки для управления</div>
    </div>`;

  let grid  = Array(4).fill(null).map(()=>Array(4).fill(0));
  let score = 0;

  const COLORS = {
    0:'rgba(20,5,50,.5)', 2:'rgba(0,229,255,.25)', 4:'rgba(0,229,255,.45)',
    8:'rgba(192,132,252,.5)', 16:'rgba(192,132,252,.75)', 32:'rgba(255,107,157,.5)',
    64:'rgba(255,107,157,.75)', 128:'rgba(251,146,60,.6)', 256:'rgba(251,146,60,.85)',
    512:'rgba(255,210,60,.7)', 1024:'rgba(255,220,0,.9)', 2048:'#ffe64d',
  };

  function addTile() {
    const empty = [];
    grid.forEach((row,r)=>row.forEach((v,c)=>{ if(!v) empty.push([r,c]); }));
    if (!empty.length) return;
    const [r,c] = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random()<.9 ? 2 : 4;
  }

  function render() {
    const board = document.getElementById('g2048-board');
    if (!board) return;
    board.innerHTML = '';
    grid.forEach(row => row.forEach(v => {
      const d = document.createElement('div');
      d.style.cssText = `
        width:62px;height:62px;display:flex;align-items:center;justify-content:center;
        border-radius:8px;background:${COLORS[v]||'rgba(255,200,0,.9)'};
        font-family:var(--font-main);font-weight:700;color:${v?'white':'transparent'};
        font-size:${v>999?'.7rem':v>99?'.85rem':'1rem'};
        border:1px solid rgba(192,132,252,.15);
        box-shadow:${v?'0 0 8px rgba(192,132,252,.2)':'none'};`;
      d.textContent = v||'';
      board.appendChild(d);
    }));
    const el = document.getElementById('g2048-score');
    if (el) el.textContent = score;
  }

  function slideRow(row) {
    const nums = row.filter(v=>v);
    const merged = []; let i = 0;
    while (i < nums.length) {
      if (i+1 < nums.length && nums[i]===nums[i+1]) {
        const val = nums[i]*2; merged.push(val); score += val; i += 2;
      } else { merged.push(nums[i]); i++; }
    }
    return [...merged, ...Array(4-merged.length).fill(0)];
  }

  function move(dir) {
    const prev = JSON.stringify(grid);
    if (dir==='left')  { grid = grid.map(slideRow); }
    if (dir==='right') { grid = grid.map(r=>[...slideRow([...r].reverse())].reverse()); }
    if (dir==='up') {
      const t = grid[0].map((_,c)=>grid.map(r=>r[c]));
      const s = t.map(slideRow);
      grid = s[0].map((_,c)=>s.map(r=>r[c]));
    }
    if (dir==='down') {
      const t = grid[0].map((_,c)=>grid.map(r=>r[c]));
      const s = t.map(r=>[...slideRow([...r].reverse())].reverse());
      grid = s[0].map((_,c)=>s.map(r=>r[c]));
    }
    if (JSON.stringify(grid) !== prev) { addTile(); render(); }
  }

  addTile(); addTile(); render();

  const MAP = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
  const onKey = e => { if (MAP[e.key]) { move(MAP[e.key]); e.preventDefault(); } };
  document.addEventListener('keydown', onKey);
  watchModalClose(() => document.removeEventListener('keydown', onKey));
}

/* =============================================
   ТЕТРИС
   ============================================= */
function buildTetris(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">
      <div style="font-family:var(--font-main);color:var(--neon-cyan);font-size:.8rem;letter-spacing:2px">
        ТЕТРИС &nbsp;—&nbsp; <span id="tet-score">0</span>
      </div>
      <canvas id="tet-canvas" width="200" height="400"
        style="border:1px solid rgba(0,229,255,.3);border-radius:8px;background:rgba(5,2,15,.95)"></canvas>
      <div style="font-size:.68rem;color:rgba(255,255,255,.35)">← → двигать · ↑ вращать · ↓ ускорить</div>
    </div>`;

  const canvas = document.getElementById('tet-canvas');
  const ctx    = canvas.getContext('2d');
  const BLK = 20, COLS = 10, ROWS = 20;

  const PIECES = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[1,1,1],[0,0,1]],
    [[1,1,1],[1,0,0]],
    [[0,1,1],[1,1,0]],
    [[1,1,0],[0,1,1]],
    [[0,1,0],[1,1,1]],
  ];
  const COLORS = ['#00e5ff','#ffaa00','#ff6b9d','#c084fc','#34d399','#fb923c','#a78bfa'];

  let board  = Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));
  let piece, pColor, px, py, score = 0, dead = false;
  let interval;

  function newPiece() {
    const idx = Math.floor(Math.random()*PIECES.length);
    piece  = PIECES[idx].map(r=>[...r]);
    pColor = COLORS[idx];
    px     = Math.floor((COLS - piece[0].length) / 2);
    py     = 0;
    if (!fits(piece, px, py)) { dead = true; draw(); }
  }

  function fits(p, ox, oy) {
    return p.every((row,r) => row.every((v,c) => {
      if (!v) return true;
      const nx = ox+c, ny = oy+r;
      return nx>=0 && nx<COLS && ny>=0 && ny<ROWS && !board[ny][nx];
    }));
  }

  function rotate(p) { return p[0].map((_,i)=>p.map(r=>r[i]).reverse()); }

  function lock() {
    piece.forEach((row,r)=>row.forEach((v,c)=>{ if(v) board[py+r][px+c]=pColor; }));
    const before = board.length;
    board = board.filter(row=>!row.every(v=>v));
    const cleared = before - board.length;
    while (board.length < ROWS) board.unshift(Array(COLS).fill(0));
    score += [0,100,300,500,800][cleared] || 0;
    const el = document.getElementById('tet-score');
    if (el) el.textContent = score;
    newPiece();
  }

  function draw() {
    ctx.fillStyle = 'rgba(5,2,15,.95)';
    ctx.fillRect(0,0,200,400);
    ctx.strokeStyle = 'rgba(192,132,252,.05)'; ctx.lineWidth=.5;
    for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*BLK);ctx.lineTo(200,r*BLK);ctx.stroke();}
    for(let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*BLK,0);ctx.lineTo(c*BLK,400);ctx.stroke();}

    board.forEach((row,r)=>row.forEach((v,c)=>{
      if(v){ctx.fillStyle=v;ctx.shadowColor=v;ctx.shadowBlur=4;ctx.fillRect(c*BLK+1,r*BLK+1,BLK-2,BLK-2);ctx.shadowBlur=0;}
    }));

    if (!dead && piece) {
      ctx.fillStyle=pColor; ctx.shadowColor=pColor; ctx.shadowBlur=8;
      piece.forEach((row,r)=>row.forEach((v,c)=>{
        if(v) ctx.fillRect((px+c)*BLK+1,(py+r)*BLK+1,BLK-2,BLK-2);
      }));
      ctx.shadowBlur=0;
    }

    if (dead) {
      ctx.fillStyle='rgba(5,2,15,.75)'; ctx.fillRect(0,0,200,400);
      ctx.textAlign='center';
      ctx.fillStyle='#ff6b9d'; ctx.font='bold 14px Orbitron,monospace';
      ctx.fillText('КОНЕЦ ИГРЫ',100,185);
      ctx.fillStyle='#00e5ff'; ctx.font='11px Orbitron,monospace';
      ctx.fillText('Счёт: '+score,100,208);
    }
  }

  function step() {
    if (dead) return;
    if (fits(piece,px,py+1)) { py++; } else { lock(); }
    draw();
  }

  newPiece(); draw();
  interval = setInterval(step, 420);

  const onKey = e => {
    if (dead) return;
    if (e.key==='ArrowLeft'  && fits(piece,px-1,py)) px--;
    if (e.key==='ArrowRight' && fits(piece,px+1,py)) px++;
    if (e.key==='ArrowDown'  && fits(piece,px,py+1)) py++;
    if (e.key==='ArrowUp')   { const r=rotate(piece); if(fits(r,px,py)) piece=r; }
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(e.key)) {
      draw(); e.preventDefault();
    }
  };
  document.addEventListener('keydown', onKey);
  watchModalClose(() => { clearInterval(interval); document.removeEventListener('keydown', onKey); });
}
