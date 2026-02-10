import { _decorator, Component, Node } from 'cc';
import { Collider } from 'cc';
import { RigidBody } from 'cc';
import { CombatSystem } from '../CombatSystem';
import { Vec3 } from 'cc';
import { Quat } from 'cc';
import { ITriggerEvent } from 'cc';
import { v3 } from 'cc';
import { _lookAtY } from '../../Tools/Tools';
import { SkeletalAnimation } from 'cc';
import { OurActor, OurActorType } from './OurActor';
import { GameManager } from '../../Main/GameManager';
import { Utils } from '../../Tools/Utils';
import { Animation } from 'cc';
import { GameState } from '../../Main/GameData';
const { ccclass, property } = _decorator;

export class ActorConfig {
    hp: number = 0;
    attack: number = 0;
    range: number = 0;
    speed: number = 0;
    attack_interval: number = 0;

    /**
     * @param hp 血量
     * @param attack 攻击力
     * @param range 范围
     * @param speed 速度
     * @param attack_interval 攻击间隔
     */
    constructor(hp: number, attack: number, range: number, speed: number, attack_interval: number) {
        this.hp = hp;
        this.attack = attack;
        this.range = range;
        this.speed = speed;
        this.attack_interval = attack_interval;
    }
}

export enum AnimationName {
    待机 = "Idle1",
    移动 = "Run1",
    剑斧攻击 = "IdleAttack1",
    弓箭攻击 = "IdleAttack2",
    死亡 = "Die",
    盾兵待机 = "Idle2",
    盾兵移动 = "Run2",
    盾兵攻击 = "IdleAttack3",
}

export enum Team { Enemy, Our }

@ccclass('Actor')
export class Actor extends CombatSystem {

    @property(RigidBody)
    protected rigidbody: RigidBody = null;

    @property(SkeletalAnimation)
    protected anim: SkeletalAnimation = null;

    public actorConfig: ActorConfig = null; //  Actor配置
    public canMove: boolean = false; // 是否可以移动
    public isReady: boolean = false; // 是否已经就绪

    protected idlePoint: Node = null; // 待机点
    protected path: Node[] = []; // 移动路径
    protected currentPathIndex: number = 0; // 当前路径索引
    protected moveTarget: Vec3 = null // 移动目标点
    protected isNeedGoToIdle: boolean = true;
    protected currentAnimation: AnimationName = AnimationName.待机;
    protected team: Team = Team.Our;
    /** 0空手 1斧 2剑 3盾 4弓  */
    protected _type: number = -1;

    protected _animation: Animation = null;

    protected onLoad(): void {
        this._animation = this.getComponent(Animation);
    }

    protected start(): void {
        if (this.collider) {
            this.collider.on('onTriggerEnter', this.onTriggerEnter, this)
            this.collider.enabled = false
        }
    }


    protected update(dt: number): void {
        if (GameManager.ins.gameState == GameState.Over) return;

        if (!this.canMove) {
            this.rigidbody.setLinearVelocity(Vec3.ZERO);
            return;
        }

        this.collider.enabled = this.isReady

        if (this.isReady) {
            this.moveToPath(dt)
            // const towerPos = this.checkTeamTower();
            return;
        }

        this.moveToIdle()
    }

    private moveToIdle(): void {
        try {
            if (this.idlePoint == null) {
                this.isReady = true;
                return
            }
            if (Vec3.distance(this.node.worldPosition, this.idlePoint.worldPosition) < 0.1) {
                // this.node.worldRotation = new Quat(0, 0, 0);
                if (this.team == Team.Enemy) {
                    this.node.setWorldRotationFromEuler(0, -180, 0);
                }
                if (this.team == Team.Our) {
                    this.node.setWorldRotationFromEuler(0, 0, 0);
                }
                this.rigidbody.setLinearVelocity(Vec3.ZERO);
                if (this._type == 3) {
                    this.playAni(AnimationName.盾兵待机);
                } else {
                    this.playAni(AnimationName.待机);
                }

            } else {
                if (this._type == 3) {
                    this.playAni(AnimationName.盾兵移动);
                } else {
                    this.playAni(AnimationName.移动);
                }
                this.rigidbody.setLinearVelocity(this.getSubDirForTarget(this.idlePoint.worldPosition).multiplyScalar(this.actorConfig.speed));
                _lookAtY(this.node, this.idlePoint);
            }
        } catch (error) {
            console.log(this.idlePoint)
            this.isReady = true;
        }

    }

    private moveToPath(dt: number) {
        if (this.isReady == false) return;
        if (this.path.length > 0 && this.currentPathIndex < this.path.length) {
            this.moveTarget = this.path[this.currentPathIndex].worldPosition;
            const allTowers = [...GameManager.MainGame.ourTowers, ...GameManager.MainGame.enemyTowers];
            const towers = this.team == Team.Enemy ? allTowers : GameManager.MainGame.ourTowers;
            for (let i = 0; i < towers.length; i++) {
                const tower = towers[i]
                if (Vec3.distance(this.moveTarget, tower.node.worldPosition) < 3) {
                    const dir = tower.leftOrRight ? 4 : -4;
                    const newPoint = new Vec3(tower.node.worldPosition.x + dir, this.node.worldPosition.y, tower.node.worldPosition.z);
                    this.moveTarget = newPoint;
                }
            }

            if (Vec3.distance(this.node.worldPosition, this.moveTarget) < 0.1) {
                this.currentPathIndex++;
            } else {

                if (this.team == Team.Enemy) {
                    if (this._type == 3) {
                        this.playAni(AnimationName.盾兵移动);
                    } else {
                        this.playAni(AnimationName.移动);
                    }
                }

                // this.rigidbody.setLinearVelocity(this.getSubDirForTarget(this.moveTarget).multiplyScalar(this.actorConfig.speed)); 

                let subDir = new Vec3();
                Vec3.subtract(subDir, this.moveTarget, this.node.worldPosition)
                Vec3.normalize(subDir, subDir)
                this.node.setWorldPosition(this.node.worldPosition.add(subDir.multiplyScalar(dt * this.actorConfig.speed)))
                _lookAtY(this.node, this.moveTarget);
            }
        } else {
            this.canMove = false;
            this.moveTarget = null;
            this.rigidbody.setLinearVelocity(Vec3.ZERO);

            if (this.team == Team.Enemy) {
                if (this._type == 3) {
                    this.playAni(AnimationName.盾兵待机);
                } else {
                    this.playAni(AnimationName.待机);
                }
            }
        }
        if (this.moveTarget) {
            _lookAtY(this.node, this.moveTarget);
        }
    }

    beHurt(damage: number): void {
        if (this.isDie) return;
        if (this._animation) {
            this._animation.play()
        }
        super.beHurt(damage);
        if (this.isDie) {
            this.onDead(); // 确保死亡动画播放
            this.playAni(AnimationName.死亡);
        }
    }

    protected playAni(aniName: AnimationName) {
        if (this.currentAnimation == aniName) return;
        this.currentAnimation = aniName;
        this.anim.play(aniName);

        if (aniName == AnimationName.死亡) {
            this.anim.once(SkeletalAnimation.EventType.FINISHED, (() => {
                this.node.destroy();
            }), this)
        }
    }

    private getSubDirForTarget(targetPos: Vec3): Vec3 {
        let subDir = new Vec3();
        Vec3.subtract(subDir, targetPos, this.node.worldPosition);
        Vec3.normalize(subDir, subDir);
        return subDir;
    }

    // protected checkTeamTower(): Vec3 {
    //     let towers = this.team == Team.Enemy ? GameManager.MainGame.enemyTowers : GameManager.MainGame.ourTowers;
    //     for (let i = 0; i < towers.length; i++) {
    //         let tower = towers[i];
    //         if (tower.node.active && Vec3.distance(this.node.worldPosition, tower.node.worldPosition) < 5) {
    //             return tower.node.worldPosition.clone()
    //         }
    //     }
    // }
}