import { _decorator } from 'cc';
import { Vec3 } from 'cc';
import { _lookAtY, lerpAngle } from '../Tools/Tools';
import { ObjectPool } from '../Tools/ObjectPool';
import { Node } from 'cc';
import { v3 } from 'cc';
import { Component } from 'cc';
import { RigidBody } from 'cc';
import { Collider } from 'cc';
import { Bag } from '../Main/Bag';
import { camera_worldRotation } from '../Main/CameraCtrl';
import { IEvent, EventType } from '../Main/GameData';
import { GameManager } from '../Main/GameManager';
import { Gold } from '../Main/Gold';
import { Joystick } from '../Main/Joystick';
import { CombatSystem } from './CombatSystem';
import { tween } from 'cc';
import { isValid } from 'cc';
import { CapsuleCharacterController } from 'cc';
import { SkeletalAnimation } from 'cc';
import { AudioManager } from '../Common/AudioManager';
const { ccclass, property } = _decorator;

export enum PlayerState {
    None = "None",
    Idle = "Idle",
    Run = "Run",
    Attack = "Attack",
    RunAttack = "RunAttack",
}

export class PlayerConfig {
    speed: number;
    attack_power: number;
    attack_interval: number;
    attack_range: number;

    /**
     * @param speed 移动速度
     * @param attack_power 攻击力
     * @param attack_interval 攻击间隔
     * @param attack_range 攻击范围
     */
    constructor(speed: number, attack_power: number, attack_interval: number, attack_range: number) {
        this.speed = speed;
        this.attack_power = attack_power;
        this.attack_interval = attack_interval;
        this.attack_range = attack_range;
    }
}

@ccclass('Player')
export class Player extends Component {

    @property(Joystick)
    private joystick: Joystick = null;

    @property(Bag)
    public bag: Bag<Gold> = null;

    @property(Node)
    public shootPoint: Node = null;

    @property(Node)
    public bulletParent: Node = null;

    @property(SkeletalAnimation)
    private animation: SkeletalAnimation = null;

    @property(Node)
    public shootEffect: Node = null;

    private rotationSpeed: number = 10;
    private moveDirection: Vec3 = new Vec3();
    private cameraForward: Vec3 = new Vec3();
    private cameraRight: Vec3 = new Vec3();
    private velocity: Vec3 = new Vec3();
    private currentState: PlayerState = PlayerState.Idle;

    /** 是否可以移动 */
    private canMove: boolean = false;
    public set CanMove(value: boolean) { this.canMove = value; }
    public get CanMove(): boolean { return this.canMove; }

    /** 玩家状态 */
    private state: PlayerState = PlayerState.None;
    /** 玩家攻击目标 */
    private playerTargets: Node[] = [];
    /** 玩家数值配置 */
    private playerData: PlayerConfig = null;

    /** 子弹速度 */
    private bulletSpeed: number = 30;

    private ccc: CapsuleCharacterController = null;

    protected onLoad(): void {
        GameManager.Player = this;
        this.ccc = this.node.getComponent(CapsuleCharacterController);
        this.playerData = new PlayerConfig(6, 10, 1, 10);
        IEvent.on(EventType.GameStart, this.onGameStart, this);
    }

    private onGameStart() {
        for (let i = 0; i < 10; i++) {
            const gold = ObjectPool.GetPoolItem("Gold", this.bag.node);
            const goldComp = gold.getComponent(Gold);
            this.bag.directAdd(goldComp);
        }
    }

    update(deltaTime: number) {
        if (!this.canMove) return;

        const hasTarget = this.getMinDistanceTarget();

        const joystickComp = this.joystick.getComponent(Joystick);
        const joystickDir = joystickComp.direction;
        this.moveDirection.set(Vec3.ZERO);

        if (joystickDir.length() > 0.1) {
            Vec3.transformQuat(this.cameraForward, Vec3.FORWARD, camera_worldRotation);
            this.cameraForward.y = 0;
            this.cameraForward.normalize();

            Vec3.transformQuat(this.cameraRight, Vec3.RIGHT, camera_worldRotation);
            this.cameraRight.y = 0;
            this.cameraRight.normalize();

            Vec3.scaleAndAdd(this.moveDirection, this.moveDirection, this.cameraForward, joystickDir.y);
            Vec3.scaleAndAdd(this.moveDirection, this.moveDirection, this.cameraRight, joystickDir.x);

            this.moveDirection.normalize();

            if (hasTarget) {
                _lookAtY(this.node, hasTarget.worldPosition);
                this.playAni(PlayerState.RunAttack)

            } else {
                let targetAngle: number;
                targetAngle = Math.atan2(this.moveDirection.x, this.moveDirection.z) * 180 / Math.PI - 180;

                const currentAngle = this.node.eulerAngles.y;
                let newAngle = lerpAngle(currentAngle, targetAngle, this.rotationSpeed * deltaTime);

                this.node.setRotationFromEuler(0, newAngle, 0);
                this.playAni(PlayerState.Run)
            }
            this.ccc.move(this.moveDirection.clone().multiplyScalar(this.playerData.speed * deltaTime));
        }
        else {
            if (hasTarget) {
                _lookAtY(this.node, hasTarget.worldPosition);
                this.playAni(PlayerState.Attack)
            } else {
                this.playAni(PlayerState.Idle)
            }
            this.ccc.move(Vec3.ZERO);
        }
    }

    public shootBullet() {

        const attackTarget = this.getMinDistanceTarget();
        if (attackTarget) {
            AudioManager.soundPlay("打枪");
            this.lookAtTarget(attackTarget.worldPosition);

            const bullet = ObjectPool.GetPoolItem("BuleBullet", this.bulletParent, this.shootPoint.worldPosition);
            bullet.scale = v3(1, 1, 1);
            _lookAtY(bullet, attackTarget.worldPosition);

            const subDis = new Vec3();
            Vec3.subtract(subDis, v3(attackTarget.worldPosition.x, this.shootPoint.worldPosition.y, attackTarget.worldPosition.z), this.shootPoint.worldPosition);
            const direction = subDis.clone().normalize();
            const distance = subDis.length();
            const duration = distance / this.bulletSpeed;

      this.shootEffect.active = false;
            this.shootEffect.active = true;
      

            tween(bullet)
                .by(duration, {
                    position: direction.multiplyScalar(distance)
                }, {
                    easing: 'linear',
                    onComplete: () => {
                        ObjectPool.PutPoolItem("BuleBullet", bullet);
                        if (attackTarget && attackTarget.isValid) {
                            const effect = ObjectPool.GetPoolItem("蓝受击", this.bulletParent, v3(attackTarget.worldPosition.x, 0.5, attackTarget.worldPosition.z))
                            attackTarget.getComponent(CombatSystem)?.beHurt(this.playerData.attack_power);
                            this.scheduleOnce(() => {
                                effect.destroy();
                            }, 0.2)
                        }
                    }
                })
                .start();
        }
    }

    /**
     * 朝向指定目标
     * @param targetWorldPos 目标世界坐标
     */
    private lookAtTarget(targetWorldPos: Vec3): void {
        const direction = new Vec3();
        Vec3.subtract(direction, targetWorldPos, this.node.worldPosition);
        direction.y = 0; // 保持Y轴不变

        if (direction.length() > 0.1) {
            const targetAngle = Math.atan2(direction.x, direction.z) * 180 / Math.PI - 180;
            this.node.setRotationFromEuler(0, targetAngle, 0);
        }
    }

    public setPlayerTarget(target: Node) {
        if (target == null || target == undefined || isValid(target) == false) return;
        if (this.playerTargets.indexOf(target) != -1) return;
        this.playerTargets.push(target);
    }

    public getPlayerTarget(): Node {
        return this.playerTargets[0];
    }

    public removePlayerTarget(target: Node) {
        if (this.playerTargets.indexOf(target) == -1) return;
        this.playerTargets.splice(this.playerTargets.indexOf(target), 1);
    }

    /**
     * 获取距离最近的目标
     * @returns 最短距离的target
     */
    public getMinDistanceTarget(): Node | null {
        let minDistance = Number.MAX_VALUE;
        let minDistanceTarget: Node = null;
        for (let i = 0; i < this.playerTargets.length; i++) {
            const target = this.playerTargets[i];
            if (!target || !isValid(target)) continue;
            if (!target.getComponent(CombatSystem)?.canHurt()) continue;
            const distance = Vec3.distance(this.node.worldPosition, target.worldPosition);
            if (distance < minDistance) {
                minDistance = distance;
                minDistanceTarget = target;
            }
        }
        if (minDistance > this.playerData.attack_range) return null;
        return minDistanceTarget;
    }

    private playAni(aniName: PlayerState) {
        if (aniName == this.currentState) return;
        this.currentState = aniName;
        this.animation.play(aniName);
        // if (aniName == PlayerState.Attack || aniName == PlayerState.RunAttack) {
        //     this.scheduleOnce(() => {
        //         this.canAttack = true;
        //     }, this.playerData.attack_interval)
        // }
    }

}