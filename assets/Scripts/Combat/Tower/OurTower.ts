import { _decorator, Component, Node } from 'cc';
import { Tower } from './Tower';
import { GameManager } from '../../Main/GameManager';
import { ObjectPool } from '../../Tools/ObjectPool';
import { OurActor, OurActorType } from '../Actor/OurActor';
import { Enum } from 'cc';
import { Zoom } from '../../Tools/AniCtrl';
import { AudioManager } from '../../Common/AudioManager';
import { GameState } from '../../Main/GameData';
import { Effect } from '../../Tools/Effect';
import { Tween } from 'cc';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 我方塔
 */
@ccclass('OurTower')
export class OurTower extends Tower {

    @property({ type: Enum(OurActorType) })
    private ourActorType: OurActorType = OurActorType.Axe;

    @property
    private modelscale: number = 1

    private batchCount: number = 0; // 记录每批次加载的士兵数量
    private batchActors: OurActor[] = []; // 缓存每批次加载的士兵



    protected onLoad(): void {
        GameManager.MainGame.ourTowers.push(this);


        AudioManager.soundPlay("升级：levup")

        // this.modelInitScale = this.towerModel.scale.clone();
    }

    protected start(): void {
        Zoom(this.node);

        this.modelInitScale = this.towerModel.scale.clone();
        this.loadOurActor();
        this.schedule(() => {
            if (GameManager.ins.gameState == GameState.Over) return;
            this.loadOurActor();
        }, this.batchInterval);
    }

    private loadOurActor(): void {
        if (!GameManager.MainGame.actorParent) {
            return;
        }

        this.batchActors = [];
        this.batchCount = 0;

        for (let i = 0; i < this.loadNumebr; i++) {
            this.scheduleOnce(() => {
                // const ourActor = ObjectPool.GetPoolItem("OurActor", GameManager.MainGame.actorParent, this.node.worldPosition);
                // const ourActorComp = ourActor.getComponent(OurActor);
                let ourActor = null
                let ourActorComp: OurActor = null;
                if (this.ourActorType == OurActorType.Axe) {
                    ourActor = ObjectPool.GetPoolItem("Axe", GameManager.MainGame.actorParent, this.node.worldPosition)
                    ourActorComp = ourActor.getComponent(OurActor);
                    // ourActor.
                    ourActorComp.initAxeActor(i, this.idelPoints[i]);
                } else if (this.ourActorType == OurActorType.Shield) {
                    ourActor = ObjectPool.GetPoolItem("Shield", GameManager.MainGame.actorParent, this.node.worldPosition)
                    ourActorComp = ourActor.getComponent(OurActor);
                    ourActorComp.initShieldActor(i, this.idelPoints[i]);
                } else if (this.ourActorType == OurActorType.Sword) {
                    ourActor = ObjectPool.GetPoolItem("Sword", GameManager.MainGame.actorParent, this.node.worldPosition)
                    ourActorComp = ourActor.getComponent(OurActor);
                    ourActorComp.initSwordActor(i, this.idelPoints[i]);
                }

                // Tween.stopAllByTarget(this.towerModel);
                if (this.batchActors.length % 2 == 0) {
                    this.towerModel.scale = this.modelInitScale.clone();
                    Effect.scaleInEffect(this.towerModel, this.modelscale, 0.5, this.modelInitScale.x).start();
                }


                ourActor.belong_owner = this.node;
                ourActorComp.startMove(GameManager.MainGame.ourPath, this.startIndex);

                this.batchCount++;
                this.batchActors.push(ourActorComp);

                if (this.batchCount == this.loadNumebr) {
                    // this.scheduleOnce(() => {
                    for (let i = 0; i < this.batchActors.length; i++) {
                        const _ourActor = this.batchActors[i];
                        _ourActor.scheduleOnce(() => {
                            _ourActor.isReady = true;
                        }, i * this.loadInterval)
                    }
                    // }, this.batchInterval * 0.1)
                }
            }, i * this.loadInterval);
        }
    }

    public upgradeTower() {
        this.loadInterval = 0.1;
        this.batchInterval = 3;
    }


}


