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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChainService } from '../../services/chain.service';

@Component({
  selector: 'app-fish',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatRadioModule,
    MatSliderModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './fish.component.html',
  styleUrl: './fish.component.scss'
})


export class FishComponent implements OnInit, OnDestroy {
  @Input() boardWidth: number = 800;
  @Input() boardHeight: number = 600;

  // Fish logic
  joints: { x: number; y: number; size: number }[] = [];
  angles: number[] = [];
  bodyWidth : number[] = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19];
  chainLength = 12; // Number of joints in the Fish
  jointLength = 64; // Distance between each joint
  maxAngleChange = Math.PI / 8;

  mouseX = 0;
  mouseY = 0;
  mouseDelta = 0;
  animationFrameId: any;
  isBrowser: boolean = false;

  fishSpeed: number = 4;

  //fish art
  colors: { body: string; outline: string; eyes: string } = {
    body: '#d7e3ff',
    outline: '#d7e3ff',
    eyes: '#005cbb',
  };
  choosedColor: string = 'Cobra';
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private utilService: UtilsService,
    private chainService: ChainService
  ) { }
  isChainVisible: boolean = false;

  //Keyboard input handling:
  isKeyboardMode: boolean = true; // Toggle between mouse and keyboard modes
  moveSpeed: number = 0; // Initial speed
  keyboardAngle: number = 0; // Current angle for keyboard mode
  pressedKeys: Set<string> = new Set(); // Track currently pressed keys
  ArrowLeft: boolean = false;
  ArrowRight: boolean = false;
  ArrowUp: boolean = false;

  ngOnInit(): void {
    this.initializeFish();

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

  moveFish() {
    const angleStep = 0.02; // Angle change per key press

    if (this.isKeyboardMode) {
      // Handle keyboard-based movement

      if (this.pressedKeys.has('ArrowLeft') && this.moveSpeed > 0) {
        this.keyboardAngle -= angleStep; // Adjust angle to turn left
      }

      if (this.pressedKeys.has('ArrowRight') && this.moveSpeed > 0) {
        this.keyboardAngle += angleStep; // Adjust angle to turn right
      }

      if (Math.abs(this.keyboardAngle - this.angles[0]) > 0.5) {
        // If angle is not close to 0, allow rotation
        this.keyboardAngle = this.angles[0];
      }

      if (this.pressedKeys.has('ArrowUp')) {
        this.moveSpeed = this.fishSpeed; // Move forward
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
        this.colors.outline = '#d7e3ff';
        this.colors.eyes = '#005cbb';
        break;

      default:
        this.colors.body = '#d7e3ff';
        this.colors.outline = '#d7e3ff';
        this.colors.eyes = '#005cbb';
        break;
    }
  }

  toggleMovement(): void {
    this.isKeyboardMode = !this.isKeyboardMode;
  }

  toggleVisual(): void {
    this.isChainVisible = !this.isChainVisible;
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  initializeFish(): void {
    const startX = this.boardWidth / 2;
    const startY = this.boardHeight / 2;

    for (let i = 0; i < this.chainLength; i++) {
      this.joints.push({
        x: startX - i * this.jointLength,
        y: startY,
        size: this.getBodyWidth(i),
      });
      this.angles.push(0); // Default angle
    }
  }

  startAnimation(): void {

    const animate = () => {
      const size = this.utilService.getBoardSize();
      this.boardWidth = size.width;
      this.boardHeight = size.height;
      this.moveFish();
      this.updateFish();
      if (this.isChainVisible) this.drawChain();
      else this.drawFish();

      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  updateFish(): void {
    this.joints = this.chainService.updateMovement(
      this.joints,
      this.jointLength,
      this.angles,
      this.keyboardAngle,
      this.mouseX,
      this.mouseY,
      this.isKeyboardMode,
      this.moveSpeed,
      this.fishSpeed
    );
  }

  getPosX(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.joints[i].x +
      Math.cos(this.angles[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset)
    );
  }
  
  getPosY(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.joints[i].y +
      Math.sin(this.angles[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset)
    );
  }

  drawHalfEllipse(
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number },
    angle: number,
    width: number,
    height: number,
    direction: "left" | "right" // Specify which half to draw
  ): void {
    ctx.save(); // Save the current canvas state
    ctx.translate(position.x, position.y); // Move to the position of the joint
    ctx.rotate(angle); // Rotate the canvas to align the ellipse
  
    const startAngle = direction === "right" ? 0 : Math.PI;
    const endAngle = direction === "right" ? Math.PI : 2 * Math.PI;
  
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, startAngle, endAngle);
    ctx.stroke(); // Outline the half-ellipse
    ctx.fill(); // Fill the half-ellipse
    ctx.restore(); // Restore the canvas state
  }
  

  drawFish(): void {
    const canvas = document.getElementById('fishCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = this.joints[0];
    const angles = this.angles;
    const joints = this.joints;
    const bodyWidth = this.bodyWidth;



  // Fish colors
  const bodyColor = "rgba(58, 124, 165, 1)";
  const finColor = "rgba(129, 195, 215, 1)";

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = finColor;

  const pectoralWidhth = 160*2;
  const pectoralHeight = 64*2;

  const ventralWidhth = 96*1.5;
  const ventralHeight = 32*1.5;

  // === PECTORAL FINS ===
  // === START PECTORAL FINS ===
  // ctx.save(); // Save the current transformation state
  // ctx.translate(this.getPosX(3, Math.PI / 3, 0), this.getPosY(3, Math.PI / 3, 0)); // Move to the position for the right fin
  // ctx.rotate(this.angles[2] - Math.PI / 4); // Rotate based on the angle of the fin
  // this.drawEllipse(ctx,  joints[3], 0, 160, 64); // Draw the right fin
  // ctx.restore(); // Restore the original transformation state

  // ctx.save(); // Save the current transformation state
  // ctx.translate(this.getPosX(3, -Math.PI / 3, 0), this.getPosY(3, -Math.PI / 3, 0)); // Move to the position for the left fin
  // ctx.rotate(this.angles[2] + Math.PI / 4); // Rotate based on the angle of the fin
  // this.drawEllipse(ctx, joints[3], 0, 160, 64); // Draw the left fin
  // ctx.restore(); // Restore the original transformation state
  //=== END PECTORAL FINS ===

  this.drawHalfEllipse(ctx, joints[3], angles[2], pectoralWidhth, pectoralHeight, "right");
  this.drawHalfEllipse(ctx, joints[3], angles[2], pectoralWidhth, pectoralHeight, "left");

  // this.drawEllipse(ctx, joints[3], angles[2] - Math.PI / 4, pectoralWidhth, pectoralHeight); // Right
  // this.drawEllipse(ctx, joints[3], angles[2] + Math.PI / 4, pectoralWidhth, pectoralHeight); // Left

  // // === VENTRAL FINS ===
  // this.drawEllipse(ctx, joints[7], angles[6] - Math.PI / 4, ventralWidhth, ventralHeight); // Right
  // this.drawEllipse(ctx, joints[7], angles[6] + Math.PI / 4, ventralWidhth, ventralHeight); // Left

  // === CAUDAL FIN ===
  ctx.beginPath();
  for (let i = 8; i < 12; i++) {
    const tailWidth = 1.5 * angles[0] * (i - 8) ** 2;
    const posX = joints[i].x + Math.cos(angles[i] - Math.PI / 2) * tailWidth;
    const posY = joints[i].y + Math.sin(angles[i] - Math.PI / 2) * tailWidth;
    ctx.lineTo(posX, posY);
  }
  for (let i = 11; i >= 8; i--) {
    const tailWidth = Math.max(-13, Math.min(13, angles[0] * 6));
    const posX = joints[i].x + Math.cos(angles[i] + Math.PI / 2) * tailWidth;
    const posY = joints[i].y + Math.sin(angles[i] + Math.PI / 2) * tailWidth;
    ctx.lineTo(posX, posY);
  }
  ctx.closePath();
  ctx.fillStyle = finColor;
  ctx.fill();

  // === BODY ===
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const posX = joints[i].x + Math.cos(angles[i] + Math.PI / 2) * bodyWidth[i];
    const posY = joints[i].y + Math.sin(angles[i] + Math.PI / 2) * bodyWidth[i];
    ctx.lineTo(posX, posY);
  }
  for (let i = 9; i >= 0; i--) {
    const posX = joints[i].x + Math.cos(angles[i] - Math.PI / 2) * bodyWidth[i];
    const posY = joints[i].y + Math.sin(angles[i] - Math.PI / 2) * bodyWidth[i];
    ctx.lineTo(posX, posY);
  }

  // Top of head
  let angle = this.angles[0] || 0;
  let width = this.getBodyWidth(0);
  ctx.arc(head.x+4, head.y+4, width, angle - Math.PI / 6, angle + Math.PI / 6);


  ctx.closePath();
  ctx.fillStyle = bodyColor;
  ctx.fill();

  // === DORSAL FIN ===
  ctx.beginPath();
  ctx.moveTo(joints[4].x, joints[4].y);
  ctx.bezierCurveTo(
    joints[5].x,
    joints[5].y,
    joints[6].x,
    joints[6].y,
    joints[7].x,
    joints[7].y
  );
  ctx.bezierCurveTo(
    joints[6].x + Math.cos(angles[6] + Math.PI / 2) * angles[0] * 16,
    joints[6].y + Math.sin(angles[6] + Math.PI / 2) * angles[0] * 16,
    joints[5].x + Math.cos(angles[5] + Math.PI / 2) * angles[0] * 16,
    joints[5].y + Math.sin(angles[5] + Math.PI / 2) * angles[0] * 16,
    joints[4].x,
    joints[4].y
  );
  ctx.closePath();
  ctx.fillStyle = finColor;
  ctx.fill();

  // Draw eyes

  const eyeSize = 15;
  const eyeOffset = width - eyeSize - 15;

  ctx.fillStyle = finColor;

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

  drawEllipse(
    ctx: CanvasRenderingContext2D,
    joint: { x: number; y: number },
    angle: number,
    width: number,
    height: number,
    offsetX = 0
  ) {
    ctx.save();
    ctx.translate(joint.x + offsetX, joint.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  drawChain(): void {
    const canvas = document.getElementById('FishCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Fish body
    ctx.beginPath();
    ctx.fillStyle = this.colors.body; // Fish body color
    ctx.strokeStyle = this.colors.outline; // Fish outline
    ctx.lineWidth = 5;

    // Draw right half
    for (let i = 0; i < this.joints.length; i++) {
      const angle = this.angles[i] || 0;
      const joint = this.joints[i];
      const x = joint.x + Math.cos(angle + Math.PI / 2) * 2;
      const y = joint.y + Math.sin(angle + Math.PI / 2) * 2;
      ctx.lineTo(x, y);
    }

    // Draw left half (reversed)
    for (let i = this.joints.length - 1; i >= 0; i--) {
      const angle = this.angles[i] || 0;
      const joint = this.joints[i];
      const x = joint.x + Math.cos(angle - Math.PI / 2) * 2;
      const y = joint.y + Math.sin(angle - Math.PI / 2) * 2;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < this.joints.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = this.colors.body; // Fish body color

      ctx.lineWidth = 2;
      const joint = this.joints[i];
      const x = joint.x;
      const y = joint.y;
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = 'white'; // Fish body color
      ctx.lineWidth = 2;
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
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

