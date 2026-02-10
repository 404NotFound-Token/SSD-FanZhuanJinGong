import { _decorator, Component } from 'cc';
import { EventType, IEvent } from './GameData';
import { Camera } from 'cc';
import { tween } from 'cc';
import { GameManager } from './GameManager';
import { Vec3 } from 'cc';
import { Node } from 'cc';
import { OurActor } from '../Combat/Actor/OurActor';
import { EnemyActor } from '../Combat/Actor/EnemyActor';
import { EnemyTower } from '../Combat/Tower/EnemyTower';
import { Landmark } from './Landmark';
import { Game } from 'cc';
import { OurTower } from '../Combat/Tower/OurTower';
import { ObjectPool } from '../Tools/ObjectPool';
import { director } from 'cc';
import { Gold } from './Gold';
import { MathUtils } from '../Tools/MathUtils';
import { math } from 'cc';
import { v3 } from 'cc';
import { Utils } from '../Tools/Utils';
import { Vec2 } from 'cc';
import { CameraCtrl } from './CameraCtrl';
import { UIManager } from './UIManager';
import { resources } from 'cc';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainGame')
export class MainGame extends Component {

    @property(Camera) gameCamera: Camera = null;
    @property(Node) actorParent: Node = null;
    @property(Node) bulletParent: Node = null;

    /** 我方主城 */
    @property(Node)
    public ourMainCity: Node = null;

    /** 敌方主城 */
    @property(Node)
    public enemyMainCity: Node = null;

    @property([Node])
    public ourPath: Node[] = [];

    @property([Node])
    public enemyPath: Node[] = [];


    private beforeCameraPos: Vec3 = new Vec3(6.017, 41.505, 21.172);
    private afterCameraPos: Vec3 = new Vec3(7.5, 30, 30);

    public allOurActors: OurActor[] = [];
    public allEnemyActors: EnemyActor[] = [];

    public enemyTowers: EnemyTower[] = [];
    public ourTowers: OurTower[] = [];

    protected onLoad(): void {

        GameManager.MainGame = this;

        CameraCtrl.ins._isFollow = false;
        if (this.gameCamera.projection == Camera.ProjectionType.PERSPECTIVE) {
            this.gameCamera.node.setWorldPosition(this.beforeCameraPos);
            this.gameCamera.fov = 65;
        }

        IEvent.on(EventType.GameStart, this.onGameStart, this);

        IEvent.once(EventType.GameOver, () => {
            this.actorParent.active = false;
        });
    }

    private onGameStart() {
        this.scheduleOnce(() => {
            tween(this.node)
                .parallel(
                    tween(this.gameCamera.node).to(1, { worldPosition: this.afterCameraPos }),
                    tween(this.gameCamera).to(1, { fov: 50 })
                )
                .call(() => {
                    CameraCtrl.ins._isFollow = true;
                    GameManager.Player.CanMove = true;
                    UIManager.ins.startTip.active = true;

                    this.scheduleOnce(() => {
                        UIManager.ins.startTip.active = false;
                    }, 3)
                })
                .start();
        }, 1);
    }

    // public addActor(actor: OurActor | EnemyActor) {
    //     if (actor instanceof OurActor) {
    //         this.allOurActors.push(actor);
    //         console.log("addActor allOurActors", this.allOurActors.length);
    //     } else if (actor instanceof EnemyActor) {
    //         this.allEnemyActors.push(actor);
    //         console.log("addActor allEnemyActors", this.allEnemyActors.length);
    //     }
    // }

    // public removeActor(actor: OurActor | EnemyActor) {
    //     if (actor instanceof OurActor) {
    //         this.allOurActors.splice(this.allOurActors.indexOf(actor), 1);
    //         console.log("removeActor allOurActors", this.allOurActors.length);
    //     } else if (actor instanceof EnemyActor) {
    //         this.allEnemyActors.splice(this.allEnemyActors.indexOf(actor), 1);
    //         console.log("removeActor allEnemyActors", this.allEnemyActors.length);
    //     }
    // }

    /**
     * 
     * @param bol true 我方 false 敌方
     * @returns 
     */
    public getActor(bol: boolean) {
        if (bol) {
            return this.allOurActors.pop();
        } else {
            return this.allEnemyActors.pop();
        }
    }

    private distanceInXZ(a: Node, b: Node): number {
        const aPos = new Vec2(a.worldPosition.x, a.worldPosition.z)
        const bPos = new Vec2(b.worldPosition.x, b.worldPosition.z)
        return Vec2.distance(aPos, bPos);
    }
    public findMinDisOurActor(node: Node, range: number): OurActor | null {
        const onRangeArr: OurActor[] = [];
        for (let i = 0; i < this.allOurActors.length; i++) {

            let ourActor = this.allOurActors[i];
            if (ourActor == null || ourActor.isValid == false || ourActor.isDie)
                continue;
            let dis = this.distanceInXZ(ourActor.node, node);
            if (dis > range) continue;
            onRangeArr.push(ourActor);
        }


        let minDis = Number.MAX_VALUE;
        let minDisActor: OurActor | null = null;
        for (let i = 0; i < onRangeArr.length; i++) {
            const ourActor = onRangeArr[i];
            if (ourActor == null || ourActor.isValid == false || ourActor.isDie)
                continue;
            const dis = Vec3.distance(ourActor.node.worldPosition, node.worldPosition);
            if (dis < minDis) {
                minDis = dis;
                minDisActor = ourActor;
            }
        }
        return minDisActor;
    }

    public dropGold(num: number = 1, point: Node) {
        for (let i = 0; i < num; i++) {
            const gold = ObjectPool.GetPoolItem("Gold", director.getScene(), point.worldPosition);
            const goldComp = gold.getComponent(Gold);
            const startPos = gold.worldPosition;
            const endPos = MathUtils.randomPointInRing3D(point.worldPosition, 3, 5);
            const ctrlPos = new Vec3(endPos.x, endPos.y + 5, endPos.z);
            let euler = math.random() * 360;
            const t2 = tween(gold).to(0.5, { eulerAngles: v3(euler, euler, euler) })
            const t1 = tween(gold).bezierTo3D(0.5, startPos, ctrlPos, v3(endPos.x, 0, endPos.z))
            goldComp.animation.play()
            tween(gold)
                .parallel(t1, t2)
                .call(() => {
                    gold.eulerAngles = v3(0, 0, 0);
                    Utils.jellyEffect(
                        gold,
                        1,
                        (() => {
                            goldComp.canCheck = true;
                            // goldComp.check();
                        }),
                        null
                    )
                })
                .start();
        }
    }
}

export function getUUID(): string {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${timestamp}${randomPart}`;
}

// export function getNode(name: string, parent: Node, worldPos: Vec3 = Vec3.ZERO): Node {
//     resources.load(`Prefab/${name}`, (err, prefab: Prefab) => {
//         const node = instantiate(prefab);
//         node.parent = parent;
//         node.setWorldPosition(worldPos);
//         return node;
//     });
//     return null;
// }


