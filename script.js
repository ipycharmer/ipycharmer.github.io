// force scroll to top on refresh so the custom scroll engine
// doesn't fight the browser's restored scroll position.
if('scrollRestoration' in history){
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0));
  
  // smooth scroll engine - spring physics
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const wrapper = document.getElementById('smoothWrapper');
  let targetScroll = 0;
  let currentScroll = 0;
  let scrollVelocity = 0;
  let maxScroll = 0;
  let scrollActive = !isTouch;
  
  const stiffness = 0.06;
  const damping = 0.82;
  
  function updateMaxScroll(){
    maxScroll = Math.max(0, wrapper.scrollHeight - window.innerHeight);
  }
  
  if(scrollActive){
    document.body.style.overflow = 'hidden';
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetScroll += e.deltaY;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    }, { passive: false });
  
    window.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowDown' || e.key === 'PageDown'){
        targetScroll = Math.min(targetScroll + window.innerHeight * 0.8, maxScroll);
      } else if(e.key === 'ArrowUp' || e.key === 'PageUp'){
        targetScroll = Math.max(targetScroll - window.innerHeight * 0.8, 0);
      } else if(e.key === 'Home'){
        targetScroll = 0;
      } else if(e.key === 'End'){
        targetScroll = maxScroll;
      }
    });
  
    function smoothLoop(){
      const force = (targetScroll - currentScroll) * stiffness;
      scrollVelocity += force;
      scrollVelocity *= damping;
      currentScroll += scrollVelocity;
  
      if(currentScroll < 0){
        currentScroll = 0;
        scrollVelocity *= -0.4;
      }
      if(currentScroll > maxScroll){
        currentScroll = maxScroll;
        scrollVelocity *= -0.4;
      }
  
      wrapper.style.transform = 'translateY(' + (-currentScroll) + 'px)';
      requestAnimationFrame(smoothLoop);
    }
    updateMaxScroll();
    smoothLoop();
    window.addEventListener('resize', updateMaxScroll);
  } else {
    wrapper.style.transform = 'none';
  }
  
  // venom cursor
  const venomCursor = document.getElementById('venomCursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  
  if(!isTouch){
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
  
    function animateVenom(){
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      venomCursor.style.left = cursorX + 'px';
      venomCursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateVenom);
    }
    animateVenom();
  } else {
    venomCursor.style.display = 'block';
    venomCursor.style.width = '180px';
    venomCursor.style.height = '180px';
  
    // true venom: it doesn't chase your finger — it lurks at the screen
    // edges and peeks in from the left or right, occasionally slinking
    // across, the way a symbiote would rather than a touch-tracking dot.
    // .venom-cursor is position:fixed, so it stays glued to the viewport
    // and rides along as the page scrolls.
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.4;
  
    function pickNewWanderTarget(){
      const roll = Math.random();
      const peekDepth = window.innerWidth * (0.08 + Math.random() * 0.1);
      const marginY = window.innerHeight * 0.12;
      const y = marginY + Math.random() * (window.innerHeight - marginY * 2);
  
      if(roll < 0.42){
        // peek in from the left edge (partly off-screen)
        targetX = -50 + peekDepth;
        targetY = y;
      } else if(roll < 0.84){
        // peek in from the right edge (partly off-screen)
        targetX = window.innerWidth + 50 - peekDepth;
        targetY = y;
      } else {
        // rare slink across the middle of the screen
        targetX = window.innerWidth * 0.25 + Math.random() * window.innerWidth * 0.5;
        targetY = y;
      }
    }
    pickNewWanderTarget();
    setInterval(pickNewWanderTarget, 2800 + Math.random() * 2400);
  
    function animateMobileVenom(){
      const t = Date.now() * 0.0006;
      const driftX = Math.sin(t) * 14;
      const driftY = Math.cos(t * 0.8) * 20;
      cursorX += (targetX + driftX - cursorX) * 0.02;
      cursorY += (targetY + driftY - cursorY) * 0.02;
      venomCursor.style.left = cursorX + 'px';
      venomCursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateMobileVenom);
    }
    animateMobileVenom();
  }
  
  // hero reveal
  window.addEventListener('load', () => {
    document.getElementById('heroHeadline').classList.add('revealed');
    setTimeout(() => document.getElementById('heroName').classList.add('visible'), 600);
    setTimeout(() => document.getElementById('heroActions').classList.add('visible'), 800);
  });
  
  // hero parallax
  const heroScene = document.getElementById('heroScene');
  if(!isTouch && heroScene){
    document.getElementById('hero').addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      heroScene.style.transform = 'rotateY(' + x + 'deg) rotateX(' + (-y) + 'deg)';
    });
  }
  
  // scroll reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  
  // side nav active state
  const sections = document.querySelectorAll('section[id]');
  const navDots = document.querySelectorAll('.nav-dot');
  
  function updateNav(){
    const scrollPos = scrollActive ? currentScroll : window.scrollY;
    let current = '';
    sections.forEach(s => {
      if(scrollPos >= s.offsetTop - window.innerHeight * 0.4){
        current = s.id;
      }
    });
    navDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === current);
    });
  }
  
  if(scrollActive){
    function navLoop(){
      updateNav();
      requestAnimationFrame(navLoop);
    }
    navLoop();
  } else {
    window.addEventListener('scroll', updateNav, { passive: true });
  }
  
  navDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(dot.dataset.section);
      if(!target) return;
      if(scrollActive){
        targetScroll = target.offsetTop;
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // magnetic buttons
  if(!isTouch){
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.25) + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }
  
  // orbital neural stack
  const orbitalContainer = document.getElementById('orbitalContainer');
  const orbitalSvg = document.getElementById('orbitalSvg');
  const orbitalNodes = [
    'Python', 'PyTorch', 'YOLOv5', 'FastAPI', 'Docker',
    'OpenCV', 'Kubernetes', 'SQL', 'XGBoost', 'Pandas',
    'NumPy', 'Scikit-learn', 'Streamlit', 'Git', 'Linux'
  ];
  
  function createOrbital(){
    const cx = 300, cy = 300;
    const radius = isTouch ? 190 : 240;
    const count = orbitalNodes.length;
  
    orbitalNodes.forEach((name, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const nx = cx + Math.cos(angle) * radius;
      const ny = cy + Math.sin(angle) * radius;
  
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', nx);
      line.setAttribute('y2', ny);
      line.setAttribute('class', 'orbital-line');
      line.setAttribute('data-index', i);
      orbitalSvg.appendChild(line);
  
      const node = document.createElement('div');
      node.className = 'orbital-node';
      node.textContent = name;
      // position as a % of the 600x600 viewBox space (matches how the SVG
      // itself scales) instead of raw px, so nodes stay aligned with the
      // lines and inside the container no matter how small it renders
      node.style.left = (nx / 600 * 100) + '%';
      node.style.top = (ny / 600 * 100) + '%';
      node.style.transform = 'translate(-50%, -50%)';
  
      node.addEventListener('mouseenter', () => {
        line.classList.add('lit');
        node.style.background = '#0a0a0a';
        node.style.color = '#fff';
        node.style.transform = 'translate(-50%, -50%) scale(1.15)';
      });
      node.addEventListener('mouseleave', () => {
        line.classList.remove('lit');
        node.style.background = '#fff';
        node.style.color = '#0a0a0a';
        node.style.transform = 'translate(-50%, -50%) scale(1)';
      });
  
      orbitalContainer.appendChild(node);
    });
  }
  createOrbital();
  
  // orbital 3d tilt
  if(!isTouch && orbitalContainer){
    document.getElementById('neural-stack').addEventListener('mousemove', (e) => {
      const rect = orbitalContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      orbitalContainer.style.transform = 'rotateY(' + (x * 15) + 'deg) rotateX(' + (-y * 15) + 'deg)';
    });
    document.getElementById('neural-stack').addEventListener('mouseleave', () => {
      orbitalContainer.style.transform = 'rotateY(0) rotateX(0)';
    });
  }
  
  // traffic chowk - 4-way intersection with realistic signals
  const chowkSignal = document.getElementById('chowkSignal');
  const trafficStatus = document.getElementById('trafficStatus');
  const nsParentLanes = document.querySelectorAll('.chowk-lane-h');
  const ewParentLanes = document.querySelectorAll('.chowk-lane-v');
  
  const chowkLanes = {
    north: { axis: 'top', dir: 1, start: -10, stopLine: 22, exit: 110, road: 'ns', carClass: 'chowk-car-v down' },
    south: { axis: 'top', dir: -1, start: 110, stopLine: 78, exit: -10, road: 'ns', carClass: 'chowk-car-v up' },
    west: { axis: 'left', dir: 1, start: -10, stopLine: 22, exit: 110, road: 'ew', carClass: 'chowk-car-h right' },
    east: { axis: 'left', dir: -1, start: 110, stopLine: 78, exit: -10, road: 'ew', carClass: 'chowk-car-h left' }
  };
  
  let currentPhase = 'NS';
  let phaseTime = 0;
  let trafficRunning = false;
  const queues = { north: [], south: [], west: [], east: [] };
  const spawnClocks = { north: 0, south: 0, west: 0, east: 0 };
  const MIN_PHASE_DURATION = 8000;
  const MAX_PHASE_DURATION = 14000;
  const CAR_SPEED = 0.26;
  const CAR_GAP = 10;
  const MAX_QUEUE = 3;
  const GREEN_DELAY = 3000;
  const STOP_MARGIN = 3;
  const BRAKE_DIST = 8;
  
  function laneCongestion(lane) {
    const scoreEl = document.querySelector('.chowk-tag.' + lane + ' .chowk-score');
    const score = scoreEl ? parseInt(scoreEl.textContent, 10) : 50;
    return isNaN(score) ? 50 : score;
  }
  
  function nextSpawnDelay(lane) {
    const score = laneCongestion(lane);
    const base = 3200 - (score / 100) * 2300;
    return base + (Math.random() * 600 - 300);
  }
  
  function spawnCar(lane) {
    const cfg = chowkLanes[lane];
    const queue = queues[lane];
    if (queue.length >= MAX_QUEUE) return;
  
    const last = queue[queue.length - 1];
    if (last && Math.abs(last.pos - cfg.start) < CAR_GAP * 0.7) return;
  
    const wrap = document.querySelector('.chowk-queue-wrap.' + lane);
    if (!wrap) return;
  
    const el = document.createElement('div');
    el.className = cfg.carClass;
    el.style[cfg.axis] = cfg.start + '%';
    wrap.appendChild(el);
  
    queue.push({ el: el, pos: cfg.start, road: cfg.road, released: false });
  }
  
  function updateLane(lane) {
    const cfg = chowkLanes[lane];
    const queue = queues[lane];
    const isGreen = cfg.road.toUpperCase() === currentPhase;
    const canCross = isGreen && phaseTime > GREEN_DELAY;
  
    queue.forEach((car, i) => {
      const ahead = queue[i - 1];
      const signalOpen = canCross || car.released;
  
      if (cfg.dir === 1) {
        const aheadCap = ahead ? ahead.pos - CAR_GAP : Infinity;
        const sigCap = signalOpen ? Infinity : cfg.stopLine - STOP_MARGIN;
        const cap = Math.min(aheadCap, sigCap);
        const dist = cap - car.pos;
        let speed = CAR_SPEED;
        if (dist < BRAKE_DIST && dist > 0) {
          speed = CAR_SPEED * (dist / BRAKE_DIST);
          if (speed < 0.03) speed = 0;
        }
        car.pos = Math.min(car.pos + speed, cap);
        if (car.pos >= cfg.stopLine && canCross) car.released = true;
      } else {
        const aheadCap = ahead ? ahead.pos + CAR_GAP : -Infinity;
        const sigCap = signalOpen ? -Infinity : cfg.stopLine + STOP_MARGIN;
        const cap = Math.max(aheadCap, sigCap);
        const dist = car.pos - cap;
        let speed = CAR_SPEED;
        if (dist < BRAKE_DIST && dist > 0) {
          speed = CAR_SPEED * (dist / BRAKE_DIST);
          if (speed < 0.03) speed = 0;
        }
        car.pos = Math.max(car.pos - speed, cap);
        if (car.pos <= cfg.stopLine && canCross) car.released = true;
      }
      car.el.style[cfg.axis] = car.pos + '%';
    });
  
    while (queue.length) {
      const front = queue[0];
      const exited = cfg.dir === 1 ? front.pos >= cfg.exit : front.pos <= cfg.exit;
      if (!exited) break;
      front.el.remove();
      queue.shift();
    }
  }
  
  function phaseClear() {
    const lanes = currentPhase === 'NS' ? ['north', 'south'] : ['west', 'east'];
    return lanes.every(lane => queues[lane].every(car => car.released));
  }
  
  function updateUI() {
    if (currentPhase === 'NS') {
      nsParentLanes.forEach(l => l.classList.add('active'));
      ewParentLanes.forEach(l => l.classList.remove('active'));
      chowkSignal.innerHTML = 'NS<br>GREEN';
      trafficStatus.innerHTML = 'Greedy algorithm: <strong>North-South Road</strong> green at 90% combined congestion. East-West Road on red. Collision prevented.';
    } else {
      ewParentLanes.forEach(l => l.classList.add('active'));
      nsParentLanes.forEach(l => l.classList.remove('active'));
      chowkSignal.innerHTML = 'EW<br>GREEN';
      trafficStatus.innerHTML = 'Greedy algorithm: <strong>East-West Road</strong> green at 77% combined congestion. North-South Road on red. Collision prevented.';
    }
  }
  
  function switchPhase() {
    currentPhase = currentPhase === 'NS' ? 'EW' : 'NS';
    phaseTime = 0;
    updateUI();
  }
  
  function trafficLoop() {
    if (!trafficRunning) return;
  
    Object.keys(chowkLanes).forEach(lane => updateLane(lane));
  
    Object.keys(chowkLanes).forEach(lane => {
      spawnClocks[lane] -= 16;
      if (spawnClocks[lane] <= 0) {
        spawnCar(lane);
        spawnClocks[lane] = nextSpawnDelay(lane);
      }
    });
  
    phaseTime += 16;
    if (phaseTime >= MIN_PHASE_DURATION && (phaseClear() || phaseTime >= MAX_PHASE_DURATION)) {
      switchPhase();
    }
  
    requestAnimationFrame(trafficLoop);
  }
  
  function startTraffic() {
    if (trafficRunning) return;
    trafficRunning = true;
    currentPhase = 'NS';
    phaseTime = 0;
    Object.keys(chowkLanes).forEach(lane => {
      queues[lane] = [];
      spawnClocks[lane] = nextSpawnDelay(lane) * Math.random();
    });
    updateUI();
    trafficLoop();
  }
  
  const trafficObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startTraffic();
        trafficObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  const trafficSection = document.getElementById('traffic');
  if (trafficSection) trafficObserver.observe(trafficSection);
  
  // fraud detection grid
  const fraudGrid = document.getElementById('fraudGrid');
  if(fraudGrid){
    const totalDots = 280;
    const fraudIndices = new Set();
    while(fraudIndices.size < 12){
      fraudIndices.add(Math.floor(Math.random() * totalDots));
    }
  
    for(let i = 0; i < totalDots; i++){
      const dot = document.createElement('div');
      dot.className = 'fraud-dot' + (fraudIndices.has(i) ? ' fraudulent' : '');
      fraudGrid.appendChild(dot);
    }
  }
  
  const fraudStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.querySelectorAll('.fraud-stat').forEach((stat, i) => {
          setTimeout(() => stat.classList.add('visible'), i * 200);
        });
        fraudStatsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  const fraudSection = document.getElementById('fraud');
  if(fraudSection) fraudStatsObserver.observe(fraudSection);
  
  // deep learning canvas
  const canvas = document.getElementById('dlCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const clearBtn = document.getElementById('clearCanvas');
  const predictBtn = document.getElementById('predictBtn');
  const dlPredValue = document.getElementById('dlPredValue');
  const dlConfidence = document.getElementById('dlConfidence');
  
  let isDrawing = false;
  let digitModel = null;
  
  function initCanvas(){
    if(!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0a0a0a';
  }
  
  function getPos(e){
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }
  
  if(canvas){
    initCanvas();
  
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    canvas.addEventListener('mousemove', (e) => { if(!isDrawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });
  
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if(!isDrawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }, { passive: false });
    canvas.addEventListener('touchend', () => { isDrawing = false; });
  }
  
  // pretrained MNIST CNN (Keras conv/conv/pool/dense, ~99% test accuracy), converted to tfjs
  function loadDigitModel(){
    if(!digitModel) digitModel = tf.loadLayersModel('models/mnist/model.json');
    return digitModel;
  }
  
  function preprocessDigit(){
    const raw = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  
    for(let y = 0; y < canvas.height; y++){
      for(let x = 0; x < canvas.width; x++){
        const brightness = raw[(y * canvas.width + x) * 4];
        if(brightness < 250){
          if(x < minX) minX = x;
          if(x > maxX) maxX = x;
          if(y < minY) minY = y;
          if(y > maxY) maxY = y;
        }
      }
    }
    if(maxX < minX) return null;
  
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const side = Math.max(maxX - minX, maxY - minY) * 1.6;
    const half = side / 2;
  
    const square = document.createElement('canvas');
    square.width = side;
    square.height = side;
    const sctx = square.getContext('2d');
    sctx.fillStyle = '#fff';
    sctx.fillRect(0, 0, side, side);
    sctx.drawImage(canvas, cx - half, cy - half, side, side, 0, 0, side, side);
  
    const small = document.createElement('canvas');
    small.width = 28;
    small.height = 28;
    const lctx = small.getContext('2d');
    lctx.fillStyle = '#fff';
    lctx.fillRect(0, 0, 28, 28);
    lctx.drawImage(square, 0, 0, 28, 28);
  
    const pixels = lctx.getImageData(0, 0, 28, 28).data;
    const input = new Float32Array(28 * 28);
    for(let i = 0; i < 28 * 28; i++){
      input[i] = 1 - pixels[i * 4] / 255;
    }
    return input;
  }
  
  async function predictDigit(){
    const input = preprocessDigit();
    if(!input){
      dlPredValue.textContent = '?';
      dlConfidence.textContent = 'draw a digit first';
      return;
    }
  
    dlPredValue.textContent = '···';
    dlConfidence.textContent = 'running inference';
  
    const model = await loadDigitModel();
    const tensor = tf.tensor4d(input, [1, 28, 28, 1]);
    const output = model.predict(tensor);
    const probs = await output.data();
    tensor.dispose();
    output.dispose();
  
    let best = 0;
    for(let i = 1; i < probs.length; i++){
      if(probs[i] > probs[best]) best = i;
    }
  
    dlPredValue.textContent = best;
    dlConfidence.textContent = Math.round(probs[best] * 100) + '% confidence';
  }
  
  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      initCanvas();
      dlPredValue.textContent = '—';
      dlConfidence.textContent = '';
    });
  }
  
  if(predictBtn){
    predictBtn.addEventListener('click', () => {
      predictDigit().catch(() => {
        dlPredValue.textContent = '?';
        dlConfidence.textContent = 'model failed to load';
      });
    });
  }
  
  const dlSection = document.getElementById('deep-learning');
  if(dlSection){
    const dlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          loadDigitModel();
          dlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    dlObserver.observe(dlSection);
  }
  
  // terminal typing effect
  const terminalBody = document.getElementById('terminalBody');
  
  const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const lines = terminalBody.querySelectorAll('.terminal-line');
        lines.forEach((line, i) => {
          setTimeout(() => line.classList.add('visible'), i * 400);
        });
        terminalObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  if(terminalBody) terminalObserver.observe(terminalBody);
  
  // anchor smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if(!target) return;
      if(scrollActive){
        targetScroll = target.offsetTop;
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });