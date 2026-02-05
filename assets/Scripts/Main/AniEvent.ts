import { _decorator, Component, Node } from 'cc';
import { Player } from '../Combat/Player';
const { ccclass, property } = _decorator;



@ccclass('AniEvent')
export class AniEvent extends Component {

    @property(Player)
    private player: Player = null;

    private PlayerAttack() {
        this.player.shootBullet();
    }

    private PlayerRunAttack() {
        this.player.shootBullet();
    }
}


