import { _decorator, Component, Node } from 'cc';
import { Archer } from './Actor/Archer';
import { ObjectPool } from '../Tools/ObjectPool';
import { tween } from 'cc';
import { AudioManager } from '../Common/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ArcherAniEvent')
export class ArcherAniEvent extends Component {


    @property(Archer)
    private archer: Archer = null;

    private Attack() {
        // console.log("ArcherAttack")
        AudioManager.soundPlay("射箭")
        this.archer.onAttack();
    }
}


