// import { _decorator, Component, Node } from 'cc';
// import { NavLine } from './NavLine';
// import { Landmark } from '../Scripts/Main/Landmark';
// import { Player } from '../Scripts/Main/Player';
// import { ResourceType } from '../Scripts/Main/Resource';
// import { MainGame } from '../Scripts/Main/MainGame';
// import { ZombieManager } from '../Scripts/Main/ZombieManager';
// import { NpcManager } from '../Scripts/Main/NPC/NpcManager';
// import { GameData } from '../Scripts/Config/GameConfig';
// const { ccclass, property } = _decorator;

// @ccclass('GuideCtrl')
// export class GuideCtrl extends Component {
//     public static ins: GuideCtrl = null;

//     @property({ type: NavLine, tooltip: "导航线" }) line: NavLine = null;

//     @property(Node) jiantou: Node = null;

//     private _point: Node = null;

//     @property([Landmark])
//     private landmarks: Landmark[] = [];

//     /**
//      * 流程：
//      * 如果地贴需要的是npc 判断npc数量是否足够地贴所需 足够则引导地贴，不够则引导收集npc
//      * 如果地贴需要是资源 判断资源数量是否足够地贴所需 够则引导地贴，不够则引导收集资源
//      */
//     protected update(dt: number): void {

//         this._point = null;
//         this.getLandmark();
//         if (this.landmark) {
//             // 所需npc时
//             if (this.landmark.needNpc) {
//                 // 数量不够则引导收集
//                 if (Player.ins.refugees.length < (this.landmark.needNpc.number - this.landmark.needNpc._realCount)) {
//                     this._point = NpcManager.ins.npcList[0];
//                     return
//                 }
//                 // 数量足够则引导地贴
//                 else {
//                     this._point = this.landmark.node;
//                     return;
//                 }
//             }
//             // 所需资源时
//             if (this.landmark.needRes.length > 0) {
//                 this.landmark.needRes.forEach(element => {
//                     // 如果所需金币且数量不够则引导收集
//                     if (element.type == ResourceType.金币 && Player.ins.goldBag.returnItemLength() < (element.number - element._realCount)) {
//                         this._point = ZombieManager.ins.allZombie[0];
//                         return;
//                     }
//                     // 如果所需木头且数量不够则引导收集
//                     if (element.type == ResourceType.木头 && Player.ins.woodBag.returnItemLength() < (element.number - element._realCount)) {
//                         this._point = MainGame.ins.woodBag.node;
//                         return;
//                     }
//                     // 如果所需石头且数量不够则引导收集
//                     if (element.type == ResourceType.石头 && Player.ins.stoneBag.returnItemLength() < (element.number - element._realCount)) {
//                         this._point = MainGame.ins.stoneBag.node;
//                         return;
//                     }

//                     // 所有资源都足够则引导前往地贴提交
//                     this._point = this.landmark.node;
//                 });
//             }
//         }
//     }

//     protected lateUpdate(dt: number): void {
//         try {
//             if (GameData.Over) {
//                 this.jiantou.active = false;
//                 this.line.node.active = false;
//                 return;
//             }

//             if (this._point) {
//                 this.jiantou.active = true;
//                 this.line.node.active = true;
//                 this.jiantou.setWorldPosition(this._point.worldPosition);
//                 this.line.node.setWorldPosition(Player.ins.node.worldPosition);
//                 this.line.init(this._point.worldPosition.clone());
//             } else {
//                 this.jiantou.active = false;
//                 this.line.node.active = false;
//             }
//         } catch (error) {
//             this.jiantou.active = false;
//             this.line.node.active = false;
//         }
//     }

//     private landmark: Landmark = null;

//     private getLandmark() {
//         for (let i = 0; i < this.landmarks.length; i++) {
//             const landmark = this.landmarks[i];
//             if (landmark && landmark.node.active) {
//                 this.landmark = landmark;
//                 return;
//             }
//         }
//     }
// }


