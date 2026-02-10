import { _decorator, Component, Node } from 'cc';
import { GameManager } from './GameManager';
import { Label } from 'cc';
import { EventType, IEvent } from './GameData';
import { GameSceneFit } from '../Common/GameSceneFit';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    public static ins: UIManager = null;

    @property(Label) goldLabel: Label = null;
    @property(Node) startTip: Node = null;

    @property(Node) joystick: Node = null;
    @property(Node) logo: Node = null;
    @property(Node) gold: Node = null;

    @property(Node)
    gameOver: Node = null;

    @property(Node)
    winPanel: Node = null;

    @property(Node)
    failPanel: Node = null;

    protected onLoad(): void {
        UIManager.ins = this;
    }

    protected lateUpdate(dt: number): void {
        this.goldLabel.string = GameManager.Player.bag.items.length.toString();
        this.uiFitIn();
    }

    public onGameOver(bol: boolean) {
        this.gameOver.active = true;
        this.winPanel.active = bol;
        this.failPanel.active = !bol;
    }

    playNow() {
        console.log("playNow");
    }

    tryAgain() {
        console.log("tryAgain");
    }

    uiFitIn() {
        if (GameSceneFit.viewScale > 1) {
            this.joystick.scale = new Vec3(1, 1, 1).multiplyScalar(GameSceneFit.viewScale);
            this.logo.scale = new Vec3(1, 1, 1).multiplyScalar(GameSceneFit.viewScale);
            this.gold.scale = new Vec3(1, 1, 1).multiplyScalar(GameSceneFit.viewScale);
            this.winPanel.scale = new Vec3(1, 1, 1).multiplyScalar(GameSceneFit.viewScale);
            this.failPanel.scale = new Vec3(1, 1, 1).multiplyScalar(GameSceneFit.viewScale);
            // this.startTip.scale = new Vec3(1, 1, 1).multiplyScalar(GameSceneFit.viewScale);
        } else {
            this.joystick.scale = Vec3.ONE;
            this.logo.scale = Vec3.ONE;
            this.gold.scale = Vec3.ONE;
            this.winPanel.scale = Vec3.ONE;
            this.failPanel.scale = Vec3.ONE;
            // this.startTip.scale = Vec3.ONE;
        }
    }
}


