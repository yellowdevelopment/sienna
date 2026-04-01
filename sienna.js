class ParticleBg {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    this.rafId = null;
    this.running = false;

    this._resize = this._resize.bind(this);
    this._mouseMove = this._mouseMove.bind(this);
    this._tick = this._tick.bind(this);

    window.addEventListener('resize', this._resize);
    document.addEventListener('mousemove', this._mouseMove);
    this._resize();
    this._init(125);
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _mouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  _init(count) {
    const { width, height } = this.canvas;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.8 + 0.3,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }

  _tick() {
    if (!this.running) return;
    const { ctx, canvas, particles, mouse } = this;
    const { width, height } = canvas;
    const connectionDistance = 200;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.y += p.speedY;
      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < connectionDistance) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / connectionDistance) * 0.3})`;
        ctx.lineWidth = 1;
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
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.display = 'none';
  }

  isRunning() {
    return this.running;
  }
}

const canvas = document.getElementById('particleCanvas');
if (canvas) {
  window.particleBg = new ParticleBg(canvas);
  window.particleBg.start();
}
