import { _decorator } from 'cc';
import { Actor, ActorConfig, AnimationName, Team } from './Actor';
// import { ObjectPool } from '../../Tools/ObjectPool';
import { GameManager } from '../../Main/GameManager';
import { director } from 'cc';
import { Gold } from '../../Main/Gold';
import { MathUtils } from '../../Tools/MathUtils';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Color } from 'cc';
import { Utils } from '../../Tools/Utils';
import { Node } from 'cc';
import { ObjectPool } from '../../Tools/ObjectPool';
import { ITriggerEvent } from 'cc';
import { ColliderGroup } from '../../Main/GameData';
import { OurActor } from './OurActor';
import { v3 } from 'cc';
import { math } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 敌方士兵
 */
@ccclass('EnemyActor')
export class EnemyActor extends Actor {
    // protected onTriggerEnter(e: ITriggerEvent): void {
    //     if (e.otherCollider.getGroup() === ColliderGroup.Our) {
    //         const ourActor = e.otherCollider.getComponent(OurActor);
    //         if (ourActor && ourActor.canHurt()) {
    //             // 对玩家单位造成伤害
    //             ourActor.beHurt(this.actorConfig.attack);

    //             // 如果玩家单位未死亡，则对其反击
    //             if (!ourActor.isDie) {
    //                 this.beHurt(ourActor.actorConfig.attack);
    //             }
    //         }
    //     }
    // }

    public startMove(path: Node[], startIndex: number, bol: boolean) {
        this.path = path;
        this.path.push(GameManager.MainGame.ourMainCity);
        this.currentPathIndex = startIndex;
        this.canMove = true;
        this.isReady = bol;
        // this.start_move();
    }

    public initEnemyActor(idlePoint?: Node) {
        this.actorConfig = new ActorConfig(10, 10, 0, 6, 0);
        this.isDie = false; // 初始化时确保不是死亡状态
        this.initHP(this.actorConfig.hp, Color.RED);
        GameManager.MainGame.allEnemyActors.push(this);
        // GameManager.MainGame.addActor(this);
        this.canMove = true;
        this.idlePoint = idlePoint;
        this._type = 0;
        this.team = Team.Enemy;

    }

    protected update(dt: number): void {
        if (this.isDie) {
            this.rigidbody.setLinearVelocity(Vec3.ZERO);
            return;
        }

        if (this.isReady) {
            GameManager.Player.setPlayerTarget(this.node);
        }

        const ourActor = this.checkOurActor();
        if (ourActor) {

        }
        super.update(dt);
    }

    beHurt(damage: number): void {
        super.beHurt(damage);
        if (this.isDie) {
            GameManager.MainGame._dropGold(this.node.worldPosition.clone());

            this.onDead(); // 确保死亡动画播放
            this.playAni(AnimationName.死亡);
        }
    }

    private checkOurActor(): OurActor {
        // const allTower = GameManager.MainGame.enemyTowers.
        for (let i = 0; i < GameManager.MainGame.allOurActors.length; i++) {
            const ourActor = GameManager.MainGame.allOurActors[i];
            if (ourActor.isDie) continue;
            if (!ourActor.isReady) continue;
            if (Vec3.distance(this.node.worldPosition, ourActor.node.worldPosition) < 1) {
                return ourActor;
            }
        }
        return null;
    }

    protected onDead(): void {
        if (this.isDie) return; // 防止重复执行
        if (this.collider) {
            this.collider.enabled = false;
        }
        this.isDie = true; // 确保死亡状态被设置
        director.emit("EnemyActorDead", this);
        GameManager.MainGame.dropGold(1, this.node);

        GameManager.Player.removePlayerTarget(this.node);
        const index = GameManager.MainGame.allEnemyActors.indexOf(this);
        if (index != -1) {
            GameManager.MainGame.allEnemyActors.splice(index, 1);
        }
    }


}


