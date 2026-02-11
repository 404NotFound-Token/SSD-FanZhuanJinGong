import { _decorator, Component, Node } from 'cc';
import { AniEvent } from './AniEvent';
import { OurActor } from '../Actor/OurActor';
import { AudioManager } from '../../Common/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SwordAniEvent')
export class SwordAniEvent extends AniEvent {

    @property(OurActor)
    private sword: OurActor = null;

    private IdleAttack1() {
        AudioManager.soundPlay('挥剑')
        this.sword.onAttacked();
    }
}


