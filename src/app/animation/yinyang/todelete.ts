

import {
    Component,
    OnInit,
    OnDestroy,
    Inject,
    Input,
    PLATFORM_ID,
  } from '@angular/core';
  import { CommonModule, isPlatformBrowser } from '@angular/common';
  
  @Component({
    selector: 'app-yinyang',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './yinyang.component.html',
    styleUrl: './yinyang.component.scss'
  })
  export class YinyangComponent implements OnInit, OnDestroy {
    @Input() boardWidth: number = 800;
    @Input() boardHeight: number = 600;
  
    private animationFrameId: number | undefined;
    private isBrowser: boolean = false;
    private angle: number = 0;
    private radius: number = 200;
  
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        this.isBrowser = true;
        this.startAnimation();
      }
    }
  
    ngOnDestroy(): void {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  
    private startAnimation(): void {
      const animate = () => {
        this.angle += 0.02;
        this.drawFishes();
        this.animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }
  
    private drawFishes(): void {
      const canvas = document.getElementById('fishCanvas') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      const centerX = this.boardWidth / 2;
      const centerY = this.boardHeight / 2;
  
      // Draw Yin Fish
      this.drawFish(
        ctx,
        centerX + Math.cos(this.angle) * this.radius,
        centerY + Math.sin(this.angle) * this.radius,
        '#070a13',
        '#fcf4f0'
      );
  
      // Draw Yang Fish
      this.drawFish(
        ctx,
        centerX + Math.cos(this.angle + Math.PI) * this.radius,
        centerY + Math.sin(this.angle + Math.PI) * this.radius,
        '#fcf4f0',
        '#070a13'
      );
    }
  
    private drawFish(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      bodyColor: string,
      eyeColor: string
    ): void {
      // Fish body
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = bodyColor;
      ctx.fill();
  
      // Fish tail
      ctx.beginPath();
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x - 50, y - 20);
      ctx.lineTo(x - 50, y + 20);
      ctx.closePath();
      ctx.fillStyle = bodyColor;
      ctx.fill();
  
      // Fish eye
      ctx.beginPath();
      ctx.arc(x + 10, y - 10, 5, 0, 2 * Math.PI);
      ctx.fillStyle = eyeColor;
      ctx.fill();
    }
  }
  