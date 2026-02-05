import { _decorator, CCBoolean, CCFloat, Component, Enum, Node, Tween, tween, UITransform, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum Breathe_Type {
    Center,
    Top,
    Bottom,
    Left,
    Right,
}

@ccclass('AniCtrl')
export class AniCtrl extends Component {

    @property(CCBoolean) playOnLoad: boolean = true;
    @property({ type: Enum(Breathe_Type) }) breatheType: Breathe_Type = Breathe_Type.Center;
    @property(CCFloat) speed: number = 1;
    @property(CCFloat) scaleGap: number = 0.05;

    private transform: UITransform;
    private oriScale: Vec3 = v3();
    private loadDone: boolean = false;

    protected onLoad(): void {
        this.transform = this.node.getComponent(UITransform);
        this.oriScale.set(this.node.getScale());
        this.loadDone = true;

        if (this.playOnLoad) this.Set(this.breatheType);
    }

    Set(type: Breathe_Type = Breathe_Type.Center) {
        if (!this.loadDone) this.onLoad();
        this.node.scale.set(this.oriScale);

        let anchorX = 0.5, anchorY = 0.5, positionX = 0, positionY = 0;
        switch (type) {
            case Breathe_Type.Top:
                anchorY = 1;
                positionY += this.transform.contentSize.height * this.node.scale.y / 2;
                break;
            case Breathe_Type.Bottom:
                anchorY = 0;
                positionY -= this.transform.contentSize.height * this.node.scale.y / 2;
                break;
            case Breathe_Type.Left:
                anchorX = 0;
                positionX -= this.transform.contentSize.width * this.node.scale.x / 2;
                break;
            case Breathe_Type.Right:
                anchorX = 1;
                positionX += this.transform.contentSize.width * this.node.scale.x / 2;
                break;
        }
        this.transform.setAnchorPoint(anchorX, anchorY);
        this.node.setPosition(this.node.position.x + positionX, this.node.position.y + positionY);

        Tween.stopAllByTarget(this.node);

        switch (type) {
            case Breathe_Type.Top:
            case Breathe_Type.Bottom:
                tween(this.node)
                    .to(1 / this.speed, { scale: v3(this.oriScale.x, this.oriScale.y + this.scaleGap) })
                    .to(1 / this.speed, { scale: this.oriScale })
                    .to(1 / this.speed, { scale: v3(this.oriScale.x, this.oriScale.y - this.scaleGap) })
                    .to(1 / this.speed, { scale: this.oriScale })
                    .union().repeatForever().start();
                break;
            case Breathe_Type.Left:
            case Breathe_Type.Right:
                tween(this.node)
                    .to(1 / this.speed, { scale: v3(this.oriScale.x + this.scaleGap, this.oriScale.y) })
                    .to(1 / this.speed, { scale: this.oriScale })
                    .to(1 / this.speed, { scale: v3(this.oriScale.x - this.scaleGap, this.oriScale.y) })
                    .to(1 / this.speed, { scale: this.oriScale })
                    .union().repeatForever().start();
                break;
            case Breathe_Type.Center:
                tween(this.node)
                    .to(1 / this.speed, { scale: v3(this.oriScale.x + this.scaleGap, this.oriScale.y + this.scaleGap) })
                    .to(1 / this.speed, { scale: this.oriScale })
                    .to(1 / this.speed, { scale: v3(this.oriScale.x - this.scaleGap, this.oriScale.y - this.scaleGap) })
                    .to(1 / this.speed, { scale: this.oriScale })
                    .union().repeatForever().start();
                break;
        }
    }

    Stop() {
        if (!this.loadDone) this.onLoad();
        Tween.stopAllByTarget(this.node);
        tween(this.node).to(0.1, { scale: this.oriScale }).start();
    }
}


export function Zoom(node: Node) {
    const _scale = node.worldScale.clone();
    node.setWorldScale(_scale.x, 0, _scale.z);
    const t = new Tween<Node>(node)
        .to(0.2, { worldScale: v3(_scale.x, _scale.y + 0.5, _scale.z) })
        .to(0.2, { worldScale: v3(_scale.x, _scale.y - 0.2, _scale.z) })
        .to(0.2, { worldScale: _scale })
        .start();
}

