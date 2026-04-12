import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

interface DiskParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  bright: number;
}

interface ProjectedParticle {
  x: number;
  y: number;
  sz: number;
  bright: number;
  inner: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  @ViewChild('blackhole', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: DiskParticle[] = [];
  private animationId?: number;
  private time = 0;
  private glowCanvas!: HTMLCanvasElement;
  private canvasSize = 500;

  private scale = 1;
  private coreR = 48;
  private diskIn = 64;
  private diskOut = 185;

  // 78° from face-on → thin ellipse
  private readonly COS_T = Math.cos(78 * Math.PI / 180);
  private readonly SIN_T = Math.sin(78 * Math.PI / 180);
  private readonly N_DISK = 320;
  private readonly LENS = 1.35;

  ngOnInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.onResize();
    this.tick();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  @HostListener('window:resize')
  onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;
    const size = Math.min(parent.clientWidth - 32, window.innerHeight * 0.78, 620);
    canvas.width = size;
    canvas.height = size;
    this.canvasSize = size;
    this.scale = size / 500;
    this.coreR = 48 * this.scale;
    this.diskIn = 64 * this.scale;
    this.diskOut = 185 * this.scale;
    this.renderGlow();
    this.spawnDisk();
  }

  // ——— Offscreen: ambient glow ———

  private renderGlow(): void {
    const s = this.canvasSize;
    this.glowCanvas = document.createElement('canvas');
    this.glowCanvas.width = s;
    this.glowCanvas.height = s;
    const c = this.glowCanvas.getContext('2d')!;
    const cx = s / 2, cy = s / 2;

    [
      { r: this.coreR * 5.5, rgb: '50, 22, 5',    a: 0.06 },
      { r: this.coreR * 4,   rgb: '80, 35, 8',    a: 0.10 },
      { r: this.coreR * 2.8, rgb: '120, 50, 10',  a: 0.16 },
      { r: this.coreR * 2,   rgb: '170, 75, 12',  a: 0.18 },
      { r: this.coreR * 1.4, rgb: '210, 130, 40', a: 0.14 },
    ].forEach(g => {
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, g.r);
      grad.addColorStop(0, `rgba(${g.rgb}, ${g.a})`);
      grad.addColorStop(1, `rgba(${g.rgb}, 0)`);
      c.fillStyle = grad;
      c.beginPath();
      c.arc(cx, cy, g.r, 0, Math.PI * 2);
      c.fill();
    });
  }

  // ——— Particles ———

  private spawnDisk(): void {
    this.particles = [];
    for (let i = 0; i < this.N_DISK; i++) {
      const t = Math.random();
      const radius = this.diskIn + t * (this.diskOut - this.diskIn);
      const inner = 1 - t;
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        radius,
        speed: 0.0015 + 0.006 * inner, // Kepler: inner = faster
        size: (0.4 + Math.random() * 1.1 + inner * 0.7) * this.scale,
        bright: 0.2 + inner * 0.8,
      });
    }
  }

  private particleColor(inner: number, alpha: number): string {
    if (inner > 0.75) {
      // Inner hot zone: near-white with warm amber tint
      return `rgba(${240 + inner * 15}, ${225 + inner * 25}, ${180 + inner * 30}, ${alpha})`;
    } else if (inner > 0.4) {
      // Mid zone: bright amber/gold
      return `rgba(${200 + inner * 55}, ${130 + inner * 60}, ${40 + inner * 30}, ${alpha})`;
    }
    // Outer zone: deep warm brown
    return `rgba(${120 + inner * 60}, ${50 + inner * 35}, ${8 + inner * 20}, ${alpha})`;
  }

  // ——— Main loop ———

  private tick = (): void => {
    this.time++;
    const s = this.canvasSize;
    const cx = s / 2, cy = s / 2;

    // Transparent clear → site background shows through
    this.ctx.clearRect(0, 0, s, s);

    // 1. Ambient glow
    this.ctx.drawImage(this.glowCanvas, 0, 0);

    // 2. Partition particles by z-depth
    const back: ProjectedParticle[] = [];
    const front: ProjectedParticle[] = [];

    for (const p of this.particles) {
      p.angle += p.speed;
      const cosA = Math.cos(p.angle);
      const sinA = Math.sin(p.angle);
      const zDepth = p.radius * sinA * this.SIN_T;
      const inner = 1 - (p.radius - this.diskIn) / (this.diskOut - this.diskIn);

      // Doppler beaming: left side slightly brighter
      const doppler = 1 + 0.2 * (-cosA);

      const pt: ProjectedParticle = {
        x: cx + p.radius * cosA,
        y: cy - p.radius * sinA * this.COS_T,
        sz: p.size,
        bright: p.bright * doppler,
        inner,
      };

      if (zDepth > 0) back.push(pt);
      else front.push(pt);
    }

    // 3. Back disk (behind hole, dimmer)
    this.drawParticles(back, 0.3);

    // 4. Core void
    this.drawCore(cx, cy);

    // 5. Lensed ring (photon sphere bending over the top)
    this.drawLensedRing(cx, cy);

    // 6. Front disk (full brightness)
    this.drawParticles(front, 1.0);

    // 7. Inner edge glow
    this.drawInnerEdge(cx, cy);

    this.animationId = requestAnimationFrame(this.tick);
  };

  // ——— Draw helpers ———

  private drawParticles(pts: ProjectedParticle[], alphaScale: number): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    for (const p of pts) {
      this.ctx.fillStyle = this.particleColor(p.inner, p.bright * alphaScale * 0.75);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawCore(cx: number, cy: number): void {
    // Soft-edge gradient → covers center glow + back particles
    const fadeR = this.coreR * 1.15;
    const grad = this.ctx.createRadialGradient(cx, cy, this.coreR * 0.65, cx, cy, fadeR);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.92)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, fadeR, 0, Math.PI * 2);
    this.ctx.fill();

    // Pulsing event horizon glow (subtle warm amber ring)
    const pulse = 0.08 + Math.abs(Math.sin(this.time * 0.008)) * 0.06;
    const edge = this.ctx.createRadialGradient(cx, cy, this.coreR * 0.85, cx, cy, this.coreR * 1.2);
    edge.addColorStop(0, 'rgba(190, 90, 15, 0)');
    edge.addColorStop(0.5, `rgba(190, 90, 15, ${pulse})`);
    edge.addColorStop(1, 'rgba(190, 90, 15, 0)');
    this.ctx.fillStyle = edge;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, this.coreR * 1.2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawLensedRing(cx: number, cy: number): void {
    // Photon sphere: light from back of disk bent OVER the top of the hole
    // Ring radius hugs the core tightly
    const r = this.coreR * 1.12;
    const steps = 200;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const x = cx + r * cosA;

      // Flat ellipse position (normal disk projection)
      const yFlat = cy - r * sinA * this.COS_T;
      // Circular arc position (hugs core when going over the top)
      const yCircle = cy - r * sinA;

      // Blend: at sides (sinA≈0) → flat ellipse, at back (sinA=1) → circular arc
      const blend = sinA > 0 ? Math.pow(sinA, 0.1) : 0;
      const y = yFlat * (1 - blend) + yCircle * blend;

      // Intensity peaks at directly-behind (angle ~π/2)
      const base = 0.12;
      const lens = blend * 0.55;
      const shimmer = 0.88 + Math.sin(this.time * 0.015 + angle * 5) * 0.12;
      const alpha = (base + lens) * shimmer;

      if (alpha > 0.02) {
        // Bright core dot
        this.ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1.1 * this.scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Wider soft glow
        this.ctx.fillStyle = `rgba(210, 120, 30, ${alpha * 0.25})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3.2 * this.scale, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  private drawInnerEdge(cx: number, cy: number): void {
    // Brightest ring at the ISCO (innermost stable orbit)
    const r = this.diskIn;
    const steps = 220;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const sinA = Math.sin(angle);
      const zDepth = r * sinA * this.SIN_T;
      const vis = zDepth > 0 ? 0.1 : 1.0; // dim back portion

      const x = cx + r * Math.cos(angle);
      const y = cy - r * sinA * this.COS_T;

      const shimmer = 0.7 + Math.sin(this.time * 0.022 + angle * 7) * 0.3;
      const alpha = 0.45 * vis * shimmer;

      this.ctx.fillStyle = `rgba(255, 248, 215, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.85 * this.scale, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
