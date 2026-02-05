import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ObjectPool } from '../Tools/ObjectPool';
import { Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { Tween } from 'cc';
import { AudioManager } from '../Common/AudioManager';
import { Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Gold')
export class Gold extends Component {

    public canCheck = false;

    private checkRange: number = 5;

    // private checkDelay: Tween<Node> = null

    public animation: Animation = null

    onLoad(): void {
        this.animation = this.getComponent(Animation);
    }

    // public check() {
        
    //     this.checkDelay = tween(this.node)
    //         .delay(30)
    //         .call(() => {
    //             // ObjectPool.PutPoolItem("Gold", this.node);
    //             this.node.destroy();
    //         })
    //         .start();
    // }

    protected update(dt: number): void {
        if (this.canCheck == false) {
            return
        }

        const bol = Vec3.distance(this.node.worldPosition, GameManager.Player.node.worldPosition) < this.checkRange;
        if (bol) {
            const goldBag = GameManager.Player.bag;
            const isCanAddToBag = goldBag.canAddToBag;
            if (!isCanAddToBag) return;
            // this.checkDelay.stop();
            this.canCheck = false;
            this.animation.stop();
            this.node.getChildByName("金币").setRotationFromEuler(0, 0, 0)
            this.node.getChildByName("金币").setPosition(0, 0, 0)


            goldBag.add(this
                ,
                (success) => {
                    if (success) {
                        AudioManager.soundPlay('get');
                    }
                }
            )
        }
    }
}


