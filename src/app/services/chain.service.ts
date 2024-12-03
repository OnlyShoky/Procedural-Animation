import { Injectable } from '@angular/core';
import { UtilsService, Vector } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class ChainService {
  constructor(private utilService: UtilsService) {}

  updateMovement(
    joints: { x: number; y: number; size: number }[] = [],
    jointLength : number,
    angles: number[] = [],
    keyboardAngle: number,
    mouseX: number,
    mouseY: number,
    isKeyboardMode: boolean,
    moveSpeed: number
  ): { x: number; y: number; size: number }[] {
    const head = joints[0];
    const maxAngle = Math.PI / 8; // Maximum angle (45m degrees)

    if (isKeyboardMode) {
      // Keyboard mode: Move based on angle and keys

      // this.angles[0] = this.utilService.constrainAngle(this.keyboardAngle, this.angles[0], maxAngle);
      angles[0] = this.utilService.simplifyAngle(keyboardAngle);
      angles[0] = this.utilService.constrainAngle(
        angles[0],
        angles[1],
        maxAngle
      );

      head.x += Math.cos(angles[0]) * moveSpeed;
      head.y += Math.sin(angles[0]) * moveSpeed;
    } else {

      const toolbarSize = this.utilService.gettoolbarSize();
      // Mouse mode: Move towards mouse position
      const targetX = mouseX;
      const targetY = mouseY - toolbarSize.height;

      // Calculate distance between the head and the target (mouse)
      const dx = targetX - head.x;
      const dy = targetY - head.y;
      const distanceToTarget = Math.hypot(dx, dy);

      // Define a threshold distance to stop the head from moving
      const threshold = 100;

      if (distanceToTarget > threshold) {
        const targetAngle = Math.atan2(dy, dx);
        angles[0] = this.utilService.constrainAngle(
          targetAngle,
          angles[1],
          maxAngle
        );

        head.x += Math.cos(angles[0]) * 4; // Move head towards the limited angle
        head.y += Math.sin(angles[0]) * 4;
      }
    }

    // Update remaining joints
    for (let i = 1; i < joints.length; i++) {
      const prevJoint = joints[i - 1];
      const currentJoint = joints[i];

      const distance = Math.hypot(
        prevJoint.x - currentJoint.x,
        prevJoint.y - currentJoint.y
      );

      if (distance > jointLength) {
        const angle = Math.atan2(
          prevJoint.y - currentJoint.y,
          prevJoint.x - currentJoint.x
        );

        // this.angles[i] = angle;
        angles[i] = this.utilService.constrainAngle(
          angle,
          angles[i - 1],
          maxAngle
        );

        currentJoint.x =
          prevJoint.x - Math.cos(angles[i]) * jointLength;
        currentJoint.y =
          prevJoint.y - Math.sin(angles[i]) * jointLength;
      }
    }

    return joints;
  }
}
