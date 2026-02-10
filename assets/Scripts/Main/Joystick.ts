import { _decorator, Vec2, Vec3, Component, Node, EventTouch, UITransform, v3, NodeEventType } from 'cc';
import { GameManager } from './GameManager';
import { UIManager } from './UIManager';
const { property, ccclass, } = _decorator

@ccclass("Joystick")
export class Joystick extends Component {

    @property(Node) point: Node = null;
    @property(Node) touchPanel: Node = null;

    // 摇杆最大半径
    private MaxRadius: number = 0;

    // 摇杆方向(用于中心点)
    private _dir: Vec3 = new Vec3(0, 0);

    // 摇杆方向(用于角色移动)
    private _direction: Vec2 = new Vec2();
    public get direction(): Vec2 {
        return this._direction;
    }

    private currentPos: Vec3 = v3(0, 0);

    onLoad() {
        this.currentPos = this.node.getPosition().clone();
        this.init();
    }

    init() {
        this.MaxRadius = this.node.getComponent(UITransform).width / 2;

        this.touchPanel.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
        this.touchPanel.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchPanel.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
        this.touchPanel.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        // UIManager.ins.startTip.active = false;
        let pos = this.touchPanel.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y, 0));
        this.node.setPosition(pos.x, pos.y, 0);
    }

    private onTouchMove(event: EventTouch) {
        let worldPos = event.getUILocation();
        let localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(worldPos.x, worldPos.y, 0));
        let length = localPos.length();

        this._direction = new Vec2(localPos.x, localPos.y).normalize()

        if (length > 0) {
            //  只计算方向
            this._dir.x = localPos.x / length;
            this._dir.y = localPos.y / length;

            // 计算最外一圈的x,y位置
            if (length > this.MaxRadius) {
                localPos.x = this.MaxRadius * this._dir.x;
                localPos.y = this.MaxRadius * this._dir.y;
            }
            this.point.setPosition(localPos);
        }
    }

    private onTouchEnd(event: NodeEventType) {
        this._dir = v3(0, 0, 0);
        this.point.setPosition(0, 0, 0);

        this.node.setPosition(this.currentPos);

        this._direction = new Vec2();
    }
}