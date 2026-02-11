import { _decorator, Node } from 'cc';
import { Tower } from './Tower';
import { GameManager } from '../../Main/GameManager';
import { EventType, GameData, GameState, IEvent } from '../../Main/GameData';
import { Enum } from 'cc';
import { ObjectPool } from '../../Tools/ObjectPool';
import { EnemyActor } from '../Actor/EnemyActor';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Color } from 'cc';
import { find } from 'cc';
import { SkeletalAnimation } from 'cc';
import { _lookAtY } from '../../Tools/Tools';
import { AudioManager } from '../../Common/AudioManager';
import { v3 } from 'cc';
import { OurActor } from '../Actor/OurActor';
import { Effect } from '../../Tools/Effect';
import { ParticleSystem } from 'cc';
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

    @property({ type: [Node], visible: function (): boolean { return this.level !== EnemyTowerLevel.Level1 } })
    private bulletPoints: Node[] = [];

    @property({ visible: function (): boolean { return this.level !== EnemyTowerLevel.Level1 }, displayName: "攻击范围" })
    private attackRange: number = 10;

    @property({ visible: function (): boolean { return this.level !== EnemyTowerLevel.Level1 }, displayName: "攻击间隔" })
    private attackInterval: number = 1;

    @property({ visible: function (): boolean { return this.level !== EnemyTowerLevel.Level1 }, displayName: "攻击伤害" })
    private attackDamage: number = 10;

    @property({ type: Node, visible: function (): boolean { return this.level !== EnemyTowerLevel.Level1 } })
    private towerHead: Node = null;

    @property(ParticleSystem)
    private yanwu: ParticleSystem = null;

    @property(SkeletalAnimation)
    protected anim: SkeletalAnimation = null;

    @property
    private scalemult: number = 1;

    @property
    private hpnum: number = 0;

    private isLoaded: boolean = false;

    private batchCount: number = 0; // 记录每批次加载的士兵数量
    private batchActors: EnemyActor[] = []; // 缓存每批次加载的士兵

    protected onLoad(): void {
        IEvent.on(EventType.GameStart, this.onGameStart, this);
        GameManager.MainGame.enemyTowers.push(this);
        GameData.isRun = false
    }

    private onGameStart() {
        this.initHP(this.hpnum, Color.RED);

        if (this.level == EnemyTowerLevel.Level2 || this.level == EnemyTowerLevel.Level3) {
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
        // if (this.checkCollider) {
        //     this.checkCollider.on('onTriggerEnter', this.onCheck, this);
        // }

        IEvent.once("EnemyRun", this.onCheck, this)

        this.schedule(() => {
            if (GameManager.ins.gameState == GameState.Over) return;
            this.attack();
        }, this.attackInterval);
    }

    private attack() {
        if (this.bulletPoints.length <= 0) {
            return;
        }
        if (this.level == EnemyTowerLevel.Level1) return;
        if (this.isDie) return;

        const attackTars = this.getAttack(this.bulletPoints.length);
        if (attackTars.length <= 0) return;

        for (let i = 0; i < attackTars.length; i++) {
            this.scheduleOnce(() => {
                const attackTar = attackTars[i];
                if (this.towerHead) {
                    this.towerHead.lookAt(v3(attackTar.node.worldPosition.x, this.towerHead.worldPosition.y, attackTar.node.worldPosition.z))
                }
                const bullet = ObjectPool.GetPoolItem("RedBullet", GameManager.MainGame.bulletParent, this.bulletPoints[i].worldPosition)
                const effect = ObjectPool.GetPoolItem("枪口火焰", GameManager.MainGame.bulletParent, this.bulletPoints[i].worldPosition)
                this.scheduleOnce(() => {
                    effect.destroy();
                }, 0.1)
                bullet.lookAt(attackTar.node.worldPosition);
                tween(bullet)
                    .to(0.2, { worldPosition: attackTar.node.worldPosition.clone() })
                    .call(() => {
                        const effect = ObjectPool.GetPoolItem("红受击", GameManager.MainGame.bulletParent, attackTar.node.worldPosition)
                        this.scheduleOnce(() => {
                            effect.destroy();
                        }, 0.1)
                        attackTar.beHurt(this.attackDamage);
                        ObjectPool.PutPoolItem("RedBullet", bullet);
                    })
                    .start();
            }, 0.1 * i)

        }
    }

    private getAttack(num: number): OurActor[] {
        const onRangeOurActor: OurActor[] = [];

        // 在攻击范围内的OurActor
        for (let i = 0; i < GameManager.MainGame.allOurActors.length; i++) {
            const ourActor = GameManager.MainGame.allOurActors[i];

            const dis = Vec3.distance(ourActor.node.worldPosition, this.node.worldPosition);
            if (dis > this.attackRange) continue;

            onRangeOurActor.push(ourActor);
        }

        // 按距离排序，最近的在前面
        onRangeOurActor.sort((a, b) => {
            const distA = Vec3.distance(a.node.worldPosition, this.node.worldPosition);
            const distB = Vec3.distance(b.node.worldPosition, this.node.worldPosition);
            return distA - distB;
        });

        // 返回前num个单位
        return onRangeOurActor.slice(0, num);
    }

    private onCheck() {

        if (this.isLoaded) return;
        this.isLoaded = true;
        GameManager.Player.setPlayerTarget(this.node);

        // 主基地刷兵----------
        if (this.level == EnemyTowerLevel.Level1) {

            // 初始立即加载一波
            for (let i = 0; i < this.loadNumebr; i++) {
                this.scheduleOnce(() => {
                    const enemyActor = ObjectPool.GetPoolItem("EnemyActor", GameManager.MainGame.actorParent, GameManager.MainGame.enemyMainCity.worldPosition);
                    const enemyActorComp = enemyActor.getComponent(EnemyActor);
                    enemyActorComp.initEnemyActor();
                    enemyActorComp.startMove(GameManager.MainGame.enemyPath, this.startIndex, true);
                }, i * 0.5)
            }


            // 定时加载
            GameManager.ins.schedule(() => {
                for (let i = 0; i < this.loadNumebr; i++) {
                    this.scheduleOnce(() => {
                        const enemyActor = ObjectPool.GetPoolItem("EnemyActor", GameManager.MainGame.actorParent, GameManager.MainGame.enemyMainCity.worldPosition);
                        const enemyActorComp = enemyActor.getComponent(EnemyActor);
                        enemyActorComp.initEnemyActor();
                        enemyActorComp.startMove(GameManager.MainGame.enemyPath, this.startIndex, true);
                    }, i * 0.5)
                }
            }, 6)
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
                if (GameManager.ins.gameState == GameState.Over) return;
                this.loadEnemyActor();
            }, this.batchInterval)
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
        // Effect.scaleInEffect1(this.towerModel, 0.1, 1).start()
        this.towerModel.scale = Vec3.ONE
        Effect.scaleInEffect(this.towerModel, this.scalemult, 0.1, 1).start();
        super.beHurt(damage);
        if (this.hp.now <= 0) {
            this.isDie = true;

            if (this.towerHead) {
                this.towerHead.active = false;
            }
            AudioManager.soundPlay("受击")
            this.anim.play("Destoy")
            this.yanwu.node.active = true;
            this.anim.once(SkeletalAnimation.EventType.FINISHED, (() => {
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 0.5)
            }), this)
        }
    }


    protected onDead(): void {
        IEvent.emit("EnemyTowerDestoy", this)
        GameManager.Player.removePlayerTarget(this.node);

        if (this.batchActors.length > 0) {
            for (let i = 0; i < this.batchActors.length; i++) {
                const _enemyActor = this.batchActors[i];
                _enemyActor.isReady = true;
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
