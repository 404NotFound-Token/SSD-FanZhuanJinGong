import { ITriggerEvent } from 'cc';
import { Collider } from 'cc';
import { _decorator, Component } from 'cc';
import { ColliderGroup } from './GameData';
import { Label } from 'cc';
import { GameManager } from './GameManager';
import { ObjectPool } from '../Tools/ObjectPool';
import { TransformUtils } from '../Tools/TransformUtils';
import { director } from 'cc';
import { Vec3 } from 'cc';
import { math } from 'cc';
import { v3 } from 'cc';
import { tween } from 'cc';
import { Utils } from '../Tools/Utils';
import { EventHandler } from 'cc';
import { Enum } from 'cc';
import { OurActorType } from '../Combat/Actor/OurActor';
import { Animation } from 'cc';
import { Material } from 'cc';
import { MeshRenderer } from 'cc';
import { AudioManager } from '../Common/AudioManager';
import { Sprite } from 'cc';
import { Color } from 'cc';
import { Guide } from './Guide';
const { ccclass, property } = _decorator;

@ccclass('LandmarkEvent')
export class LandmarkEvent {
    @property({ type: EventHandler })
    event: EventHandler = new EventHandler();
    @property({ displayName: "是否延迟触发" })
    delay_emit: boolean = false;
    @property({ displayName: "延迟时间", visible: function (this) { return this.delay_emit } })
    delay_time: number = 0;

    trigger() {
        if (this.delay_emit) {
            const timer = setTimeout(() => {
                clearTimeout(timer);
                this.event.emit([this]);
            }, this.delay_time);
        } else {
            this.event.emit([this]);
        }
    }
}

/**
 * 地贴
 */
@ccclass('Landmark')
export class Landmark extends Component {

    @property({ displayName: '是否一次性' })
    private bol: boolean = false;

    @property({ displayName: '需要的数量' })
    public needNumber: number = 0;

    @property(Label)
    private label: Label = null;

    @property(Sprite)
    private fillrange: Sprite = null;

    @property(Sprite)
    private bk: Sprite = null;

    @property({ type: [LandmarkEvent], displayName: '事件', visible: function (this) { return this.bol } })
    private events: LandmarkEvent[] = [];

    @property({ type: Enum(OurActorType), displayName: "ourActorType", visible: function (this) { return !this.bol } })
    private ourActorType: OurActorType = OurActorType.Axe;

    // 当前真实数量
    public nowNumber: number = 0;
    // 当前记录数量
    public _nowNumber: number = 0;

    private collider: Collider = null;

    private animation: Animation = null;

    protected onLoad(): void {
        this.collider = this.getComponent(Collider);
        this.animation = this.getComponent(Animation);
        this.label.string = this.needNumber.toString();

        this.fillrange.fillRange = 0;
    }

    protected start(): void {
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.collider.on('onTriggerStay', this.onTriggerStay, this);
        this.collider.on('onTriggerExit', this.onTriggerExit, this);

        Guide.ins.landmarks.push(this);
    }

    protected lateUpdate(dt: number): void {
        this.fillrange.fillRange = this.nowNumber / this.needNumber;
    }

    private onTriggerEnter(e: ITriggerEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Player) {
            GameManager.Player.bag.canAddToBag = false;
            this.bk.color = Color.GREEN;
            // this.node.getChildByName("框").getComponent(MeshRenderer).material.passes[0]
        }
    }

    private onTriggerStay(e: ITriggerEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Player) {
            const goldBag = GameManager.Player.bag;
            if (this._nowNumber < this.needNumber && goldBag.returnItemLength() > 0) {
                this._nowNumber++;
                const gold = goldBag.lastItem();
                goldBag.directRemove(gold);
                TransformUtils.changeParent(gold, director.getScene());

                const startPos = gold.node.worldPosition.clone();
                let endPos = this.node.worldPosition.clone();
                const xOffset = Utils.randomRange(-1, 1);
                const yOffset = Utils.randomRange(-1, 1);
                endPos.x += xOffset;
                endPos.y += yOffset;
                const ctrlPos = new Vec3(
                    endPos.x,
                    startPos.y + 3,
                    endPos.z
                );
                const rot = this.node.worldRotation.clone();
                let euler = math.random() * 360;

                const t1 = tween(gold.node).bezierTo3D(0.5, startPos, ctrlPos, endPos);
                const t2 = tween(gold.node).to(0.5, { eulerAngles: v3(euler, euler, euler) });
                tween(gold.node)
                    .parallel(t1, t2)
                    .call(() => {
                        tween(gold.node)
                            .to(0.2, { worldPosition: this.node.worldPosition.clone() })
                            .call(() => {
                                AudioManager.soundPlay("setProp")
                                gold.node.worldRotation = rot;
                                // ObjectPool.PutPoolItem("Gold", gold.node);
                                gold.node.destroy();
                                this.animation.play();

                                this.label.string = (this.needNumber - this._nowNumber).toString();
                                this.nowNumber += 1;
                                if (this.nowNumber >= this.needNumber) {
                                    this.events.forEach(e => {
                                        console.log("触发事件", e);
                                        e.trigger();
                                    });
                                    this.node.active = false;
                                }
                            })
                            .start();
                    })
                    .start();

            }
        }
    }

    private onTriggerExit(e: ITriggerEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Player) {
            GameManager.Player.bag.canAddToBag = true;
            this.bk.color = Color.WHITE;
        }
    }
}


