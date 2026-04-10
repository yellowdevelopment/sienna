class ParticleBg {
  constructor(canvas, particleCount = 60) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.rafId = null;
    this.running = false;
    this.lastTimestamp = 0;

    // Aggressive configuration for Chromebooks
    this.config = {
      particleCount,
      connectionDistance: 140,
      connectionDistanceSq: 140 * 140,
      baseSpeed: 0.45,
      maxConnectionsPerFrame: 15,        // only draw up to 15 lines
      size: 2.5                           // fixed size – squares are faster
    };

    // Pre‑calculate alpha values for connection lines (0‑255 steps)
    this.alphaLUT = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.alphaLUT[i] = (1 - i / 255) * 0.22;  // lower max alpha = less overdraw
    }

    this._resize = this._resize.bind(this);
    this._mouseMove = this._mouseMove.bind(this);
    this._mouseLeave = this._mouseLeave.bind(this);
    this._tick = this._tick.bind(this);

    window.addEventListener('resize', this._resize, { passive: true });
    document.addEventListener('mousemove', this._mouseMove, { passive: true });
    document.addEventListener('mouseleave', this._mouseLeave);

    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      will-change: transform;
      display: block;
      z-index: 0;
    `;

    this._resize();
    this._initParticles();
  }

  _resize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    if (this.canvas.width === newWidth && this.canvas.height === newHeight) return;

    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // Clamp mouse out of sight
    this.mouse.x = -1000;
    this.mouse.y = -1000;
    this.mouse.active = false;
  }

  _mouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.active = true;
  }

  _mouseLeave() {
    this.mouse.active = false;
  }

  _initParticles() {
    const { width, height } = this.canvas;
    const { particleCount, baseSpeed, size } = this.config;
    this.particles = new Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const opacity = Math.random() * 0.4 + 0.35;   // 0.35–0.75
      this.particles[i] = {
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: Math.random() * 0.7 + baseSpeed,
        fillStyle: `rgba(255,255,255,${opacity})`,
        // Pre‑compute half size for rectangle drawing
        hSize: size * 0.5
      };
    }
  }

  _tick(now) {
    if (!this.running) return;

    // Optional: simple frame‑rate capping if things get really bad
    // (comment out if not needed – rAF already syncs to display)
    // if (now - this.lastTimestamp < 16) {
    //   this.rafId = requestAnimationFrame(this._tick);
    //   return;
    // }
    // this.lastTimestamp = now;

    const { ctx, canvas, particles, mouse, config, alphaLUT } = this;
    const { width, height } = canvas;
    const connDistSq = config.connectionDistanceSq;
    const connDist = config.connectionDistance;
    const maxLines = config.maxConnectionsPerFrame;

    // Clear with a single fillRect – sometimes faster than clearRect on some GPUs
    ctx.clearRect(0, 0, width, height);

    // Draw all particles as squares (no path, no arc)
    ctx.fillStyle = '';  // will be set per particle
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.y += p.speedY;
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      ctx.fillStyle = p.fillStyle;
      ctx.fillRect(p.x - p.hSize, p.y - p.hSize, config.size, config.size);
    }

    // Connection lines – only if mouse is active
    if (mouse.active) {
      ctx.lineWidth = 1.0;

      // Collect distances so we can sort and only draw closest lines
      const distances = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < connDistSq) {
          distances.push({ idx: i, distSq });
        }
      }

      // Sort by distance (closest first) and limit number of lines
      distances.sort((a, b) => a.distSq - b.distSq);
      const linesToDraw = Math.min(distances.length, maxLines);

      for (let i = 0; i < linesToDraw; i++) {
        const item = distances[i];
        const p = particles[item.idx];
        const dist = Math.sqrt(item.distSq);
        const alphaIndex = Math.floor((dist / connDist) * 255);
        const alpha = alphaLUT[alphaIndex];

        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    this.rafId = requestAnimationFrame(this._tick);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.canvas.style.display = 'block';
    this.rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.display = 'none';
  }

  isRunning() {
    return this.running;
  }
}

// Instantiate with 60 particles – smooth on almost any Chromebook
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  window.particleBg = new ParticleBg(canvas, 60);
  window.particleBg.start();
}