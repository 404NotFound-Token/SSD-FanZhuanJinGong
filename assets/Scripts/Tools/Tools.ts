import { Vec3 } from "cc";
import { Node } from "cc";

/**
 * 
 * @param current 
 * @param target 
 * @param factor 
 * @returns 
 */
export function lerpAngle(current: number, target: number, factor: number): number {
    let delta = target - current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return current + delta * factor;
}

/**
 * 只旋转Y轴
 * a look at b
 * @param a 
 * @param b 
 */
export function _lookAtY(a: Node, b: Node | Vec3) {
    if (a && b) {
        let pos: Vec3 = new Vec3();
        if (b instanceof Node) {
            pos = b.worldPosition;
        } else {
            pos = b;
        }
        a.lookAt(pos, Vec3.UP);
        const _angles = a.eulerAngles.clone();
        a.eulerAngles = new Vec3(0, _angles.y, 0);
    }
}