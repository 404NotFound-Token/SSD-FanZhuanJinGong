import { _decorator } from 'cc';
import { MainCity } from './MainCity';
import { ColliderGroup, EventType, IEvent } from '../../Main/GameData';
import { Color } from 'cc';
import { ITriggerEvent } from 'cc';
import { EnemyActor } from '../Actor/EnemyActor';
const { ccclass, property } = _decorator;

@ccclass('OurMainCity')
export class OurMainCity extends MainCity {

    protected onLoad(): void {
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    protected onTriggerEnter(e: ITriggerEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Enemy) {
            const enemyActor = e.otherCollider.node.getComponent(EnemyActor);
            this.beHurt(enemyActor.actorConfig.attack);
            enemyActor.beHurt(enemyActor.actorConfig.attack);
        }
    }

    protected start(): void {
        this.initHP(this.hpnumber, Color.GREEN)
    }

    protected onDead(): void {
        IEvent.emit(EventType.GameOver, false);
        this.node.active = false;
    }
}


