import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

interface ShootingStar {
  x: number; y: number; vx: number; vy: number;
  length: number; alpha: number; life: number; maxLife: number;
}

interface Firefly {
  x: number; y: number; size: number;
  color: string;
  vx: number; vy: number;
  alpha: number; alphaSpeed: number; pulseTimer: number;
}

@Component({
  selector: 'app-interactive-background',
  standalone: true,
  templateUrl: './interactive-background.component.html',
  styleUrls: ['./interactive-background.component.scss']
})
export class InteractiveBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() text = 'Scaffiz'; // API compat only – not rendered

  private ctx!: CanvasRenderingContext2D;
  private fireflies: Firefly[] = [];
  private shootingStars: ShootingStar[] = [];
  private nextShootingStarIn = 400;

  // Offscreen canvases – rendered once on init/resize
  private bgCanvas!: HTMLCanvasElement;   // sky gradients + moon + hills
  private milkyWayCanvas!: HTMLCanvasElement;
  private fogCanvas!: HTMLCanvasElement;

  private milkyWayTime = 0;
  private fogTime = 0;
  private animationFrameId?: number;

  private readonly FIREFLY_PALETTE = [
    'rgba(255, 190, 80',
    'rgba(255, 220, 140',
    'rgba(100, 200, 160',
    'rgba(255, 160, 60',
  ];

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.renderBgOffscreen();
    this.renderMilkyWayOffscreen();
    this.renderFogOffscreen();
    this.initFireflies();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
    this.renderBgOffscreen();
    this.renderMilkyWayOffscreen();
    this.renderFogOffscreen();
    this.initFireflies();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ——— Offscreen renders ————————————————————————————————

  private renderBgOffscreen(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.width = w;
    this.bgCanvas.height = h;
    const c = this.bgCanvas.getContext('2d')!;

    // Horizon warm glow
    const horizon = c.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.65);
    horizon.addColorStop(0,   'rgba(160, 65, 10, 0.20)');
    horizon.addColorStop(0.5, 'rgba(100, 35,  5, 0.07)');
    horizon.addColorStop(1,   'rgba(0, 0, 0, 0)');
    c.fillStyle = horizon;
    c.fillRect(0, 0, w, h);

    // Moon – positioned upper-center-right
    const mx = w * 0.62;
    const my = h * 0.20;
    const mr = Math.min(w, h) * 0.042;

    // Glow rings (large → small, outer → inner)
    [
      { r: mr * 9,   a: 0.018 },
      { r: mr * 5.5, a: 0.035 },
      { r: mr * 3,   a: 0.065 },
      { r: mr * 1.7, a: 0.13  },
    ].forEach(g => {
      const grad = c.createRadialGradient(mx, my, 0, mx, my, g.r);
      grad.addColorStop(0, `rgba(255, 248, 215, ${g.a})`);
      grad.addColorStop(1, 'rgba(255, 248, 215, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(mx, my, g.r, 0, Math.PI * 2);
      c.fill();
    });

    // Moon disk
    c.fillStyle = 'rgba(255, 248, 210, 1)';
    c.beginPath();
    c.arc(mx, my, mr, 0, Math.PI * 2);
    c.fill();

    // Slight shadow crescent for realism
    c.fillStyle = 'rgba(8, 6, 4, 0.18)';
    c.beginPath();
    c.arc(mx + mr * 0.25, my - mr * 0.05, mr * 0.9, 0, Math.PI * 2);
    c.fill();

    // Hills silhouette (warm near-black, back → front)
    this.drawHills(c, w, h);
  }

  private drawHills(c: CanvasRenderingContext2D, w: number, h: number): void {
    const hills = [
      // Back – tallest, centered peak ~42% height, slightly lighter
      {
        path: (c: CanvasRenderingContext2D) => {
          c.moveTo(-0.02 * w, h);
          c.bezierCurveTo(0.08 * w, 0.56 * h,  0.28 * w, 0.41 * h, 0.50 * w, 0.43 * h);
          c.bezierCurveTo(0.72 * w, 0.45 * h,  0.90 * w, 0.55 * h, 1.02 * w, h);
        },
        grad: ['#1c1408', '#0c0a05'] as [string, string],
        topY: 0.41,
      },
      // Mid – right-biased, peak ~52%
      {
        path: (c: CanvasRenderingContext2D) => {
          c.moveTo(0.22 * w, h);
          c.bezierCurveTo(0.42 * w, 0.63 * h, 0.62 * w, 0.51 * h, 0.76 * w, 0.53 * h);
          c.bezierCurveTo(0.90 * w, 0.55 * h, 1.02 * w, 0.64 * h, 1.08 * w, h);
        },
        grad: ['#141008', '#080705'] as [string, string],
        topY: 0.51,
      },
      // Front – left-biased, peak ~60%, darkest
      {
        path: (c: CanvasRenderingContext2D) => {
          c.moveTo(-0.08 * w, h);
          c.bezierCurveTo(0.04 * w, 0.70 * h, 0.16 * w, 0.59 * h, 0.28 * w, 0.61 * h);
          c.bezierCurveTo(0.40 * w, 0.63 * h, 0.52 * w, 0.72 * h, 0.62 * w, h);
        },
        grad: ['#0e0b06', '#050403'] as [string, string],
        topY: 0.59,
      },
    ];

    hills.forEach(hill => {
      c.save();
      c.beginPath();
      hill.path(c);
      c.lineTo(1.1 * w, h);
      c.closePath();
      const g = c.createLinearGradient(0, hill.topY * h, 0, h);
      g.addColorStop(0, hill.grad[0]);
      g.addColorStop(1, hill.grad[1]);
      c.fillStyle = g;
      c.fill();
      c.restore();
    });
  }

  private renderMilkyWayOffscreen(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;
    this.milkyWayCanvas = document.createElement('canvas');
    this.milkyWayCanvas.width  = w;
    this.milkyWayCanvas.height = h;
    const c = this.milkyWayCanvas.getContext('2d')!;

    const bandAngle = Math.atan2(-h * 0.6, w);
    const perpX = Math.sin(bandAngle);
    const perpY = -Math.cos(bandAngle);
    const spread = h * 0.18;

    for (let i = 0; i < 420; i++) {
      const t = Math.random();
      const cx = t * w;
      const cy = h * 0.70 - t * h * 0.55; // upper portion of sky
      const offset = (Math.random() + Math.random() + Math.random() - 1.5) * spread;
      const px = cx + perpX * offset;
      const py = cy + perpY * offset;
      const size = Math.random() * 0.85 + 0.2;
      const alpha = Math.random() * 0.32 + 0.05;
      c.fillStyle = `rgba(255, 248, 220, ${alpha})`;
      c.beginPath();
      c.arc(px, py, size, 0, Math.PI * 2);
      c.fill();
    }
  }

  private renderFogOffscreen(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width  = w;
    this.fogCanvas.height = h;
    const c = this.fogCanvas.getContext('2d')!;

    [{ y: h * 0.66, a: 0.030 }, { y: h * 0.80, a: 0.048 }].forEach(band => {
      const g = c.createLinearGradient(0, band.y - 55, 0, band.y + 55);
      g.addColorStop(0,   'rgba(110, 60, 15, 0)');
      g.addColorStop(0.5, `rgba(110, 60, 15, ${band.a})`);
      g.addColorStop(1,   'rgba(110, 60, 15, 0)');
      c.fillStyle = g;
      c.fillRect(0, band.y - 55, w, 110);
    });
  }

  // ——— Init dynamic elements ————————————————————————————————

  private initFireflies(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;
    this.fireflies = [];
    const count = 55 + Math.floor(Math.random() * 25);
    for (let i = 0; i < count; i++) {
      const color = this.FIREFLY_PALETTE[Math.floor(Math.random() * this.FIREFLY_PALETTE.length)];
      this.fireflies.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.75, // keep above hills
        size: 0.5 + Math.random() * 1.5,
        color,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random(),
        alphaSpeed: 0.003 + Math.random() * 0.007,
        pulseTimer: Math.random() * Math.PI * 2,
      });
    }
  }

  // ——— Animation loop ————————————————————————————————

  private animate(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;

    // 1. Base clear
    this.ctx.fillStyle = 'rgba(10, 8, 5, 1)';
    this.ctx.fillRect(0, 0, w, h);

    // 2. Pre-rendered: sky gradients + moon + hills
    this.ctx.drawImage(this.bgCanvas, 0, 0);

    // 3. Milky Way – gentle global twinkle via globalAlpha
    this.milkyWayTime += 0.004;
    this.ctx.save();
    this.ctx.globalAlpha = 0.75 + Math.sin(this.milkyWayTime) * 0.25;
    this.ctx.drawImage(this.milkyWayCanvas, 0, 0);
    this.ctx.restore();

    // 4. Fog/mist
    this.fogTime += 0.003;
    this.ctx.save();
    this.ctx.globalAlpha = 0.45 + (Math.sin(this.fogTime * 0.6) * 0.5 + 0.5) * 0.55;
    this.ctx.drawImage(this.fogCanvas, 0, 0);
    this.ctx.restore();

    // 5. Shooting stars
    this.drawShootingStars();

    // 6. Fireflies
    this.updateFireflies();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private drawShootingStars(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;

    this.nextShootingStarIn--;
    if (this.nextShootingStarIn <= 0) {
      this.nextShootingStarIn = 480 + Math.floor(Math.random() * 420);
      const angle = (-25 - Math.random() * 25) * (Math.PI / 180);
      const speed = 2.5 + Math.random() * 1.5;
      this.shootingStars.push({
        x: Math.random() * w * 0.7,
        y: Math.random() * h * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 70 + Math.random() * 60,
        alpha: 0,
        life: 110 + Math.floor(Math.random() * 40),
        maxLife: 150,
      });
    }

    this.shootingStars = this.shootingStars.filter(s => s.life > 0);
    this.shootingStars.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.life--;
      const p = 1 - s.life / s.maxLife;
      s.alpha = p < 0.15 ? (p / 0.15) * 0.7 : p > 0.8 ? ((1 - p) / 0.2) * 0.7 : 0.7;

      const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const tx = s.x - (s.vx / spd) * s.length;
      const ty = s.y - (s.vy / spd) * s.length;
      const grad = this.ctx.createLinearGradient(tx, ty, s.x, s.y);
      grad.addColorStop(0, 'rgba(255, 245, 210, 0)');
      grad.addColorStop(1, `rgba(255, 245, 210, ${s.alpha})`);
      this.ctx.save();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 1.5;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(tx, ty);
      this.ctx.lineTo(s.x, s.y);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  private updateFireflies(): void {
    const { width: w, height: h } = this.canvasRef.nativeElement;

    this.fireflies.forEach(f => {
      f.x += f.vx; f.y += f.vy;
      if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
      if (f.y < 0) f.y = h * 0.75; if (f.y > h * 0.75) f.y = 0;
      f.pulseTimer += f.alphaSpeed;
      f.alpha = 0.1 + (Math.sin(f.pulseTimer) * 0.5 + 0.5) * 0.7;
    });

    // Glow pass – additive blending, no gradient objects per particle
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    this.fireflies.forEach(f => {
      this.ctx.globalAlpha = f.alpha * 0.15;
      this.ctx.fillStyle = `${f.color}, 1)`;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();

    // Core dots
    this.fireflies.forEach(f => {
      this.ctx.fillStyle = `${f.color}, ${f.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}

