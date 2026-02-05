import { _decorator, Component, Node } from 'cc';
import { UIManager } from './UIManager';
import { resources } from 'cc';
import { EventType, GameState, IEvent } from './GameData';
// import { ObjectPool } from '../Tools/ObjectPool';
import { MainGame } from './MainGame';
import { CameraCtrl, cameraToTarget_offset } from './CameraCtrl';
import { Player } from '../Combat/Player';
import { Utils } from '../Tools/Utils';
import { PhysicsSystem } from 'cc';
import { PhysicsSystem2D } from 'cc';
import { LandmarkHandler } from './LandmarkHandler';
import { NodePool } from 'cc';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { PoolManager } from './PoolManager';
import { ObjectPool } from '../Tools/ObjectPool';
import { tween } from 'cc';
import { EnemyMainCity } from '../Combat/MainCity/EnemyMainCity';
const { ccclass, property } = _decorator;

export enum PoolType {
    金币 = "Gold",
    红弹 = "RedBullet",
    蓝弹 = "BuleBullet",
    敌人 = "EnemyActor",
    斧兵 = "Axe",
    盾兵 = "Shield",
    剑兵 = "Sword"
}

@ccclass('GameManager')
export class GameManager extends Component {

    public static GameManager: GameManager = null;
    public static Player: Player = null;
    public static MainGame: MainGame = null;
    public static LandmarkHandler: LandmarkHandler = null;

    private game_state: GameState = GameState.Load;

    public get gameState(): GameState {
        return this.game_state;
    }

    private gameLoad = () => {
        this.game_state = GameState.Load;
    };

    private gameStart = () => {
        this.game_state = GameState.Start;
    };

    private gamePause = () => {
        this.game_state = GameState.Pause;
    };


    protected __preload(): void {
        resources.loadDir("Prefab/", (err, assets) => {
            // const assetsInfo = assets.map(asset => ({
            //     type: asset.constructor.name,
            //     name: asset.name,
            //     uuid: asset.uuid
            // }));

            // if (err) {
            //     console.log(`资源加载异常：${JSON.stringify(assetsInfo, null, 2)}`);
            // } else {
            //     console.log(`资源加载成功：${JSON.stringify(assetsInfo, null, 2)}`);
            // }
        });
    }

    protected onLoad(): void {
        GameManager.GameManager = this;

        IEvent.on(EventType.GameLoad, this.gameLoad, this);
        IEvent.on(EventType.GameStart, this.gameStart, this);
        IEvent.on(EventType.GamePause, this.gamePause, this);
        IEvent.once(EventType.GameOver, this.onGameOver, this);

        // PhysicsSystem.instance.enable = true;
        // PhysicsSystem.instance.debugDrawFlags = 1;
    }

    protected start(): void {
        // GameManager.LogCurrentCollision3DMatrix();

        this.initGameData().then(() => {
            this.scheduleOnce(() => {
                IEvent.emit(EventType.GameStart);
            }, 1)
        })


    }

    private onGameOver(bol: boolean) {
        this.game_state = GameState.Over;
        CameraCtrl.ins._isFollow = false;
        tween(CameraCtrl.ins.node)
            .to(0.5, { worldPosition: EnemyMainCity.ins.node.worldPosition.clone().add(cameraToTarget_offset) })
            .call(() => {
                UIManager.ins.onGameOver(bol)
            })
            .start();
    }

    private initGameData(): Promise<void> {
        return new Promise((resolve) => {
            ObjectPool.ObjectPoolInit([
                { path: "Gold", num: 100 },
                { path: "BuleBullet", num: 100 },
                { path: "RedBullet", num: 100 },
                { path: "EnemyActor", num: 100 },
                { path: "Axe", num: 100 },
                { path: "Sword", num: 100 },
                { path: "Shield", num: 100 },
                { path: "Arrow", num: 100 },
            ]);

            resolve();
        });
    }

    // //**获取当前物理分层数据 */
    // public static LogCurrentCollision3DMatrix() {
    //     let str = ``;
    //     let str2 = '';

    //     const maxLength = 5;

    //     for (let i = 1; i <= (1 << maxLength); i <<= 1) {
    //         let binary = Utils.DecimalToBinaryWithPadding(PhysicsSystem.instance.collisionMatrix[i], maxLength);
    //         str += `${i == (1 << maxLength) ? `${binary}` : `${binary}-`}`
    //         str2 += `${binary}\n`
    //     }

    //     // console.log("3D物理碰撞矩阵存储字符串:");
    //     // console.log(str);
    //     console.log(`碰撞矩阵：\n` + ` ` + str2.split('').join(' '));
    // }

    protected onDestroy(): void {
        IEvent.off(EventType.GameStart, this.gameStart, this);
        IEvent.off(EventType.GameLoad, this.gameLoad, this);
        IEvent.off(EventType.GamePause, this.gamePause, this);
        IEvent.off(EventType.GameOver, this.onGameOver, this);
    }
}