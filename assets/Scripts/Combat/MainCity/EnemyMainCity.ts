import { _decorator } from 'cc';
import { MainCity } from './MainCity';
import { EventType, GameState, IEvent } from '../../Main/GameData';
import { Color } from 'cc';
import { GameManager } from '../../Main/GameManager';
import { find } from 'cc';
import { Effect } from '../../Tools/Effect';
import { Vec3 } from 'cc';
import { Node } from 'cc';
import { ObjectPool } from '../../Tools/ObjectPool';
import { SkeletalAnimation } from 'cc';
import { OurActor } from '../Actor/OurActor';
import { v3 } from 'cc';
import { TowerBullet } from 'db://assets/ENV/VFX/闪电特效/TowerBullet';
const { ccclass, property } = _decorator;

@ccclass('EnemyMainCity')
export class EnemyMainCity extends MainCity {


    public static ins: EnemyMainCity = null

    @property(Node)
    private model: Node = null;

    @property(Node)
    private shootPoint: Node = null;

    // @property({ displayName: "攻击数量" })
    // private attackNumber: number = 3;

    @property({ displayName: "攻击间隔" })
    private attackInterval: number = 3;

    @property({ displayName: "攻击距离" })
    private attackRange: number = 10;

    @property({ displayName: "攻击力" })
    private attackPower: number = 10;

    @property(SkeletalAnimation)
    private skeletalAnimation: SkeletalAnimation = null;

    private attacking: boolean = false;


    onLoad(): void {
        EnemyMainCity.ins = this
    }

    protected start(): void {
        this.initHP(this.hpnumber, Color.RED)
    }

    protected onDead(): void {
        this.isDie = true;
        this.model.scale = Vec3.ONE
        find("Main/Enemy/EnemyCity/Ctrl/烟雾").active = true;
        IEvent.emit(EventType.GameOver, true)
        this.skeletalAnimation.play();
        this.skeletalAnimation.once(SkeletalAnimation.EventType.FINISHED, (() => {
            this.node.destroy();
        }))
        // GameManager.CameraCtrl.target = this.node
        // this.node.active = false
    }

    beHurt(damage: number): void {
        super.beHurt(damage)
        this.model.scale = Vec3.ONE
        Effect.scaleInEffect(this.model, 0.9, 0.1, 1).start();
    }

    protected update(dt: number): void {
        // super.update(dt);
        if (this.isDie) return;
        if (GameManager.ins.gameState == GameState.Over) return;
        if (this.attacking) return;
        this.attacking = true;
        this.attack()
    }

    private attack() {
        this.scheduleOnce(() => {
            this.attacking = false
        }, this.attackInterval)

        const attackTarget = GameManager.MainGame.findMinDisOurActor(this.shootPoint, this.attackRange)
        if (!attackTarget) return;

        const bullet = ObjectPool.GetPoolItem("TowerBullet", GameManager.MainGame.bulletParent, this.shootPoint.worldPosition)
        if (!bullet) return;

        bullet.getComponent(TowerBullet).init(attackTarget.node)
        // bullet.lookAt(attackTarget.node.worldPosition)
        const targetWorldPos = attackTarget.node.worldPosition.clone()

        attackTarget.beHurt(this.attackPower)

        const effect = ObjectPool.GetPoolItem("爆炸", GameManager.MainGame.bulletParent, targetWorldPos);
        this.scheduleOnce(() => { effect.destroy() }, 0.5)

        const ourActors = this.getOnRangeOurActors(targetWorldPos)
        if (ourActors.length <= 0) return;
        for (let i = 0; i < ourActors.length; i++) {
            const ourActor = ourActors[i];
            const hitNum = this.attackPower * (10 - i)
            console.log("111111111 : ", hitNum)
            ourActor.beHurt(hitNum)
        }
        // tween(bullet)
        //     .to(0.3, { worldPosition: targetWorldPos })
        //     .call(() => {



        //     })
        //     .start()
    }

    private getOnRangeOurActors(worldPos: Vec3): OurActor[] {
        const ourActors: OurActor[] = []
        for (let i = 0; i < GameManager.MainGame.allOurActors.length; i++) {
            const ourActor = GameManager.MainGame.allOurActors[i];
            if (ourActor.isDie) continue;
            const a = worldPos.clone()
            const b = ourActor.node.worldPosition.clone()
            if (Vec3.distance(v3(a.x, 0, a.z), v3(b.x, 0, b.z)) <= 5) {
                ourActors.push(ourActor)
            }
        }
        return ourActors
    }
}


