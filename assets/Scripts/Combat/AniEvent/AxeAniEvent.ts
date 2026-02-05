import { _decorator, Component, Node } from 'cc';
import { AniEvent } from './AniEvent';
import { OurActor } from '../Actor/OurActor';
import { AudioManager } from '../../Common/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('AxeAniEvent')
export class AxeAniEvent extends AniEvent {

    @property(OurActor)
    private axe: OurActor = null;


    // protected onDie(): void {
    //     this.axe.onDie()
    // }

    private IdleAttack1() {
        AudioManager.soundPlay('挥斧')
        console.log('挥斧')
        this.axe.onAttacked()
    }
}


