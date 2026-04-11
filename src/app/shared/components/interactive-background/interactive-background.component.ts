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
  angle: number; // Für sanfte Eigenbewegung
  va: number;    // Geschwindigkeit der Eigenbewegung
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
  private animationFrameId?: number;
  private mouse = {
    x: -1000,
    y: -1000,
    radius: 50 // Halbiert von 100
  };

  // Tropical evening palette: warm amber, gold, muted teal for tropical feel
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

    // Text zeichnen, um Pixel-Daten zu erhalten
    this.ctx.fillStyle = 'white';
    const fontSize = Math.min(canvas.width / 6, 150);
    this.ctx.font = `bold ${fontSize}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);

    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    this.particles = [];

    const gap = 6; // Erhöhter Abstand für "Atom"-Optik
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
            color: 'rgba(255, 210, 120, 0.85)', // warm golden amber
            size: 2,
            vx: 0,
            vy: 0,
            friction: 0.7,
            ease: 0.04,
            angle: Math.random() * Math.PI * 2,
            va: Math.random() * 0.02 + 0.01 // Zufällige Geschwindigkeit für das Schweben
          });
        }
      }
    }
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;

    // Deep mocha/espresso base
    this.ctx.fillStyle = 'rgba(18, 9, 4, 1)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle warm dusk glow at bottom – distant light source effect
    const duskGlow = this.ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 1.1, 0,
      canvas.width / 2, canvas.height * 1.1, canvas.height * 0.7
    );
    duskGlow.addColorStop(0, 'rgba(130, 55, 10, 0.14)');
    duskGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = duskGlow;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.updateFireflies();
    this.updateTextParticles();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
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

      // Organic pulse – sin wave drives alpha
      f.pulseTimer += f.alphaSpeed;
      f.alpha = 0.1 + (Math.sin(f.pulseTimer) * 0.5 + 0.5) * 0.7;

      // Soft radial glow behind the core dot
      const glowRadius = f.size * 5;
      const glowGrad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowRadius);
      glowGrad.addColorStop(0, `${f.glowColor}, ${f.alpha * 0.45})`);
      glowGrad.addColorStop(1, `${f.glowColor}, 0)`);
      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, glowRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Core dot
      this.ctx.fillStyle = `${f.color}, ${f.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private updateTextParticles(): void {
    this.particles.forEach(p => {
      // Subtile Eigenbewegung um den Ankerpunkt berechnen
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

      // Rückkehr zum (leicht verschobenen) Ankerpunkt
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
