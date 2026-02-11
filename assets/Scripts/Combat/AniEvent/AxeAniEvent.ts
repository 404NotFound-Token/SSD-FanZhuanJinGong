import { _decorator, Component, Node } from 'cc';
import { AniEvent } from './AniEvent';
import { OurActor } from '../Actor/OurActor';
import { AudioManager } from '../../Common/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('AxeAniEvent')
export class AxeAniEvent extends AniEvent {

    @property(OurActor)
    private axe: OurActor = null;

    private IdleAttack1() {
        AudioManager.soundPlay('挥斧')
        this.axe.onAttacked()
    }
}


