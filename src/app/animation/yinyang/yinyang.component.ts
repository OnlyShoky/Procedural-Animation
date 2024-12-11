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
import { max } from 'rxjs';

@Component({
  selector: 'app-yinyang',
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
  templateUrl: './yinyang.component.html',
  styleUrl: './yinyang.component.scss'
})


export class YinyangComponent implements OnInit, OnDestroy {
  @Input() boardWidth: number = 800;
  @Input() boardHeight: number = 600;

  // Fish logic
  jointsYin: { x: number; y: number; size: number }[] = [];
  jointsYang: { x: number; y: number; size: number }[] = [];

  anglesYin: number[] = [];
  anglesYang: number[] = [];

  bodyWidth: number[] = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19, 0, 20];
  chainLength = 12; // Number of joints in the Fish
  jointLength = 64; // Distance between each joint
  maxAngleChange = Math.PI / 8;

  radius: number = 400;
  angle: number = 0;



  posYinX: number = 0;
  posYinY: number = 0;
  posYangX: number = 0;
  posYangY: number = 0;

  mouseY = 0;
  mouseDelta = 0;
  animationFrameId: any;
  isBrowser: boolean = false;

  fishSpeed: number = 20;


  //Fish params
  pectoralWidth = 96;
  pectoralHeight = 46;

  ventralWidth = 45;
  ventralHeight = 25;
  deltaX: number = 0;
  deltaY: number = 0;

  //fish art
  colors: { body: string; outline: string; fin: string; eyes: string } = {
    body: '#070a13',
    outline: '#3C3D37',
    fin: '#070a13',
    eyes: '#fcf4f0',
  };

  colorsYang: { body: string; outline: string; fin: string; eyes: string } = {
    body: '#fcf4f0',
    outline: '#070a13',
    fin: '#fcf4f0',
    eyes: '#070a13',
  };




  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private utilService: UtilsService,
    private chainService: ChainService
  ) { }
  isChainVisible: boolean = false;

  //Keyboard input handling:
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

    }
  }


  moveFish() {

    const centerX = this.boardWidth / 2;
    const centerY = this.boardHeight / 2;

    this.radius = Math.max((this.boardHeight) / 4 , 400);

    this.posYangX = centerX + Math.cos(this.angle) * this.radius,
    this.posYangY = centerY + Math.sin(this.angle) * this.radius,


    this.posYinX = centerX + Math.cos(this.angle + Math.PI) * this.radius;
    this.posYinY = centerY + Math.sin(this.angle + Math.PI) * this.radius;

    
  }


  

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  initializeFish(): void {
    const startX = 0 ;
    const startY = 0 ;

    const endX = this.boardWidth;
    const endY = this.boardHeight;

    for (let i = 0; i < this.chainLength; i++) {
      this.jointsYin.push({
        x: startX - i * this.jointLength,
        y: startY,
        size: this.bodyWidth[i],
      });
      this.anglesYin.push(0); // Default angle

      this.jointsYang.push({
        x: endX - i * this.jointLength,
        y: endY,
        size: this.bodyWidth[i],
      });
      this.anglesYang.push(0); // Default angle
    }
  }

  startAnimation(): void {

    const animate = () => {
      const size = this.utilService.getBoardSize();
      this.boardWidth = size.width;
      this.boardHeight = size.height;
      this.angle = (this.angle +  0.02) % (2 * Math.PI);
      this.moveFish();
      this.updateFish();
      this.drawYin();
      this.drawYang();


      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  updateFish(): void {
    this.jointsYin = this.chainService.updateMovement(
      this.jointsYin,
      this.jointLength,
      this.anglesYin,
      this.keyboardAngle,
      this.posYinX,
      this.posYinY,
      false,
      this.moveSpeed,
      this.fishSpeed
    );

    this.jointsYang = this.chainService.updateMovement(
      this.jointsYang,
      this.jointLength,
      this.anglesYang,
      this.keyboardAngle,
      this.posYangX,
      this.posYangY,
      false,
      this.moveSpeed,
      this.fishSpeed
    );
  }

  getPosYinx(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.jointsYin[i].x +
      Math.cos(this.anglesYin[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset)
    );
  }

  getPosYiny(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.jointsYin[i].y +
      Math.sin(this.anglesYin[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset)
    );
  }

  getPosYangx(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.jointsYang[i].x +
      Math.cos(this.anglesYang[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset)
    );
  }

  getPosYangy(i: number, angleOffset: number, lengthOffset: number): number {
    return (
      this.jointsYang[i].y +
      Math.sin(this.anglesYang[i] + angleOffset) * (this.bodyWidth[i] + lengthOffset)
    );
  }

  drawEllipseYang(
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
    ctx.fillStyle = this.colorsYang.fin;
    ctx.strokeStyle = this.colorsYang.outline;
    ctx.lineWidth = 4;
    const posX = this.getPosYangx(i, angleTrans, 0);
    const posY = this.getPosYangy(i, angleTrans, 0);
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
  
  drawEllipseYin(
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
    const posX = this.getPosYinx(i, angleTrans, 0);
    const posY = this.getPosYiny(i, angleTrans, 0);
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


  drawYin(): void {
    const canvas = document.getElementById('fishCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = this.jointsYin[0];
    const angles = this.anglesYin;
    const joints = this.jointsYin;
    const bodyWidth = this.bodyWidth;

    const headToMid1 = this.utilService.relativeAngleDiff(angles[0], angles[6]);
    const headToMid2 = this.utilService.relativeAngleDiff(angles[0], angles[7]);

    const headToTail = headToMid1 + this.utilService.relativeAngleDiff(angles[6], angles[11]);


    // Fish colors


    ctx.fillStyle = this.colors.body; // Snake body color
    ctx.strokeStyle = this.colors.outline; // Snake outline
    ctx.lineWidth = 4;


    // === PECTORAL FINS ===
    this.drawEllipseYin(ctx, 3, angles[2], this.pectoralWidth, this.pectoralHeight, "right");
    this.drawEllipseYin(ctx, 3, angles[2], this.pectoralWidth, this.pectoralHeight, "left");

    // === VENTRAL FINS ===
    this.drawEllipseYin(ctx, 7, angles[6], this.ventralWidth, this.ventralHeight, "right");
    this.drawEllipseYin(ctx, 7, angles[6], this.ventralWidth, this.ventralHeight, "left");

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
    const tail = this.jointsYin[10 - 1];
    let tailangle = this.anglesYin[10 - 1] || 0;
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
    let angle = this.anglesYin[0] || 0;
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
      head.x + Math.cos(this.anglesYin[0] + Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.anglesYin[0] + Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    ctx.closePath();

    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(this.anglesYin[0] - Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.anglesYin[0] - Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  drawYang(): void {
    const canvas = document.getElementById('fishCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    const head = this.jointsYang[0];
    const angles = this.anglesYang;
    const joints = this.jointsYang;
    const bodyWidth = this.bodyWidth;

    const headToMid1 = this.utilService.relativeAngleDiff(angles[0], angles[6]);
    const headToMid2 = this.utilService.relativeAngleDiff(angles[0], angles[7]);

    const headToTail = headToMid1 + this.utilService.relativeAngleDiff(angles[6], angles[11]);


    // Fish colors


    ctx.fillStyle = this.colorsYang.body; // Snake body color
    ctx.strokeStyle = this.colorsYang.outline; // Snake outline
    ctx.lineWidth = 4;


    // === PECTORAL FINS ===
    this.drawEllipseYang(ctx, 3, angles[2], this.pectoralWidth, this.pectoralHeight, "right");
    this.drawEllipseYang(ctx, 3, angles[2], this.pectoralWidth, this.pectoralHeight, "left");

    // === VENTRAL FINS ===
    this.drawEllipseYang(ctx, 7, angles[6], this.ventralWidth, this.ventralHeight, "right");
    this.drawEllipseYang(ctx, 7, angles[6], this.ventralWidth, this.ventralHeight, "left");

    // === CAUDAL FIN ===
    ctx.fillStyle = this.colorsYang.fin; // Snake body color
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
    ctx.fillStyle = this.colorsYang.body; // Snake body color
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const posX = joints[i].x + Math.cos(angles[i] + Math.PI / 2) * bodyWidth[i];
      const posY = joints[i].y + Math.sin(angles[i] + Math.PI / 2) * bodyWidth[i];
      ctx.lineTo(posX, posY);
    }

    // bottom of tail
    const tail = this.jointsYang[10 - 1];
    let tailangle = this.anglesYang[10 - 1] || 0;
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
    let angle = this.anglesYang[0] || 0;
    let width = this.bodyWidth[0];
    ctx.arc(head.x + 4, head.y + 4, width, angle - Math.PI / 5, angle + Math.PI / 5);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === DORSAL FIN ===
    ctx.fillStyle = this.colorsYang.fin; // Snake body color

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

    ctx.fillStyle = this.colorsYang.eyes;

    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(this.anglesYang[0] + Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.anglesYang[0] + Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    ctx.closePath();

    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(this.anglesYang[0] - Math.PI / 2) * eyeOffset,
      head.y + Math.sin(this.anglesYang[0] - Math.PI / 2) * eyeOffset,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }





}

