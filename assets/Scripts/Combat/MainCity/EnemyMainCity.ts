import { _decorator } from 'cc';
import { MainCity } from './MainCity';
import { EventType, GameState, IEvent } from '../../Main/GameData';
import { Color } from 'cc';
import { CameraCtrl, cameraToTarget_offset } from '../../Main/CameraCtrl';
import { GameManager } from '../../Main/GameManager';
import { tween } from 'cc';
import { find } from 'cc';
import { Effect } from '../../Tools/Effect';
import { Vec3 } from 'cc';
import { Node } from 'cc';
import { ObjectPool } from '../../Tools/ObjectPool';
import { MainGame } from '../../Main/MainGame';
const { ccclass, property } = _decorator;

@ccclass('EnemyMainCity')
export class EnemyMainCity extends MainCity {


    public static ins: EnemyMainCity = null

    @property(Node)
    private model: Node = null;

    @property(Node)
    private shootPoint: Node = null;

    @property({ displayName: "攻击数量" })
    private attackNumber: number = 3;

    @property({ displayName: "攻击间隔" })
    private attackInterval: number = 3;

    @property({ displayName: "攻击距离" })
    private attackRange: number = 10;

    @property({ displayName: "攻击力" })
    private attackPower: number = 10;

    private attacking: boolean = false;


    onLoad(): void {
        EnemyMainCity.ins = this
    }

    protected start(): void {
        this.initHP(this.hpnumber, Color.RED)
    }

    protected onDead(): void {
        this.model.scale = Vec3.ONE
        find("Main/Enemy/EnemyCity/Ctrl/烟雾").active = true;
        IEvent.emit(EventType.GameOver, true)
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

        if (GameManager.ins.gameState == GameState.Over) return;
        if (this.attacking) return;
        this.attacking = true;
        this.attack()
    }

    private attack() {
        this.scheduleOnce(() => {
            this.attacking = false
        }, this.attackInterval)

        for (let i = 0; i < this.attackNumber; i++) {
            this.scheduleOnce(() => {
                const attackTarget = GameManager.MainGame.findMinDisOurActor(this.shootPoint, this.attackRange)
                if (!attackTarget) return;
                console.log("攻击", attackTarget)
                const bullet = ObjectPool.GetPoolItem("RedBullet", GameManager.MainGame.bulletParent, this.shootPoint.worldPosition)
                if (!bullet) return;
                console.log(bullet)
                bullet.lookAt(attackTarget.node.worldPosition)
                tween(bullet)
                    .to(0.2, { worldPosition: attackTarget.node.worldPosition })
                    .call(() => {
                        bullet.destroy()
                        attackTarget.beHurt(this.attackPower)
                    })
                    .start()
            }, i * 0.1)
        }
    }
}


