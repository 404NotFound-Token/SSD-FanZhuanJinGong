import { RigidBody } from 'cc';
import { ICollisionEvent } from 'cc';
import { Collider } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { ColliderGroup } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('Door')
export class Door extends Component {

    @property(Node) left: Node = null;
    @property(Node) right: Node = null;

    private collider: Collider = null;

    protected onLoad(): void {
        this.collider = this.getComponent(Collider);
    }

    start() {
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.collider.on('onTriggerExit', this.onTriggerExit, this);
    }

    private onTriggerEnter(e: ICollisionEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Player) {

            let leftEnlerAngles = new Vec3();
            let rightEnlerAngles = new Vec3();

            leftEnlerAngles.set(0, 90, 0);
            rightEnlerAngles.set(0, -90, 0);

            tween(this.left)
                .to(0.2, { eulerAngles: leftEnlerAngles })
                .parallel(
                    tween(this.right)
                        .to(0.2, { eulerAngles: rightEnlerAngles })
                        .start()
                )
                .start();
        }
    }

    private onTriggerExit(e: ICollisionEvent) {
        if (e.otherCollider.getGroup() == ColliderGroup.Player ) {
            tween(this.left)
                .to(0.2, { eulerAngles: Vec3.ZERO })
                .parallel(
                    tween(this.right)
                        .to(0.2, { eulerAngles: Vec3.ZERO })
                        .start()
                )
                .start();
        }
    }
}


