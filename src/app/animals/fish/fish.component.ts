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
  bodyWidth: number[] = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19, 0, 20];
  chainLength = 12; // Number of joints in the Fish
  jointLength = 64; // Distance between each joint
  maxAngleChange = Math.PI / 8;

  mouseX = 0;
  mouseY = 0;
  mouseDelta = 0;
  animationFrameId: any;
  isBrowser: boolean = false;

  fishSpeed: number = 4;


  //Fish params
  pectoralWidth = 96;
  pectoralHeight = 46;

  ventralWidth = 45;
  ventralHeight = 25;
  deltaX: number = 0;
  deltaY: number = 0;

  //fish art
  colors: { body: string; outline: string; fin: string; eyes: string } = {
    body: '#d7e3ff',
    outline: '#7cabff',
    fin: '#abc7ff',
    eyes: '#f0faff',
  };

  choosedColor: string = 'Koi';
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
      case 'Carp':
        this.colors.body = '#da4f2a';
        this.colors.outline = '#35313f';
        this.colors.fin = '#fcf4f0';
        this.colors.eyes = '#fcf4f0';
        break;
      case 'Yin':
        this.colors.body = '#070a13';
        this.colors.outline = '#3C3D37';
        this.colors.fin = '#070a13';
        this.colors.eyes = '#fcf4f0';
        break;
      case 'Yang':
        this.colors.body = '#fcf4f0';
        this.colors.outline = '#070a13';
        this.colors.fin = '#fcf4f0';
        this.colors.eyes = '#070a13';
        break;
      case 'Koi':
        this.colors.body = '#abc7ff';
        this.colors.outline = '#7cabff';
        this.colors.fin = '#d7e3ff'
        this.colors.eyes = '#f0faff';
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
        size: this.bodyWidth[i],
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

  drawEllipse(
    ctx: CanvasRenderingContext2D,
    i: number,
    angle: number,
    width: number,
    height: number,
    direction: "left" | "right" // Specify which half to draw
  ): void {
    const angleTrans = direction === "right" ? Math.PI / 3 : - Math.PI / 3;
    const angleRot = direction === "right" ? - Math.PI / 4 : Math.PI / 4;

    ctx.save(); // Save the current canvas state
    ctx.fillStyle = this.colors.fin;
    ctx.strokeStyle = this.colors.outline;
    ctx.lineWidth = 4;
    const posX = this.getPosX(i, angleTrans, 0);
    const posY = this.getPosY(i, angleTrans, 0);
    ctx.translate(posX, posY); // Move to the position of the joint
    ctx.rotate(angle + angleRot); // Rotate the canvas to align the ellipse


    ctx.beginPath();
    // ctx.ellipse(this.deltaX, this.deltaY, width , height, 0, startAngle, endAngle);
    ctx.ellipse(this.deltaX, this.deltaY, width, height, 0, 0, 2 * Math.PI);

    ctx.stroke(); // Outline the half-ellipse
    ctx.fill(); // Fill the half-ellipse
    ctx.stroke();
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

    const headToMid1 = this.utilService.relativeAngleDiff(angles[0], angles[6]);
    const headToMid2 = this.utilService.relativeAngleDiff(angles[0], angles[7]);

    const headToTail = headToMid1 + this.utilService.relativeAngleDiff(angles[6], angles[11]);


    // Fish colors


    ctx.fillStyle = this.colors.body; // Snake body color
    ctx.strokeStyle = this.colors.outline; // Snake outline
    ctx.lineWidth = 4;


    // === PECTORAL FINS ===
    this.drawEllipse(ctx, 3, angles[2], this.pectoralWidth, this.pectoralHeight, "right");
    this.drawEllipse(ctx, 3, angles[2], this.pectoralWidth, this.pectoralHeight, "left");

    // === VENTRAL FINS ===
    this.drawEllipse(ctx, 7, angles[6], this.ventralWidth, this.ventralHeight, "right");
    this.drawEllipse(ctx, 7, angles[6], this.ventralWidth, this.ventralHeight, "left");

    // === CAUDAL FIN ===
    ctx.fillStyle = this.colors.fin; // Snake body color
    ctx.beginPath();

    for (let i = 8; i < 12; i++) {
      const tailWidth = 1.5 * headToTail * (i - 8) ** 2;
      const posX = joints[i].x + Math.cos(angles[i] - Math.PI / 2) * tailWidth;
      const posY = joints[i].y + Math.sin(angles[i] - Math.PI / 2) * tailWidth;

      ctx.lineTo(posX, posY);
    }

    for (let i = 11; i >= 8; i--) {
      const tailWidth = Math.max(-13, Math.min(13, headToTail * 6));
      const posX = joints[i].x + Math.cos(angles[i] + Math.PI / 2) * tailWidth;
      const posY = joints[i].y + Math.sin(angles[i] + Math.PI / 2) * tailWidth;
      ctx.lineTo(posX, posY);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === BODY ===
    ctx.fillStyle = this.colors.body; // Snake body color
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const posX = joints[i].x + Math.cos(angles[i] + Math.PI / 2) * bodyWidth[i];
      const posY = joints[i].y + Math.sin(angles[i] + Math.PI / 2) * bodyWidth[i];
      ctx.lineTo(posX, posY);
    }

    // bottom of tail
    const tail = this.joints[10 - 1];
    let tailangle = this.angles[10 - 1] || 0;
    let tailwidth = this.bodyWidth[10 - 1];
    ctx.arc(
      tail.x,
      tail.y,
      tailwidth,
      tailangle + Math.PI / 2,
      tailangle - Math.PI / 2
    );

    for (let i = 9; i >= 0; i--) {
      const posX = joints[i].x + Math.cos(angles[i] - Math.PI / 2) * bodyWidth[i];
      const posY = joints[i].y + Math.sin(angles[i] - Math.PI / 2) * bodyWidth[i];
      ctx.lineTo(posX, posY);

    }

    // Top of head
    let angle = this.angles[0] || 0;
    let width = this.bodyWidth[0];
    ctx.arc(head.x + 4, head.y + 4, width, angle - Math.PI / 5, angle + Math.PI / 5);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === DORSAL FIN ===
    ctx.fillStyle = this.colors.fin; // Snake body color

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
      joints[6].x + Math.cos(angles[6] + Math.PI / 2) * headToMid2 * 16,
      joints[6].y + Math.sin(angles[6] + Math.PI / 2) * headToMid2 * 16,
      joints[5].x + Math.cos(angles[5] + Math.PI / 2) * headToMid1 * 16,
      joints[5].y + Math.sin(angles[5] + Math.PI / 2) * headToMid1 * 16,
      joints[4].x,
      joints[4].y
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw eyes

    const eyeSize = 15;
    const eyeOffset = width - eyeSize - 15;

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
    ctx.stroke();

    ctx.closePath();

    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(this.angles[0] - Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.angles[0] - Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }


  drawChain(): void {
    const canvas = document.getElementById('fishCanvas') as HTMLCanvasElement;
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

    this.drawEllipse(ctx, 3, this.angles[2], 40, 10, "right");
    this.drawEllipse(ctx, 3, this.angles[2], 40, 10, "left");

    this.drawEllipse(ctx, 7, this.angles[6], 20, 10, "right");
    this.drawEllipse(ctx, 7, this.angles[6], 20, 10, "left");


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


  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}

