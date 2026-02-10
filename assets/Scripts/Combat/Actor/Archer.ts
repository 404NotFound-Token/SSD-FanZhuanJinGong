import { _decorator, Component, Node } from 'cc';
import { Actor, ActorConfig, AnimationName } from './Actor';
import { Color } from 'cc';
import { GameManager } from '../../Main/GameManager';
import { OurActor } from './OurActor';
import { ObjectPool } from '../../Tools/ObjectPool';
import { tween } from 'cc';
import { director } from 'cc';
import { IEvent } from '../../Main/GameData';
import { EnemyTower, EnemyTowerLevel } from '../Tower/EnemyTower';
import { _lookAtY } from '../../Tools/Tools';
import { Vec3 } from 'cc';
import { Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Archer')
export class Archer extends Actor {

    @property(Node)
    private shootPoint: Node = null;

    @property(EnemyTower)
    private enemyTower: EnemyTower = null;

    private attackTarget: OurActor = null;

    protected onLoad(): void {
        this.actorConfig = new ActorConfig(10, 4, 10, 5, 0);
        this.isDie = false;
        this.initHP(this.actorConfig.hp, Color.RED);

        IEvent.on("EnemyTowerDestoy", this.onEnemyTowerDestoy, this)
    }

    private onEnemyTowerDestoy(enemyTower: EnemyTower) {
        if (enemyTower == this.enemyTower) {
            // this.destroy();
            this.beHurt(999)
        }
    }

    protected onDead(): void {
        this.isDie = true;
    }

    protected update(dt: number): void {
        if (this.isDie) return;
        this.attackTarget = GameManager.MainGame.findMinDisOurActor(this.node, this.actorConfig.range);
        if (this.attackTarget) {
            _lookAtY(this.node, this.attackTarget.node)
            this.playAni(AnimationName.弓箭攻击);
        } else {
            this.node.setWorldRotationFromEuler(0, -180, 0)
            this.playAni(AnimationName.待机);
        }
    }

    public onAttack() {
        const arrow = ObjectPool.GetPoolItem("Arrow", GameManager.MainGame.bulletParent, this.shootPoint.worldPosition)
        if (arrow && this.attackTarget) {
            arrow.lookAt(this.attackTarget.node.worldPosition)
            tween(arrow)
                .to(0.3, { worldPosition: this.attackTarget.node.worldPosition })
                .call(() => {
                    this.attackTarget && this.attackTarget.beHurt(this.actorConfig.attack)
                    this.attackTarget = null;
                    ObjectPool.PutPoolItem("Arrow", arrow);
                })
                .start();
        }
    }

}


