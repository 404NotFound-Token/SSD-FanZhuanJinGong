import { _decorator, Component, Node } from 'cc';
import { AniEvent } from './AniEvent';
import { OurActor } from '../Actor/OurActor';
import { AudioManager } from '../../Common/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ShieldAniEvent')
export class ShieldAniEvent extends AniEvent {

    @property(OurActor)
    private shield: OurActor = null;

    private IdleAttack3() {
        AudioManager.soundPlay('举盾攻击')
        this.shield.onAttacked()
    }
}


