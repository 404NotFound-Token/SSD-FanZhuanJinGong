import { EventTarget } from "cc";

export const IEvent = new EventTarget();

export enum EventType {
    GameLoad,
    GameStart,
    GamePause,
    GameOver,

    EnemyTower1Destroy,
    EnemyTower2Destroy,

    Upgrade,
}

export enum GameState {
    Load = "Load",
    Start = "Start",
    Pause = "Pause",
    Over = "Over",
}

export enum ColliderGroup {
    Default = 1 << 0,
    Player = 1 << 1,
    Our = 1 << 2,
    Enemy = 1 << 3,
    Landmark = 1 << 4,
    Check = 1 << 5,
}