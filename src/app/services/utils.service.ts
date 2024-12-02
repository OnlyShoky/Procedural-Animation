import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {}

  /**
   * Constrain a vector to be at a certain range from the anchor.
   * @param pos Position vector to constrain.
   * @param anchor Anchor vector.
   * @param constraint Maximum distance from the anchor.
   * @returns The constrained vector.
   */
  constrainDistance(pos: Vector, anchor: Vector, constraint: number): Vector {
    const direction = Vector.subtract(pos, anchor).setMagnitude(constraint);
    return Vector.add(anchor, direction);
  }

  /**
   * Constrain the angle to be within a certain range of the anchor angle.
   * @param angle Current angle (in radians).
   * @param anchor Anchor angle (in radians).
   * @param constraint Maximum allowable angle difference (in radians).
   * @returns The constrained angle.
   */
  constrainAngle(angle: number, anchor: number, constraint: number): number {
    if (Math.abs(this.relativeAngleDiff(angle, anchor)) <= constraint) {
      return this.simplifyAngle(angle);
    }

    if (this.relativeAngleDiff(angle, anchor) > constraint) {
      return this.simplifyAngle(anchor - constraint);
    }

    return this.simplifyAngle(anchor + constraint);
  }

  /**
   * Calculate the relative angle difference between two angles.
   * @param angle Current angle (in radians).
   * @param anchor Anchor angle (in radians).
   * @returns The relative angle difference.
   */
  private relativeAngleDiff(angle: number, anchor: number): number {
    angle = this.simplifyAngle(angle + Math.PI - anchor);
    anchor = Math.PI;
    return anchor - angle;
  }

  /**
   * Simplify the angle to the range [0, 2π).
   * @param angle Angle in radians.
   * @returns Simplified angle in the range [0, 2π).
   */
  simplifyAngle(angle: number): number {
    const TWO_PI = 2 * Math.PI;
    while (angle >= TWO_PI) {
      angle -= TWO_PI;
    }
    while (angle < 0) {
      angle += TWO_PI;
    }
    return angle;
  }
}

/**
 * Helper class to represent a 2D vector.
 */
export class Vector {
  constructor(public x: number, public y: number) {}

  /**
   * Copy a vector.
   * @param v Vector to copy.
   * @returns The copied vector.
   */
  copy() : Vector {
    return new Vector(this.x, this.y);
  }

  /**
   * Subtract two vectors.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns The resulting vector.
   */
  static subtract(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * Add two vectors.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns The resulting vector.
   */
  static add(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * Set the magnitude of the vector.
   * @param magnitude Desired magnitude.
   * @returns The vector with the adjusted magnitude.
   */
  setMagnitude(magnitude: number): Vector {
    const currentMagnitude = this.magnitude();
    if (currentMagnitude === 0) {
      return new Vector(0, 0);
    }
    const scale = magnitude / currentMagnitude;
    return new Vector(this.x * scale, this.y * scale);
  }

  /**
   * Calculate the magnitude of the vector.
   * @returns The magnitude of the vector.
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

