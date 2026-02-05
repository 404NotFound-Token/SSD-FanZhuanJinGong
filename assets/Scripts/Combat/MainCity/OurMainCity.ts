import { _decorator } from 'cc';
import { MainCity } from './MainCity';
import { EventType, IEvent } from '../../Main/GameData';
import { Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('OurMainCity')
export class OurMainCity extends MainCity {

    protected start(): void {
        this.initHP(this.hpnumber, Color.GREEN)
    }

    protected onDead(): void {
        IEvent.emit(EventType.GameOver, false);
        this.node.active = false;
    }
}


