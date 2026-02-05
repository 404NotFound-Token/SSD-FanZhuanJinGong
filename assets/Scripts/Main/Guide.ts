import { _decorator, Component, Node } from 'cc';
// import { NavLine } from '../../resources/NavLine/NavLine';
import { GameManager } from './GameManager';
import { Vec3 } from 'cc';
import { Landmark } from './Landmark';
import { NavLine } from '../../NavLine/NavLine';
const { ccclass, property } = _decorator;

@ccclass('Guide')
export class Guide extends Component {

    public static ins: Guide = null;

    @property(NavLine)
    navLine: NavLine = null;

    @property(Node)
    arrow: Node = null;

    public landmarks: Landmark[] = [];

    protected onLoad(): void {
        Guide.ins = this;
    }

    protected update(dt: number): void {
        const landmark = this.getActiveLandmark();
        if (!landmark) {
            this.hide();
            return;
        }

        this.show();
        this.navLine.node.active = true;
        this.arrow.active = true;
        this.navLine.node.worldPosition = GameManager.Player.node.worldPosition;
        this.navLine.init(landmark.node.worldPosition);
        this.arrow.setWorldPosition(landmark.node.worldPosition);
    }

    private getActiveLandmark(): Landmark {
        for (let i = 0; i < this.landmarks.length; i++) {
            const landmark = this.landmarks[i];
            if (landmark.node.active && landmark.nowNumber < landmark.needNumber) {
                return landmark;
            }
        }
        return null;
    }


    private show() {
        this.navLine.node.active = true;
        this.arrow.active = true;
    }

    private hide() {
        this.navLine.node.active = false;
        this.arrow.active = false;
    }

}


