import { Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  friction: number;
  ease: number;
  angle: number;
  va: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Firefly {
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
  pulseTimer: number;
}

interface MilkyWayParticle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleTimer: number;
}

@Component({
  selector: 'app-interactive-background',
  standalone: true,
  templateUrl: './interactive-background.component.html',
  styleUrls: ['./interactive-background.component.scss']
})
export class InteractiveBackgroundComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() text: string = 'Scaffiz';

  private router = inject(Router);
  private routerSubscription?: Subscription;
  private showText = true;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private fireflies: Firefly[] = [];
  private milkyWayParticles: MilkyWayParticle[] = [];
  private shootingStars: ShootingStar[] = [];
  private nextShootingStarIn = 400;
  private fogTime = 0;
  private animationFrameId?: number;
  private mouse = {
    x: -1000,
    y: -1000,
    radius: 50
  };

  // Desert night palette: amber embers, warm gold, faint teal accent
  private readonly FIREFLY_PALETTE = [
    { color: 'rgba(255, 190, 80', glow: 'rgba(255, 150, 40' },
    { color: 'rgba(255, 220, 140', glow: 'rgba(255, 200, 100' },
    { color: 'rgba(100, 200, 160', glow: 'rgba(70, 170, 130' },
    { color: 'rgba(255, 160, 60', glow: 'rgba(220, 120, 30' },
  ];

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects);
    });

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.resizeCanvas();
    this.initMilkyWay();
    this.initFireflies();
    this.initParticles();
    this.animate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] && !changes['text'].firstChange) {
      this.initParticles();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute(url: string): void {
    this.showText = url === '/' || url === '/home' || url === '';
    if (this.ctx) {
      this.initParticles();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
    this.initMilkyWay();
    this.initFireflies();
    this.initParticles();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initMilkyWay(): void {
    const canvas = this.canvasRef.nativeElement;
    this.milkyWayParticles = [];
    const count = 420;

    // Band runs from bottom-left to upper-right
    const bandAngle = Math.atan2(-canvas.height * 0.6, canvas.width);
    const perpX = Math.sin(bandAngle);
    const perpY = -Math.cos(bandAngle);
    const spread = canvas.height * 0.2;

    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const centerX = t * canvas.width;
      const centerY = canvas.height * 0.75 - t * canvas.height * 0.6;

      // Gaussian-ish distribution across band width
      const offset = (Math.random() + Math.random() + Math.random() - 1.5) * spread;

      this.milkyWayParticles.push({
        x: centerX + perpX * offset,
        y: centerY + perpY * offset,
        size: Math.random() * 0.9 + 0.2,
        baseAlpha: Math.random() * 0.35 + 0.05,
        twinkleSpeed: 0.001 + Math.random() * 0.004,
        twinkleTimer: Math.random() * Math.PI * 2,
      });
    }
  }

  private initFireflies(): void {
    const canvas = this.canvasRef.nativeElement;
    this.fireflies = [];
    const count = 80 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const palette = this.FIREFLY_PALETTE[Math.floor(Math.random() * this.FIREFLY_PALETTE.length)];
      this.fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 1.5,
        color: palette.color,
        glowColor: palette.glow,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random(),
        alphaSpeed: 0.003 + Math.random() * 0.007,
        pulseTimer: Math.random() * Math.PI * 2,
      });
    }
  }

  private initParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.showText) {
      this.particles = [];
      return;
    }

    this.ctx.fillStyle = 'white';
    const fontSize = Math.min(canvas.width / 6, 150);
    this.ctx.font = `bold ${fontSize}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);

    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    this.particles = [];

    const gap = 6;
    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha > 128) {
          this.particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            originX: x,
            originY: y,
            color: 'rgba(255, 215, 90, 0.85)', // warm star-gold
            size: 2,
            vx: 0,
            vy: 0,
            friction: 0.7,
            ease: 0.04,
            angle: Math.random() * Math.PI * 2,
            va: Math.random() * 0.02 + 0.01
          });
        }
      }
    }
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;

    // Dark warm charcoal – desert night sky
    this.ctx.fillStyle = 'rgba(10, 8, 5, 1)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desert horizon glow – warm amber-orange, stronger than Option A
    const horizonGlow = this.ctx.createRadialGradient(
      canvas.width / 2, canvas.height, 0,
      canvas.width / 2, canvas.height, canvas.height * 0.65
    );
    horizonGlow.addColorStop(0, 'rgba(160, 65, 10, 0.22)');
    horizonGlow.addColorStop(0.5, 'rgba(100, 35, 5, 0.08)');
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = horizonGlow;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moonlight – same upper-right silver glow
    const moonGlow = this.ctx.createRadialGradient(
      canvas.width * 0.85, canvas.height * 0.07, 0,
      canvas.width * 0.85, canvas.height * 0.07, canvas.height * 0.45
    );
    moonGlow.addColorStop(0, 'rgba(220, 230, 255, 0.08)');
    moonGlow.addColorStop(0.4, 'rgba(190, 210, 250, 0.03)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = moonGlow;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawMilkyWay();
    this.drawFog();
    this.drawShootingStars();
    this.updateFireflies();
    this.updateTextParticles();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private drawMilkyWay(): void {
    this.milkyWayParticles.forEach(p => {
      p.twinkleTimer += p.twinkleSpeed;
      const alpha = p.baseAlpha * (0.6 + Math.sin(p.twinkleTimer) * 0.4);

      this.ctx.fillStyle = `rgba(255, 248, 220, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawFog(): void {
    const canvas = this.canvasRef.nativeElement;
    this.fogTime += 0.003;

    // Desert dust bands – warm sand tones
    const bands = [
      { y: canvas.height * 0.72, alpha: 0.028 + Math.sin(this.fogTime * 0.7) * 0.01 },
      { y: canvas.height * 0.86, alpha: 0.042 + Math.sin(this.fogTime * 0.5 + 1.2) * 0.015 },
    ];

    bands.forEach(band => {
      const grad = this.ctx.createLinearGradient(0, band.y - 55, 0, band.y + 55);
      grad.addColorStop(0, 'rgba(110, 60, 15, 0)');
      grad.addColorStop(0.5, `rgba(110, 60, 15, ${band.alpha})`);
      grad.addColorStop(1, 'rgba(110, 60, 15, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, band.y - 55, canvas.width, 110);
    });
  }

  private drawShootingStars(): void {
    const canvas = this.canvasRef.nativeElement;

    this.nextShootingStarIn--;
    if (this.nextShootingStarIn <= 0) {
      this.nextShootingStarIn = 480 + Math.floor(Math.random() * 420);
      const angle = (-30 - Math.random() * 20) * (Math.PI / 180);
      const speed = 2.5 + Math.random() * 1.5;
      this.shootingStars.push({
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 70 + Math.random() * 60,
        alpha: 0,
        life: 110 + Math.floor(Math.random() * 40),
        maxLife: 110 + Math.floor(Math.random() * 40),
      });
    }

    this.shootingStars = this.shootingStars.filter(star => star.life > 0);

    this.shootingStars.forEach(star => {
      star.x += star.vx;
      star.y += star.vy;
      star.life--;

      const progress = 1 - star.life / star.maxLife;
      if (progress < 0.15) {
        star.alpha = (progress / 0.15) * 0.7;
      } else if (progress > 0.8) {
        star.alpha = ((1 - progress) / 0.2) * 0.7;
      } else {
        star.alpha = 0.7;
      }

      const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
      const tailX = star.x - (star.vx / speed) * star.length;
      const tailY = star.y - (star.vy / speed) * star.length;

      const grad = this.ctx.createLinearGradient(tailX, tailY, star.x, star.y);
      grad.addColorStop(0, 'rgba(255, 240, 200, 0)');
      grad.addColorStop(1, `rgba(255, 240, 200, ${star.alpha})`);

      this.ctx.save();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 1.5;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(star.x, star.y);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  private updateFireflies(): void {
    const canvas = this.canvasRef.nativeElement;
    this.fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;

      if (f.x < 0) f.x = canvas.width;
      if (f.x > canvas.width) f.x = 0;
      if (f.y < 0) f.y = canvas.height;
      if (f.y > canvas.height) f.y = 0;

      f.pulseTimer += f.alphaSpeed;
      f.alpha = 0.1 + (Math.sin(f.pulseTimer) * 0.5 + 0.5) * 0.7;

      const glowRadius = f.size * 5;
      const glowGrad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowRadius);
      glowGrad.addColorStop(0, `${f.glowColor}, ${f.alpha * 0.45})`);
      glowGrad.addColorStop(1, `${f.glowColor}, 0)`);
      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, glowRadius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `${f.color}, ${f.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private updateTextParticles(): void {
    this.particles.forEach(p => {
      p.angle += p.va;
      const offsetX = Math.cos(p.angle) * 2;
      const offsetY = Math.sin(p.angle) * 2;

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouse.radius) {
        const force = (this.mouse.radius - distance) / this.mouse.radius;
        const forceX = dx / distance;
        const forceY = dy / distance;
        p.vx -= forceX * force * 10;
        p.vy -= forceY * force * 10;
      }

      p.vx += (p.originX + offsetX - p.x) * p.ease;
      p.vy += (p.originY + offsetY - p.y) * p.ease;
      p.vx *= p.friction;
      p.vy *= p.friction;

      p.x += p.vx;
      p.y += p.vy;

      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}
