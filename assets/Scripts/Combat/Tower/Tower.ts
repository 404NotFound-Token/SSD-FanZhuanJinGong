import { _decorator, Component, Node } from 'cc';
import { CombatSystem } from '../CombatSystem';
import { EventType, IEvent } from '../../Main/GameData';
import { SkeletalAnimation } from 'cc';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends CombatSystem {

    @property
    protected isMainCity: boolean = false;

    @property({ displayName: "是否可加载士兵" })
    protected isCanLoadActor: boolean = true;

    @property({ tooltip: "路径开始索引", visible: function () { return this.isCanLoadActor; } })
    protected startIndex: number = 0;

    @property({ displayName: "每批次加载数量", min: 1, visible: function () { return this.isCanLoadActor; } })
    protected loadNumebr: number = 6;

    @property({ displayName: "每批次加载间隔", min: 0.1, visible: function () { return this.isCanLoadActor; } })
    protected loadInterval: number = 0.3;

    @property({ displayName: "批次之间间隔", min: 3, visible: function () { return this.isCanLoadActor; } })
    protected batchInterval: number = 4;

    protected path: Node[] = [];

    @property({ type: [Node], visible: function () { return this.isCanLoadActor; } })
    protected idelPoints: Node[] = [];

    /** true 右边 ， false 左边 */
    @property
    leftOrRight: boolean = true;



    @property(Node)
    protected towerModel: Node = null;

    protected modelInitScale: Vec3 = null;

    protected onLoad(): void {
        IEvent.once(EventType.GameOver, () => {
            this.unscheduleAllCallbacks();
        });

        IEvent.once(EventType.Upgrade, () => {
            this.loadInterval = 0.3;
            this.batchInterval = 3;
        })

        this.modelInitScale = this.towerModel.scale.clone();
    }
}


