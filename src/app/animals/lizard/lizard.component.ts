
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
import { PVector, UtilsService, Vector } from '../../services/utils.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChainService } from '../../services/chain.service';
import { ArmModel } from '../../models/models';
@Component({
  selector: 'app-lizard',
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
  templateUrl: './lizard.component.html',
  styleUrl: './lizard.component.scss'
})




export class LizardComponent implements OnInit, OnDestroy {
  @Input() boardWidth: number = 800;
  @Input() boardHeight: number = 600;


  // Fish logic
  joints: { x: number; y: number; size: number }[] = [];
  arms: ArmModel[] = new Array<ArmModel>(4);
  desiredArms: PVector[] = new Array<PVector>(4);
  angles: number[] = [];
  bodyWidth: number[] = [52, 58, 40, 60, 68, 71, 65, 50, 28, 15, 11, 9, 7, 7];
  chainLength = 14; // Number of joints in the Fish
  jointLength = 64; // Distance between each joint
  maxAngleChange = Math.PI / 8;

  mouseX = 0;
  mouseY = 0;
  mouseDelta = 0;
  animationFrameId: any;
  isBrowser: boolean = false;

  lizardSpeed: number = 4;

  //Lizard art
  colors: { body: string; outline: string; eyes: string } = {
    body: '#d7e3ff',
    outline: '#005cbb',
    eyes: '#005cbb',
  };
  choosedColor: string = 'gila';
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private utilService: UtilsService,
    private chainService: ChainService,
  ) {

  }
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
    this.initializeLizard();

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

  moveLizard() {
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
        this.moveSpeed = this.lizardSpeed; // Move forward
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
      case 'skink':
        this.colors.body = '#A888B5';
        this.colors.outline = '#EFB6C8';
        this.colors.eyes = '#EFB6C8';
        break;
      case 'iguana':
        this.colors.body = '#C1BAA1';
        this.colors.outline = '#A59D84';
        this.colors.eyes = '#441752';
        break;
      case 'gila':
        this.colors.body = '#d7e3ff';
        this.colors.outline = '#005cbb';
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

  initializeLizard(): void {
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

    for (let i = 0; i < this.arms.length; i++) {
      this.arms[i] = new ArmModel([
        { x: 0, y: 0, size: i < 2 ? 60 : 30 },
        { x: 0, y: 0, size: i < 2 ? 60 : 30 },
        { x: 0, y: 0, size: i < 2 ? 60 : 30 },
        { x: 0, y: 0, size: i < 2 ? 60 : 30 }]);
      this.desiredArms[i] = new PVector(0, 0);
    }

    // for (int i = 0; i < arms.length; i++) {
    //   arms[i] = new Chain(origin, 3, i < 2 ? 52 : 36);
    //   armDesired[i] = new PVector(0, 0);
    // }
  }



  startAnimation(): void {

    const animate = () => {
      const size = this.utilService.getBoardSize();
      this.boardWidth = size.width;
      this.boardHeight = size.height;
      this.moveLizard();
      this.updateLizard();
      if (this.isChainVisible) this.drawChain();
      else this.drawLizard();

      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  updateLizard(): void {
    this.joints = this.chainService.updateMovement(
      this.joints,
      this.jointLength,
      this.angles,
      this.keyboardAngle,
      this.mouseX,
      this.mouseY,
      this.isKeyboardMode,
      this.moveSpeed,
      this.lizardSpeed
    );

    for (let i = 0; i < this.arms.length; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const bodyIndex = i < 2 ? 3 : 7;
      const angle = i < 2 ? Math.PI / 4 : Math.PI / 3;
      const desiredPos = new PVector(
        this.getPosX(bodyIndex, angle * side, 80),
        this.getPosY(bodyIndex, angle * side, 80)
      );
      if (PVector.dist(desiredPos, this.desiredArms[i]) > 200) {
        this.desiredArms[i] = desiredPos;
      }

      const headJoint = new PVector(this.arms[i].joints[0].x, this.arms[i].joints[0].y);

      this.arms[i].fabrikResolve(
        PVector.lerp(
          headJoint,
          this.desiredArms[i],
          0.4
        ),
        new PVector(
          this.getPosX(bodyIndex, (Math.PI / 2) * side, -20),
          this.getPosY(bodyIndex, (Math.PI / 2) * side, -20)
        )
      );
    }
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

  drawLizard(): void {
    const canvas = document.getElementById('lizardCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // === START ARMS ===
    ctx.beginPath();
    ctx.lineWidth = 40;
    ctx.fillStyle = this.colors.body; // Lizard body color
    ctx.strokeStyle = this.colors.outline; // Lizard outline

    for (let i = 0; i < this.arms.length; i++) {
      ctx.beginPath();

      const shoulder = new PVector(this.arms[i].joints[3].x, this.arms[i].joints[3].y); // Shoulder joint
      const foot = new PVector(this.arms[i].joints[0].x, this.arms[i].joints[0].y); // Foot joint
      const elbow = this.arms[i].joints[1];

      // Correct back legs for physical accuracy
      const para = PVector.sub(foot, shoulder);
      const perp = new Vector(-para.y, para.x).setMag(20);

      if (i === 2) {
        elbow.x -= perp.x;
        elbow.y -= perp.y;
      } else if (i === 3) {
        elbow.x += perp.x;
        elbow.y += perp.y;
      }

      // Outer Bézier curve


      ctx.beginPath();
      ctx.lineWidth = 40;
      ctx.strokeStyle = this.colors.outline; // Lizard outline
      // ctx.moveTo(shoulder.x, shoulder.y);
      ctx.bezierCurveTo(shoulder.x, shoulder.y, elbow.x, elbow.y, foot.x, foot.y);
      ctx.stroke();
      ctx.closePath();

      
      ctx.beginPath();
      ctx.arc(foot.x, foot.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.outline;
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(shoulder.x, shoulder.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.outline;
      ctx.fill();
      ctx.closePath();



      //Inner Bézier curve
      ctx.beginPath();
      ctx.lineWidth = 32;
      ctx.strokeStyle = this.colors.body; // Lizard body color
      ctx.bezierCurveTo(shoulder.x, shoulder.y, elbow.x, elbow.y, foot.x, foot.y);
      ctx.stroke();
      ctx.closePath();

      
      ctx.beginPath();
      ctx.arc(foot.x, foot.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.body;
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(shoulder.x, shoulder.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.body;
      ctx.fill();
      ctx.closePath();


      
    }
    // === END ARMS ===


    // Draw Lizard body
    ctx.beginPath();
    ctx.fillStyle = this.colors.body; // Lizard body color
    ctx.strokeStyle = this.colors.outline; // Lizard outline
    ctx.lineWidth = 4;

    // Draw right half
    for (let i = 0; i < this.joints.length; i++) {
      const width = this.bodyWidth[i];
      const angle = this.angles[i] || 0;
      const joint = this.joints[i];
      const x = joint.x + Math.cos(angle + Math.PI / 2) * width;
      const y = joint.y + Math.sin(angle + Math.PI / 2) * width;
      ctx.lineTo(x, y);
    }

    // Top of tail
    const tail = this.joints[this.joints.length - 1];
    let tailangle = this.angles[this.joints.length - 1] || 0;
    let tailwidth = this.bodyWidth[this.joints.length - 1];
    ctx.arc(
      tail.x,
      tail.y,
      tailwidth,
      tailangle + Math.PI / 2,
      tailangle - Math.PI / 2
    );

    // Draw left half (reversed)
    for (let i = this.joints.length - 1; i >= 0; i--) {
      const width = this.bodyWidth[i];
      const angle = this.angles[i] || 0;
      const joint = this.joints[i];
      const x = joint.x + Math.cos(angle - Math.PI / 2) * width;
      const y = joint.y + Math.sin(angle - Math.PI / 2) * width;
      ctx.lineTo(x, y);
    }

    // Top of head
    const head = this.joints[0];
    let angle = this.angles[0] || 0;
    let width = this.bodyWidth[0];
    ctx.arc(head.x, head.y, width, angle - Math.PI / 6, angle + Math.PI / 6);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw eyes

    const eyeSize = 15;
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

  drawChain(): void {
    const canvas = document.getElementById('lizardCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Lizard body
    ctx.beginPath();
    ctx.fillStyle = this.colors.body; // Lizard body color
    ctx.strokeStyle = this.colors.outline; // Lizard outline
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
      ctx.fillStyle = this.colors.body; // Lizard body color

      ctx.lineWidth = 2;
      const joint = this.joints[i];
      const x = joint.x;
      const y = joint.y;
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = 'white'; // Lizard body color
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
