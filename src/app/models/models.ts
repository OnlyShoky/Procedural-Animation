import { PVector, UtilsService, Vector } from "../services/utils.service";

export class ArmModel {
    

    utilService: UtilsService;
    joints: { x: number; y: number; size: number }[] = [];
  
    constructor(joints: { x: number; y: number; size: number }[]) {
      this.utilService = new UtilsService();
      this.joints = joints;
    }

    fabrikResolve(pos: PVector, anchor: PVector): void {
        // Forward pass
        this.joints[0].x = pos.x;
        this.joints[0].y = pos.y;
    
        for (let i = 1; i < this.joints.length; i++) {
          let jointPos = new Vector(this.joints[i].x, this.joints[i].y);
          const previousJointPos = new Vector(this.joints[i - 1].x, this.joints[i - 1].y);
          jointPos  = this.utilService.constrainDistance(jointPos, previousJointPos, this.joints[i].size-5);
    
          this.joints[i].x = jointPos.x;
          this.joints[i].y = jointPos.y;
        }
    
        // Backward pass
        this.joints[this.joints.length - 1].x = anchor.x;
        this.joints[this.joints.length - 1].y = anchor.y;
    
        for (let i = this.joints.length - 2; i >= 0; i--) {
          let jointPos = new Vector(this.joints[i].x, this.joints[i].y);
          const postJointPos = new Vector(this.joints[i +1].x, this.joints[i +1].y);
    
          jointPos = this.utilService.constrainDistance(jointPos, postJointPos,this.joints[i].size-5);
    
          this.joints[i].x = jointPos.x;
          this.joints[i].y = jointPos.y;
        }
      }

    
  }