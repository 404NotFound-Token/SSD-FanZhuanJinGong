import { _decorator } from 'cc';
import { MainCity } from './MainCity';
import { EventType, IEvent } from '../../Main/GameData';
import { Color } from 'cc';
import { CameraCtrl, cameraToTarget_offset } from '../../Main/CameraCtrl';
import { GameManager } from '../../Main/GameManager';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyMainCity')
export class EnemyMainCity extends MainCity {

    public static ins: EnemyMainCity = null

    onLoad(): void {
        EnemyMainCity.ins = this
    }

    protected start(): void {
        this.initHP(this.hpnumber, Color.RED)
    }

    protected onDead(): void {
        IEvent.emit(EventType.GameOver, true)
        // GameManager.CameraCtrl.target = this.node
        // this.node.active = false
    }

    beHurt(damage: number): void {
        super.beHurt(damage)
    }
}


