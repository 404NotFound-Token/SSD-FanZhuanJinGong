import { Sprite } from 'cc';
import { UIOpacity } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { tween } from 'cc';
import { Tween } from 'cc';
import { camera_worldRotation } from '../Main/CameraCtrl';
import { Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HP')
export class HP extends Component {

    @property(UIOpacity)
    private uiopacity: UIOpacity = null;

    @property(Sprite)
    private bar: Sprite = null;

    max: number = 0;
    now: number = 0;

    private timer: number = 0;

    protected update(dt: number): void {
        this.timer += dt;
        if (this.timer >= 60 * 3) {
            this.uiopacity.opacity = 0;
        }
    }

    protected lateUpdate(dt: number): void {
        this.node.setWorldRotation(camera_worldRotation);
    }

    public initHP(hp: number, color: Color = Color.GREEN) {
        this.max = hp;
        this.now = hp;
        this.bar.color = color;
        this.uiopacity.opacity = 0;
        this.bar.fillRange = 1;
    }

    public subHP(num: number) {
        this.timer = 0
        this.uiopacity.opacity = 255;
        this.now -= num;
        this.bar.fillRange = this.now / this.max;
        if (this.now <= 0) {
            this.uiopacity.opacity = 0;
        }
    }
}


