import { Component, OnInit, OnDestroy, Inject, input, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './snake.component.html',
  styleUrl: './snake.component.scss'
})

export class SnakeComponent implements OnInit, OnDestroy {
  @Input() boardWidth: number = 0;
  @Input() boardHeight: number = 0;

  snakeTransform: string = 'translate(-50%, -50%)'; // Initial position
  radius: number = 600; // Radius of the circular path
  angle: number = 0; // Current angle
  centerX: number = 50; // Horizontal center of the board
  centerY: number = 50; // Vertical center of the board
  animationFrameId: any;
  isBrowser: boolean = false;
  x : number = 0;
  y : number = 0;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Check if running in the browser
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

  startAnimation(): void {
    // this.circularAnimation();
    this.linearAnimation();
  }

  updateBoardSize(): void {
    if (this.isBrowser) {
      this.centerX = this.boardWidth / 2;
      this.centerY = this.boardHeight / 2;
    }
  }

  circularAnimation(): void {
    let frameCounter = 0; // Counter to skip frames
    let speed = 50; // Animation speed
  
    const animate = () => {
      frameCounter++;
      if (frameCounter % speed === 0) { // Only update on every 3rd frame
        this.angle += 2; // Keep the increment the same
        frameCounter = 0;
        if (this.angle >= 360) {
          // this.angle = 0; // Reset angle after a full circle (optional)
        }
  
        // Calculate the x and y position based on the angle
        this.x = this.centerX + this.radius * Math.cos(this.angle * (Math.PI / 180));
        this.y = this.centerY + this.radius * Math.sin(this.angle * (Math.PI / 180));
  
        this.snakeTransform = `translate(-50%, -50%) translate(${this.x}%, ${this.y}%)`;
      }
  
      // Request the next animation frame
      this.animationFrameId = requestAnimationFrame(animate);
    };
  
    // Start the animation loop
    animate();
  }

  linearAnimation(): void {
    let frameCounter = 0; // Counter to skip frames
    let speed = 3; // Animation speed

  
    const animate = () => {
      this.updateBoardSize();

      frameCounter++;
      if (frameCounter % speed === 0) { // Only update on every 3rd frame
        frameCounter = 0;


        // Calculate the x and y position based on the angle
        this.x = (this.x +10 )% this.boardWidth ;
        this.y = (this.y +5 )% this.boardHeight ;
  
        this.snakeTransform = `translate(-50%, -50%) translate(${this.x}px, ${this.y}px)`;
      }
  
      // Request the next animation frame
      this.animationFrameId = requestAnimationFrame(animate);
    };
  
    // Start the animation loop
    animate();
  }
}