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
  selector: 'app-snake-p',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-p.component.html',
  styleUrl: './snake-p.component.scss'
})

export class SnakePComponent implements OnInit, OnDestroy {
  @Input() boardWidth: number = 800;
  @Input() boardHeight: number = 600;

  // Snake logic
  joints: { x: number; y: number }[] = [];
  angles: number[] = [];
  chainLength = 15;
  jointLength = 50 ; // Distance between joints
  maxAngleChange = Math.PI / 8;

  mouseX = 0;
  mouseY = 0;

  animationFrameId: any;
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Initialize joints for the snake
    this.initializeSnake();

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

  initializeSnake(): void {
    const startX = this.boardWidth / 2;
    const startY = this.boardHeight / 2;

    // Initialize joints and angles
    for (let i = 0; i < this.chainLength; i++) {
      this.joints.push({ x: startX - i * this.jointLength, y: startY });
      this.angles.push(0); // Default angle
    }
  }

  startAnimation(): void {
    const animate = () => {
      this.updateSnake();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animate();
  }

  updateSnake(): void {
    // Target position (simulate mouse)
    const targetX = this.mouseX ;
    const targetY = this.mouseY - 170;

    // Update the first joint (head) towards the target
    const head = this.joints[0];
    const dx = targetX - head.x;
    const dy = targetY - head.y;
    const targetAngle = Math.atan2(dy, dx);
    head.x += Math.cos(targetAngle) * 2;
    head.y += Math.sin(targetAngle) * 2;

    // Update remaining joints
    for (let i = 1; i < this.joints.length; i++) {
      const prevJoint = this.joints[i - 1];
      const currentJoint = this.joints[i];

      // Resolve the joint position
      const distance = Math.hypot(
        currentJoint.x - prevJoint.x,
        currentJoint.y - prevJoint.y
      );

      if (distance > this.jointLength) {
        const angle = Math.atan2(
          prevJoint.y - currentJoint.y,
          prevJoint.x - currentJoint.x
        );

        currentJoint.x =
          prevJoint.x - Math.cos(angle) * this.jointLength;
        currentJoint.y =
          prevJoint.y - Math.sin(angle) * this.jointLength;
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}
