import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UtilsService } from '../../services/utils.service';
@Component({
  selector: 'app-snake-p',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatRadioModule, MatSliderModule, FormsModule, MatInputModule],
  templateUrl: './snake-p.component.html',
  styleUrl: './snake-p.component.scss'
})

export class SnakePComponent implements OnInit, OnDestroy {
  @Input() boardWidth: number = 800;
  @Input() boardHeight: number = 600;

  // Snake logic
  joints: { x: number; y: number, size: number }[] = [];
  angles: number[] = [];
  chainLength = 48; // Number of joints in the snake
  jointLength = 32; // Distance between each joint
  maxAngleChange = Math.PI / 8;

  mouseX = 0;
  mouseY = 0;
  animationFrameId: any;
  isBrowser: boolean = false;


  //Snake art
  colors: { body: string, outline: string, eyes: string } = { body: '#005cbb', outline: '#d7e3ff', eyes: '#d7e3ff' };
  choosedColor: string = 'Cobra';
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private utilService : UtilsService) { }

  //Keyboard input handling:
  isKeyboardMode: boolean = true; // Toggle between mouse and keyboard modes
  moveSpeed: number = 0; // Initial speed
  keyboardAngle: number = 0; // Current angle for keyboard mode
  pressedKeys: Set<string> = new Set(); // Track currently pressed keys


  ngOnInit(): void {

    this.initializeSnake();

    // Check if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.startAnimation();

      window.addEventListener('keydown', (event) => this.handleKeyDown(event));
      window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.pressedKeys.add(event.key); // Track pressed keys


    // Toggle between modes
    if (event.key === 'm') {
      this.isKeyboardMode = !this.isKeyboardMode;
    }


  }

  moveSnake() {
    const angleStep = 0.02; // Angle change per key press

    if (this.isKeyboardMode) {
      // Handle keyboard-based movement

        
      
      if (this.pressedKeys.has('ArrowLeft')) {
        this.keyboardAngle -= angleStep; // Adjust angle to turn left
      }

      if (this.pressedKeys.has('ArrowRight')) {
        this.keyboardAngle += angleStep; // Adjust angle to turn right
      }

      if( Math.abs(this.keyboardAngle - this.angles[0]) > 0.5){ // If angle is not close to 0, allow rotation
        this.keyboardAngle = this.angles[0];
      }

    
      if (this.pressedKeys.has('ArrowUp')) {
        this.moveSpeed = 4; // Move forward
      } else {
        this.moveSpeed = 0; // Stop if ArrowUp is not pressed
      }

    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.key); // Remove key from pressed set

    if (event.key === 'ArrowUp') {
      // Stop movement when ArrowUp is released
      this.moveSpeed = 0;
    }
  }

  onColorChange(): void {
    console.log(this.choosedColor);

    switch (this.choosedColor) {
      case 'Python':
        this.colors.body = '#68b252';
        this.colors.outline = '#0b242d';
        this.colors.eyes = '#acac3f';
        break;
      case 'BlackMamba':
        this.colors.body = '#070a13';
        this.colors.outline = '#070a13';
        this.colors.eyes = '#f31015';
        break;
      case 'Cobra':
        this.colors.body = '#d7e3ff';
        this.colors.outline = '#005cbb';
        this.colors.eyes = '#005cbb';
        break;

      default:
        this.colors.body = '#d7e3ff';
        this.colors.outline = '#005cbb';
        this.colors.eyes = '#005cbb';
        break;
    }
  }

  changeMovement(): void {
    this.isKeyboardMode = !this.isKeyboardMode;

  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  initializeSnake(): void {
    const startX = this.boardWidth / 2;
    const startY = this.boardHeight / 2;



    for (let i = 0; i < this.chainLength; i++) {
      this.joints.push({ x: startX - i * this.jointLength, y: startY, size: this.getBodyWidth(i) });
      this.angles.push(0); // Default angle
    }
  }

  startAnimation(): void {
    const animate = () => {
      this.moveSnake();
      this.updateSnake();
      this.drawSnake();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  updateSnake(): void {
    const head = this.joints[0];
    const maxAngle = Math.PI / 8; // Maximum angle (45m degrees)
  
    if (this.isKeyboardMode) {
      // Keyboard mode: Move based on angle and keys
      const moveSpeed = this.moveSpeed; // Speed of the snake's movement

      
      // this.angles[0] = this.utilService.constrainAngle(this.keyboardAngle, this.angles[0], maxAngle);
      this.angles[0] = this.utilService.simplifyAngle(this.keyboardAngle);
      this.angles[0] = this.utilService.constrainAngle( this.angles[0], this.angles[1], maxAngle);

      head.x += Math.cos(this.angles[0]) * moveSpeed;
      head.y += Math.sin(this.angles[0]) * moveSpeed;
    
    } else {
      // Mouse mode: Move towards mouse position
      const targetX = this.mouseX;
      const targetY = this.mouseY - 170;
  
      // Calculate distance between the head and the target (mouse)
      const dx = targetX - head.x;
      const dy = targetY - head.y;
      const distanceToTarget = Math.hypot(dx, dy);
  
      // Define a threshold distance to stop the head from moving
      const threshold = 50;
  
      if (distanceToTarget > threshold) {
        const targetAngle = Math.atan2(dy, dx);
        this.angles[0] = this.utilService.constrainAngle(targetAngle, this.angles[1], maxAngle);
  
        head.x += Math.cos(this.angles[0]) * 4; // Move head towards the limited angle
        head.y += Math.sin(this.angles[0]) * 4;
      }
    }
  
    // Update remaining joints
    for (let i = 1; i < this.joints.length; i++) {
      const prevJoint = this.joints[i - 1];
      const currentJoint = this.joints[i];
  
      const distance = Math.hypot(
        prevJoint.x - currentJoint.x,
        prevJoint.y - currentJoint.y
      );
  
      if (distance > this.jointLength) {
        const angle = Math.atan2(
          prevJoint.y - currentJoint.y,
          prevJoint.x - currentJoint.x
        );

        // this.angles[i] = angle;
        this.angles[i] = this.utilService.constrainAngle(angle, this.angles[i-1], maxAngle);
  
        currentJoint.x =
          prevJoint.x - Math.cos(this.angles[i]) * this.jointLength;
        currentJoint.y =
          prevJoint.y - Math.sin(this.angles[i]) * this.jointLength;
          
        
      }
    }
  }
  

  drawSnake(): void {
    const canvas = document.getElementById('snakeCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake body
    ctx.beginPath();
    ctx.fillStyle = this.colors.body; // Snake body color
    ctx.strokeStyle = this.colors.outline; // Snake outline
    ctx.lineWidth = 2;



    // Draw right half
    for (let i = 0; i < this.joints.length; i++) {
      const width = this.getBodyWidth(i);
      const angle = this.angles[i] || 0;
      const joint = this.joints[i];
      const x = joint.x + Math.cos(angle + Math.PI / 2) * width;
      const y = joint.y + Math.sin(angle + Math.PI / 2) * width;
      ctx.lineTo(x, y);
    }

    // Top of tail
    const tail = this.joints[this.joints.length - 1];
    let tailangle = this.angles[this.joints.length - 1] || 0;
    let tailwidth = this.getBodyWidth(this.joints.length - 1);
    ctx.arc(
      tail.x,
      tail.y,
      tailwidth,
      tailangle + Math.PI / 2,
      tailangle - Math.PI / 2
    );

    // Draw left half (reversed)
    for (let i = this.joints.length - 1; i >= 0; i--) {
      const width = this.getBodyWidth(i);
      const angle = this.angles[i] || 0;
      const joint = this.joints[i];
      const x = joint.x + Math.cos(angle - Math.PI / 2) * width;
      const y = joint.y + Math.sin(angle - Math.PI / 2) * width;
      ctx.lineTo(x, y);
    }


    // Top of head
    const head = this.joints[0];
    let angle = this.angles[0] || 0;
    let width = this.getBodyWidth(0);
    ctx.arc(
      head.x,
      head.y,
      width,
      angle - Math.PI / 6,
      angle + Math.PI / 6
    );




    ctx.closePath();
    ctx.fill();
    ctx.stroke();




    // Draw eyes

    const eyeSize = 15
    const eyeOffset = width - eyeSize - 10;

    ctx.fillStyle = this.colors.eyes;
    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(this.angles[0] + Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.angles[0] + Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(this.angles[0] - Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.angles[0] - Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  getBodyWidth(index: number): number {
    switch (index) {
      case 0:
        return 76;
      case 1:
        return 80;
      default:
        return 64 - index;
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}