import { _decorator, Node } from 'cc';
import { Actor, ActorConfig, AnimationName, Team } from './Actor';
import { ITriggerEvent } from 'cc';
import { CombatSystem } from '../CombatSystem';
import { ColliderGroup, GameData, IEvent } from '../../Main/GameData';
import { Vec3 } from 'cc';
import { GameManager } from '../../Main/GameManager';
import { Color } from 'cc';
import { EnemyTower, } from '../Tower/EnemyTower';
import { _lookAtY } from '../../Tools/Tools';
import { Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum OurActorType {
    /** 斧兵 */
    Axe,
    /** 剑兵 */
    Sword,
    /** 盾兵 */
    Shield,
}

/**
 * 我方士兵
 */
@ccclass('OurActor')
export class OurActor extends Actor {


    @property({ type: Enum(OurActorType) })
    public ourActorType: OurActorType = OurActorType.Axe;

    private minDisEnemyTower: EnemyTower = null;

    private _index: number = 0;
    private _point: Node = null;


    protected onTriggerEnter(e: ITriggerEvent): void {
        if (e.otherCollider.getGroup() === ColliderGroup.Enemy) {
            const enemy = e.otherCollider.getComponent(CombatSystem);
            if (enemy && !enemy.isDie) {

                enemy.beHurt(this.actorConfig.attack);
                this.beHurt(999);
            }
        }
    }

    // 斧兵
    public initAxeActor(index: number, idlePoint?: Node) {
        this._index = index;
        this.idlePoint = idlePoint;
        this.team = Team.Our;
        this._type = 1;
        this.actorConfig = new ActorConfig(20, 12, 7, 7, 0);
        this.initHP(this.actorConfig.hp, Color.GREEN);
        GameManager.MainGame.allOurActors.push(this);
        this.canMove = true;
        this.isReady = false;

        console.log("初始化斧兵: ", this.actorConfig);
    }

    // 剑兵
    public initSwordActor(index: number, idlePoint?: Node) {
        this._index = index;
        this.idlePoint = idlePoint;
        this.team = Team.Our;
        this._type = 2;
        this.actorConfig = new ActorConfig(12, 10, 7, 7, 0);
        this.initHP(this.actorConfig.hp, Color.GREEN);
        GameManager.MainGame.allOurActors.push(this);
        this.canMove = true;
        this.isReady = false;

        console.log("初始化剑兵: ", this.actorConfig);
    }
    // 盾兵
    public initShieldActor(index: number, idlePoint?: Node) {
        this._index = index;
        this.idlePoint = idlePoint;
        this.team = Team.Our;
        this._type = 3;
        this.actorConfig = new ActorConfig(200, 10, 7, 6, 0);
        this.initHP(this.actorConfig.hp, Color.GREEN);
        GameManager.MainGame.allOurActors.push(this);
        this.canMove = true;
        this.isReady = false;

        console.log("初始化盾兵: ", this.actorConfig);
    }

    public startMove(path: Node[], startIndex: number) {
        this.path = path;
        this.path.push(GameManager.MainGame.enemyMainCity);
        this.currentPathIndex = startIndex;
        this.canMove = true;
        // this.start_move();
        // this.StartMove();
        // GameManager.MainGame.addActor(this);
    }

    protected playAni(aniName: AnimationName): void {
        super.playAni(aniName);
    }

    protected update(dt: number): void {
        if (this.node.worldPosition.z <= 0 && !GameData.isRun) {
            GameData.isRun = true;
            IEvent.emit("EnemyRun")
        }
        if (this.isDie) {
            this.rigidbody.setLinearVelocity(Vec3.ZERO);
            return;
        }
        this.minDisEnemyTower = this.getMinDisEnemyTower();
        if (this.minDisEnemyTower != null) {
            const _pos = this.calculateStationPosition();
            if (_pos != null) {
                if (Vec3.distance(this.node.worldPosition, _pos) < 0.1) {
                    this.rigidbody.setLinearVelocity(Vec3.ZERO);

                    if (this._type == 3) {
                        this.playAni(AnimationName.盾兵攻击);

                    } else {
                        this.playAni(AnimationName.剑斧攻击);
                    }
                    _lookAtY(this.node, this.minDisEnemyTower.node.worldPosition);

                } else {
                    if (this._type == 3) {
                        this.playAni(AnimationName.盾兵移动);
                    } else {
                        this.playAni(AnimationName.移动);
                    }

                    this.move(dt, _pos);
                }
            }
        } else {
            if (this._type == 3) {
                this.playAni(AnimationName.盾兵移动);
            } else {
                this.playAni(AnimationName.移动);
            }
            super.update(dt);
        }
    }

    private move(dt: number, targetPos: Vec3) {
        let subDir = new Vec3();
        Vec3.subtract(subDir, targetPos, this.node.worldPosition);
        Vec3.normalize(subDir, subDir);
        this.node.lookAt(targetPos);
        this.node.setWorldPosition(this.node.worldPosition.add(subDir.multiplyScalar(this.actorConfig.speed * dt)));
        // this.rigidbody.setLinearVelocity(subDir.multiplyScalar(this.actorConfig.speed));
    }

    public onAttacked() {
        this.minDisEnemyTower?.getComponent(CombatSystem)?.beHurt(this.actorConfig.attack);
        this.minDisEnemyTower = null;
    }

    /**
     * 
     * @returns 计算站位位置
     */
    private calculateStationPosition(): Vec3 {
        if (!this.minDisEnemyTower) return;

        // 计算基础位置信息
        const centerPos = this.minDisEnemyTower.node.worldPosition; // 敌方塔作为中心点
        const radius = this.actorConfig.range * 0.5; // 设置半径为攻击范围的80%，避免超出攻击范围
        const angleStep = 30; // 每个单位间隔30度
        const maxAngle = 180; // 扇形范围为180度（从-x轴到+x轴）

        // 计算当前单位的角度（从-x轴开始，顺时针方向）
        // 角度范围从-180度到0度（对应扇形的左半部分）
        const totalPossibleUnits = Math.floor(maxAngle / angleStep); // 180/30 = 6个单位
        const unitIndex = this._index % totalPossibleUnits; // 循环分配索引
        const angleInDegrees = 0 + (unitIndex * angleStep); // 从-180度开始计算

        // 转换为弧度
        const angleInRadians = (angleInDegrees * Math.PI) / 180;

        // 计算相对于敌方塔的位置
        const offsetX = Math.cos(angleInRadians) * radius;
        const offsetZ = Math.sin(angleInRadians) * radius;

        // 设置目标位置
        const targetPosition = new Vec3(
            centerPos.x + offsetX,
            this.node.worldPosition.y,
            centerPos.z + offsetZ
        );

        return targetPosition;

        // 移动到计算出的位置
        this.node.setWorldPosition(targetPosition);
    }

    /**
     * 
     * @returns 获取距离最近且在攻击范围的敌方塔
     */
    private getMinDisEnemyTower(): EnemyTower {
        let minDis = Number.MAX_VALUE;
        let minDisTower: EnemyTower = null;
        for (let i = 0; i < GameManager.MainGame.enemyTowers.length; i++) {
            const tower = GameManager.MainGame.enemyTowers[i];
            if (!tower.canHurt()) continue;
            const dis = Vec3.distance(tower.node.worldPosition, this.node.worldPosition);
            if (dis < minDis) {
                minDis = dis;
                minDisTower = tower;
            }
        }
        if (minDisTower == null) return null;
        const bol = Vec3.distance(this.node.worldPosition, minDisTower.node.worldPosition) < this.actorConfig.range;
        if (bol) {
            return minDisTower;
        }
    }

    // 死亡
    protected onDead(): void {
        this.isDie = true;
        if (this.collider) {
            this.collider.enabled = false;
        }
        const index = GameManager.MainGame.allOurActors.indexOf(this);
        if (index != -1) {
            GameManager.MainGame.allOurActors.splice(index, 1);
        }
        // GameManager.MainGame.removeActor(this);
    }
}


