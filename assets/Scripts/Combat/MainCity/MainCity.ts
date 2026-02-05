import { _decorator, Component, Node } from 'cc';
import { CombatSystem } from '../CombatSystem';
import { HP } from '../HP';
import { IEvent } from '../../Main/GameData';
const { ccclass, property } = _decorator;

@ccclass('MainCity')
export class MainCity extends CombatSystem {

    @property
    hpnumber: number = 0;

}


