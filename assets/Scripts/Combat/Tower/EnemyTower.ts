import { _decorator, Node } from 'cc';
import { Tower } from './Tower';
import { GameManager } from '../../Main/GameManager';
import { ColliderGroup, EventType, GameState, IEvent } from '../../Main/GameData';
import { Collider } from 'cc';
import { ITriggerEvent } from 'cc';
import { Enum } from 'cc';
import { ObjectPool } from '../../Tools/ObjectPool';
import { EnemyActor } from '../Actor/EnemyActor';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Color } from 'cc';
import { find } from 'cc';
import { SkeletalAnimation } from 'cc';
import { director } from 'cc';
import { _lookAtY } from '../../Tools/Tools';
import { AudioManager } from '../../Common/AudioManager';
import { v3 } from 'cc';
import { OurActor, OurActorType } from '../Actor/OurActor';
import { Effect } from '../../Tools/Effect';
const { ccclass, property } = _decorator;

export enum EnemyTowerLevel {
    Level1 = 1,
    Level2,
    Level3,
}

/**
 * 敌方塔
 */
@ccclass('EnemyTower')
export class EnemyTower extends Tower {

    @property({ type: Enum(EnemyTowerLevel) })
    private level: EnemyTowerLevel = EnemyTowerLevel.Level1;

    @property(Collider)
    protected checkCollider: Collider = null; // 检测碰撞器 检测OurActor是否进入范围

    @property([Node])
    private bulletPoints: Node[] = [];

    @property
    private attackRange: number = 10;

    @property
    private attackInterval: number = 1;

    @property
    private attackDamage: number = 10;

    @property(Node)
    private towerHead: Node = null;

    @property(Node)
    private yanwu: Node = null;

    @property(SkeletalAnimation)
    protected anim: SkeletalAnimation = null;

    private isLoaded: boolean = false;

    private batchCount: number = 0; // 记录每批次加载的士兵数量
    private batchActors: EnemyActor[] = []; // 缓存每批次加载的士兵

    protected onLoad(): void {
        IEvent.on(EventType.GameStart, this.onGameStart, this);
        GameManager.MainGame.enemyTowers.push(this);
    }

    private onGameStart() {
        this.initHP(this.level * 100, Color.RED);

        if (this.level != EnemyTowerLevel.Level1) {
            this.batchActors = [];
            this.batchCount = 0;
            for (let i = 0; i < this.loadNumebr; i++) {
                this.scheduleOnce(() => {
                    const enemyActor = ObjectPool.GetPoolItem("EnemyActor", GameManager.MainGame.actorParent, this.node.worldPosition);
                    const enemyActorComp = enemyActor.getComponent(EnemyActor);
                    enemyActorComp.initEnemyActor(this.idelPoints[i]);
                    // enemyActorComp.belong_owner = this.node;
                    enemyActorComp.startMove(GameManager.MainGame.enemyPath, this.startIndex, false);
                    this.batchCount++;
                    this.batchActors.push(enemyActorComp);
                }, i * this.loadInterval);
            }
        }
    }

    protected start(): void {
        this.checkCollider.on('onTriggerEnter', this.onCheck, this);

        this.schedule(() => {
            if (GameManager.GameManager.gameState == GameState.Over) return;
            this.attack();
        }, this.attackInterval);
    }

    private attack() {
        if (this.bulletPoints.length <= 0) {
            return;
        }
        if (this.level == EnemyTowerLevel.Level1) return;
        if (this.isDie) return;

        for (let i = 0; i < this.bulletPoints.length; i++) {
            this.scheduleOnce(() => {
                // const attackTar = GameManager.MainGame.findMinDisOurActor(this.node, this.attackRange);
                const attackTar = this.getAttack();
                if (attackTar == null) return;
                console.log(this.node.name, "攻击")
                if (this.towerHead) {
                    // _lookAtY(this.towerHead, attackTar.node.worldPosition)
                    this.towerHead.lookAt(v3(attackTar.node.worldPosition.x, this.towerHead.worldPosition.y, attackTar.node.worldPosition.z))
                }
                AudioManager.soundPlay("电机枪")
                const bullet = ObjectPool.GetPoolItem("RedBullet", GameManager.MainGame.bulletParent, this.bulletPoints[i].worldPosition)
                bullet.lookAt(attackTar.node.worldPosition);
                tween(bullet)
                    .to(0.2, { worldPosition: attackTar.node.worldPosition.clone() })
                    .call(() => {
                        attackTar.beHurt(this.attackDamage);
                        ObjectPool.PutPoolItem("RedBullet", bullet);
                    })
                    .start();
            }, i * 0.1)
        }
    }

    private getAttack(): OurActor {
        const onRangeOurActor: OurActor[] = [];

        // 在攻击范围内的OurActor
        let minDis = Number.MAX_VALUE;
        let minDisActor: OurActor = null;

        for (let i = 0; i < GameManager.MainGame.allOurActors.length; i++) {
            const ourActor = GameManager.MainGame.allOurActors[i];

            const dis = Vec3.distance(ourActor.node.worldPosition, this.node.worldPosition);
            if (dis > this.attackRange) continue;
            if (dis < minDis) {
                minDis = dis;
                minDisActor = ourActor;
            }

            onRangeOurActor.push(ourActor);
        }

        // 优先盾兵
        for (let i = 0; i < onRangeOurActor.length; i++) {
            const ourActor = onRangeOurActor[i];
            if (ourActor.ourActorType == OurActorType.Shield) {
                return ourActor;
            }
        }
        return minDisActor;
    }

    private onCheck(e: ITriggerEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Our) {

            if (this.isLoaded) return;
            this.isLoaded = true;
            GameManager.Player.setPlayerTarget(this.node);

            if (this.level == EnemyTowerLevel.Level1) {
                for (let i = 0; i < this.loadNumebr; i++) {
                    this.scheduleOnce(() => {
                        const enemyActor = ObjectPool.GetPoolItem("EnemyActor", GameManager.MainGame.actorParent, GameManager.MainGame.enemyMainCity.worldPosition);
                        const enemyActorComp = enemyActor.getComponent(EnemyActor);
                        // enemyActorComp.belong_owner = this.node;
                        enemyActorComp.initEnemyActor();
                        enemyActorComp.startMove(GameManager.MainGame.enemyPath, this.startIndex, true);
                    }, i * this.loadInterval)
                }

                GameManager.GameManager.schedule(() => {
                    console.log("level1加载小兵");
                    for (let i = 0; i < this.loadNumebr; i++) {
                        this.scheduleOnce(() => {
                            const enemyActor = ObjectPool.GetPoolItem("EnemyActor", GameManager.MainGame.actorParent, GameManager.MainGame.enemyMainCity.worldPosition);
                            const enemyActorComp = enemyActor.getComponent(EnemyActor);
                            // enemyActorComp.belong_owner = this.node;
                            enemyActorComp.initEnemyActor();
                            enemyActorComp.startMove(GameManager.MainGame.enemyPath, this.startIndex, true);
                        }, i * this.loadInterval)
                    }
                }, 10)
                // }, this.batchInterval)
            }

            // level2和3会直接加载小兵
            if (this.level == EnemyTowerLevel.Level2 || this.level == EnemyTowerLevel.Level3) {
                for (let i = 0; i < this.batchActors.length; i++) {
                    const enemyActor = this.batchActors[i];
                    enemyActor.scheduleOnce(() => {
                        enemyActor.isReady = true;
                    }, i * this.loadInterval)
                }

                this.schedule(() => {
                    if (GameManager.GameManager.gameState == GameState.Over) return;
                    this.loadEnemyActor();
                }, this.batchInterval)
            }
        }
    }


    private loadEnemyActor() {
        this.batchActors = [];
        this.batchCount = 0;

        for (let i = 0; i < this.loadNumebr; i++) {
            this.scheduleOnce(() => {
                const enemyActor = ObjectPool.GetPoolItem("EnemyActor", GameManager.MainGame.actorParent, this.node.worldPosition);
                const enemyActorComp = enemyActor.getComponent(EnemyActor);
                enemyActorComp.initEnemyActor(this.idelPoints[i]);
                enemyActorComp.startMove(GameManager.MainGame.enemyPath, this.startIndex, false);
                this.batchCount++;
                this.batchActors.push(enemyActorComp);

                if (this.batchCount == this.loadNumebr) {
                    this.scheduleOnce(() => {
                        for (let i = 0; i < this.batchActors.length; i++) {
                            const _enemyActor = this.batchActors[i];
                            _enemyActor.scheduleOnce(() => {
                                _enemyActor.isReady = true;
                            }, i * this.loadInterval)
                        }
                    }, this.batchInterval * 0.1)
                }
            }, i * this.loadInterval);
        }
    }

    beHurt(damage: number): void {
        if (this.isDie) return;
        this.node.scale = Vec3.ONE
        Effect.scaleInEffect1(this.node, 0.1, 1).start()
        super.beHurt(damage);
        if (this.hp.now <= 0) {
            this.isDie = true;

            if (this.towerHead) {
                this.towerHead.active = false;
            }
            AudioManager.soundPlay("受击")
            this.anim.play("Destoy")
            this.yanwu.active = true;
            this.anim.once(SkeletalAnimation.EventType.FINISHED, (() => {
                this.node.destroy();
            }), this)
        }
    }


    protected onDead(): void {
        IEvent.emit("EnemyTowerDestoy", this.level)
        GameManager.Player.removePlayerTarget(this.node);

        if (this.batchActors.length > 0) {
            for (let i = 0; i < this.batchActors.length; i++) {
                const _enemyActor = this.batchActors[i];
                _enemyActor.isReady = true;
                // _enemyActor.scheduleOnce(() => {

                // }, i * this.loadInterval)
            }
        }

        if (this.level == EnemyTowerLevel.Level1) {
            find("Main/Landmarks/Landmark2").active = true;
        }
        if (this.level == EnemyTowerLevel.Level2) {
            find("Main/Landmarks/Landmark3").active = true;
        }
        if (this.level == EnemyTowerLevel.Level3) {
            find("Main/Landmarks/Landmark4").active = true;
            find("Main/Landmarks/Landmark5").active = true;
            find("Main/Landmarks/Landmark6").active = true;
        }

        GameManager.MainGame.dropGold(this.level * 10, this.node);

        if (GameManager.MainGame.enemyTowers.indexOf(this) != -1) {
            GameManager.MainGame.enemyTowers.splice(GameManager.MainGame.enemyTowers.indexOf(this), 1);
        }

        // this.node.destroy();
    }


}
