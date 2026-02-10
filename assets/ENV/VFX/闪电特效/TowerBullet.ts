import { Vec3 } from 'cc';
import { isValid } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ObjectPool } from 'db://assets/Scripts/Tools/ObjectPool';
const { ccclass, property } = _decorator;

@ccclass('TowerBullet')
export class TowerBullet extends Component {


    @property([Node])
    public paricle: Node[] = [];

    @property
    public unitLength: number = 1;

    public targetNode: Node = null;

    public init(targetNode: Node) {
        this.targetNode = targetNode;

        this.scheduleOnce(() => {
            ObjectPool.PutPoolItem("TowerBullet", this.node)
        }, 0.5);
    }


    protected update(dt: number): void {
        if (this.targetNode && isValid(this.targetNode)) {
            const des = Vec3.distance(this.node.worldPosition, this.targetNode.worldPosition)
            const realLen = des / this.unitLength
            for (let i = 0; i < this.paricle.length; i++) {
                this.paricle[i].setScale(new Vec3(realLen, 50, 50))
            }
            this.node.lookAt(this.targetNode.worldPosition)
        } else {
            this.node.destroy();
        }
    }
}


