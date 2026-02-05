import { CCBoolean } from 'cc';
import { Quat } from 'cc';
import { Vec3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

export let cameraToTarget_offset: Vec3 = new Vec3();
export let camera_worldRotation: Quat = new Quat();

@ccclass('CameraCtrl')
export class CameraCtrl extends Component {

    public static ins: CameraCtrl = null;

    @property(Node) target: Node = null;

    private isFollow: boolean = false;

    public set _isFollow(value: boolean) {
        this.isFollow = value;
    }

    public get _isFollow(): boolean {
        return this.isFollow;
    }

    onLoad() {
        CameraCtrl.ins = this;
        camera_worldRotation = this.node.worldRotation.clone();
        cameraToTarget_offset = this.node.worldPosition.clone().subtract(this.target.worldPosition.clone());
        // GameManager.CameraCtrl = this;
    }

    lateUpdate(dt: number) {
        if (this.isFollow) {
            const targetPos = this.target.worldPosition.clone();
            const cameraPos = targetPos.add(cameraToTarget_offset);
            this.node.setWorldPosition(cameraPos);
        }
    }
}


