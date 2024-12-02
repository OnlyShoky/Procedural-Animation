import { Injectable } from '@angular/core';
import { UtilsService, Vector } from './utils.service';

@Injectable({
  providedIn: 'root',
})

export class ChainService {
  joints: Vector[] = [];
  angles: number[] = [];
  linkSize!: number;
  angleConstraint!: number; // Max angle difference between adjacent joints

  constructor(private utils: UtilsService) {
    this.initChain(new Vector(0, 0), 0, 0, 2 * Math.PI);
  }

  /**
   * Initializes the chain with an origin, joint count, link size, and optional angle constraint.
   * @param origin Starting point of the chain.
   * @param jointCount Number of joints in the chain.
   * @param linkSize Space between joints.
   * @param angleConstraint Maximum allowable angle difference (default is 2π).
   */
  initChain(origin: Vector, jointCount: number, linkSize: number, angleConstraint = 2 * Math.PI): void {
    this.joints = [];
    this.angles = [];
    this.linkSize = linkSize;
    this.angleConstraint = angleConstraint;

    this.joints.push(origin.copy());
    this.angles.push(0);
    for (let i = 1; i < jointCount; i++) {
      const newJoint = Vector.add(this.joints[i - 1], new Vector(0, this.linkSize));
      this.joints.push(newJoint);
      this.angles.push(0);
    }
  }

  /**
   * Resolves the chain using the standard angle-based approach.
   * @param pos Position to move the first joint to.
   */
  resolve(pos: Vector): void {
    this.angles[0] = Vector.subtract(pos, this.joints[0]).heading();
    this.joints[0] = pos;

    for (let i = 1; i < this.joints.length; i++) {
      const curAngle = Vector.subtract(this.joints[i - 1], this.joints[i]).heading();
      this.angles[i] = this.utils.constrainAngle(curAngle, this.angles[i - 1], this.angleConstraint);
      this.joints[i] = Vector.subtract(this.joints[i - 1], Vector.fromAngle(this.angles[i]).setMagnitude(this.linkSize));
    }
  }

  /**
   * Resolves the chain using the FABRIK algorithm.
   * @param pos Position to move the first joint to (forward pass anchor).
   * @param anchor Position to anchor the last joint (backward pass anchor).
   */
  fabrikResolve(pos: Vector, anchor: Vector): void {
    // Forward pass
    this.joints[0] = pos;
    for (let i = 1; i < this.joints.length; i++) {
      this.joints[i] = this.utils.constrainDistance(this.joints[i], this.joints[i - 1], this.linkSize);
    }

    // Backward pass
    this.joints[this.joints.length - 1] = anchor;
    for (let i = this.joints.length - 2; i >= 0; i--) {
      this.joints[i] = this.utils.constrainDistance(this.joints[i], this.joints[i + 1], this.linkSize);
    }
  }

  /**
   * Displays the chain visually.
   * (Placeholder: Replace this with your Angular rendering logic.)
   */
  display(): void {
    console.log('Rendering chain:');
    for (let i = 0; i < this.joints.length - 1; i++) {
      const startJoint = this.joints[i];
      const endJoint = this.joints[i + 1];
      console.log(`Line from (${startJoint.x}, ${startJoint.y}) to (${endJoint.x}, ${endJoint.y})`);
    }

    console.log('Joints:');
    for (const joint of this.joints) {
      console.log(`Joint at (${joint.x}, ${joint.y})`);
    }
  }
}
