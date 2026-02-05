import { _decorator, Component, Node } from 'cc';
import { HP } from './HP';
import { math } from 'cc';
import { Color } from 'cc';
import { Collider } from 'cc';
import { ITriggerEvent } from 'cc';
import { EventType, IEvent } from '../Main/GameData';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 战斗系统
 */
@ccclass('CombatSystem')
export class CombatSystem extends Component {

    @property(HP)
    hp: HP = null;

    @property(Collider)
    protected collider: Collider = null;

    /** 是否死亡 */
    isDie: boolean = false;
    isAttack: boolean = false;

    protected onLoad(): void {
        IEvent.once(EventType.GameOver, () => {
            console.log("游戏结束");
            Tween.stopAllByTarget(this);
            this.unscheduleAllCallbacks();
        });
    }

    protected start(): void {
        if (this.collider) {
            this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        }
    }

    protected onTriggerEnter(e: ITriggerEvent) {

    }

    initHP(HPNumber: number, color: Color) {
        this.hp.initHP(HPNumber, color);
    }

    beHurt(damage: number) {
        if (!this.hp) return;
        if (this.isDie) return;

        this.hp.subHP(damage);
        if (this.hp.now <= 0) {
            this.isDie = true;
            this.onDead();
        }
    }

    public canHurt(): boolean {
        return !this.isDie;
    }

    protected onDead(): void {

    }
}


