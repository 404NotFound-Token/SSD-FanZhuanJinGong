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
import { AudioManager } from '../Common/AudioManager';
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

    public static ins: GameManager = null;
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
        // 先加载资源
        resources.loadDir("Prefab/", (err, assets) => {
            if (err) {
                console.error(`资源加载失败：`, err);
                return;
            }

            console.log(`资源加载成功，共加载 ${assets.length} 个资源`);

            // 资源加载完成后初始化游戏数据
            this.initGameData().then(() => {
                console.log("游戏数据初始化完成");
                IEvent.emit(EventType.GameStart);
            }).catch((error) => {
                console.error("游戏初始化失败:", error);
            });
        });
    }

    private initGameData(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                ObjectPool.ObjectPoolInit([
                    { path: "Gold", num: 100 },
                    { path: "BuleBullet", num: 100 },
                    { path: "RedBullet", num: 100 },
                    { path: "EnemyActor", num: 100 },
                    { path: "Axe", num: 100 },
                    { path: "Sword", num: 100 },
                    { path: "Shield", num: 100 },
                    { path: "Arrow", num: 100 },
                    { path: "枪口电红", num: 100 },
                    { path: "枪口电蓝", num: 100 },
                ]);
                console.log("对象池初始化完成");
                resolve();
            } catch (error) {
                console.error("对象池初始化失败:", error);
                reject(error);
            }
        });
    }

    protected onLoad(): void {
        GameManager.ins = this;

        IEvent.on(EventType.GameLoad, this.gameLoad, this);
        IEvent.on(EventType.GameStart, this.gameStart, this);
        IEvent.on(EventType.GamePause, this.gamePause, this);
        IEvent.once(EventType.GameOver, this.onGameOver, this);

        PhysicsSystem.instance.enable = true;
        PhysicsSystem.instance.debugDrawFlags = 1;
    }

    private onGameOver(bol: boolean) {
        AudioManager.musicStop();
        this.game_state = GameState.Over;
        CameraCtrl.ins._isFollow = false;
        tween(CameraCtrl.ins.node)
            .to(0.5, { worldPosition: EnemyMainCity.ins.node.worldPosition.clone().add(cameraToTarget_offset) })
            .call(() => {
                UIManager.ins.onGameOver(bol)
            })
            .start();
    }

    protected onDestroy(): void {
        IEvent.off(EventType.GameStart, this.gameStart, this);
        IEvent.off(EventType.GameLoad, this.gameLoad, this);
        IEvent.off(EventType.GamePause, this.gamePause, this);
        IEvent.off(EventType.GameOver, this.onGameOver, this);
    }
}