import { _decorator, CCFloat, CCInteger, Component, isValid, Node, tween, v3, Vec3 } from 'cc';
import { math } from 'cc';
import { Utils } from '../Tools/Utils';
import { MathUtils } from '../Tools/MathUtils';
const { ccclass, property } = _decorator;

/**
 * 背包特殊回调接口
 * 用于在特定时机执行自定义逻辑
 */
export interface IBagSpecialCallback {
    /** 在果冻效果前重置状态（可选） */
    resetBeforeJelly?: () => void;
    /** 在排序前重置状态（可选） */
    resetBeforeSort?: () => void;
}

/**
 * 背包组件
 * 通用的物品存储和管理系统，支持3D空间布局、飞行动画和果冻效果
 * 
 * @template T 背包中存储的物品类型，必须继承自Component
 * 
 * 功能特性：
 * - 支持行列分层布局（col * row 的网格，可多层堆叠）
 * - 添加物品时的贝塞尔曲线飞行动画
 * - 移除物品时的飞行动画
 * - 果冻弹性效果
 * - 自动排序和位置管理
 * 
 * 使用示例：
 * ```typescript
 * // 创建背包
 * let bag = node.getComponent(Bag);
 * 
 * // 添加物品（带动画）
 * bag.add(item, (success) => {
 *     console.log("添加成功:", success);
 * });
 * 
 * // 移除物品
 * bag.remove(item, targetNode);
 * 
 * // 直接添加（无动画）
 * bag.directAdd(item);
 * ```
 */
@ccclass('Bag')
export class Bag<T extends Component> extends Component {
    /** 列数（横向物品数量） */
    @property({ type: CCInteger, min: 1, step: 1 })
    col = 1;

    /** 行数（纵向物品数量） */
    @property({ type: CCInteger, min: 1, step: 1 })
    row = 1;

    /** 列间距（X轴方向间距） */
    @property({ type: CCFloat })
    colSep = 0.1;

    /** 行间距（Z轴方向间距） */
    @property({ type: CCFloat })
    rowSep = 0.1;

    /** 层间距（Y轴方向间距，用于多层堆叠） */
    @property({ type: CCFloat })
    layerSep = 0.1;

    /** 物品飞入背包的动画时长（秒） */
    @property({ type: CCFloat })
    flyToBagTime = 0.2;

    /** 物品离开背包的动画时长（秒） */
    @property({ type: CCFloat })
    leavingBagTime = 0.2;

    /** 背包容器节点（如果为空则使用当前节点） */
    @property(Node)
    bagNode?: Node;

    /** 最大显示堆叠数量（超过此数量的物品会被销毁） */
    @property({ type: CCInteger, min: 1, step: 1 })
    maxShowStackNum = 999999;

    /** 背包位置偏移量 */
    @property({ type: Vec3 })
    saveOffset = new Vec3(0, 0, 0);
    @property(Node)
    max: Node = null;

    /** 背包中的物品列表 */
    items: (T & IBagSpecialCallback)[] = [];

    /** 正在飞入背包的物品列表（动画进行中） */
    flyingToBag: T[] = [];

    /** 正在离开背包的物品列表（动画进行中） */
    leavingFromBag: T[] = [];

    /** 钱堆最大高度（超过此高度后物品继续添加但高度不再增长） */
    @property(Number)
    maxHeight: number = 20;
    /** 是否有最大高度限制 */
    @property(Boolean)
    hasMaxHeight = true;

    /**最大高度的倍数 */
    @property(Number)
    maxHeightMultiple = 1.5;

    private isCanAddToBag = true;

    public set canAddToBag(value: boolean) {
        this.isCanAddToBag = value;
    }

    public get canAddToBag(): boolean {
        return this.isCanAddToBag;
    }

    /** 返回背包中的物品数量 */
    public returnItemLength(): number {
        return this.items.length;
    }

    /**
     * 初始化
     * 如果未指定bagNode，则使用当前节点作为背包容器
     */
    start() {
        if (this.bagNode == undefined) {
            this.bagNode = this.node;
        }
    }


    /**
     * 获取下一个空闲位置
     * @returns 返回可用位置的本地坐标 [x, y, z]
     */
    getFreePos() {
        return this.getBagPos(this.flyingToBag.length + this.items.length);
    }

    /**
     * 根据数组索引计算背包中的位置
     * 位置计算规则：
     * - 每层可容纳 col * row 个物品
     * - X轴（列）：colIndex * colSep
     * - Y轴（层）：layIndex * layerSep（受maxHeight限制）
     * - Z轴（行）：rowIndex * rowSep
     * 
     * @param arrIndex 物品在数组中的索引位置
     * @returns 返回本地坐标 [x, y, z]
     */
    getBagPos(arrIndex: number): [number, number, number] {
        const LAY_NUM = this.col * this.row; // 每层可容纳的物品数量
        const MAX_LAYER_ITEMS = this.maxHeight * LAY_NUM; // 最大可显示层数对应的物品数量

        if (arrIndex >= this.maxShowStackNum - 1) {
            arrIndex = this.maxShowStackNum - 1;
        }

        let layIndex: number;
        let index: number;

        if (arrIndex < MAX_LAYER_ITEMS) {
            // 在最大可显示层数内，正常计算层索引和位置索引
            layIndex = Math.floor(arrIndex / LAY_NUM);
            index = arrIndex % LAY_NUM;
        } else {
            // 超过最大可显示层数后，都堆叠在最顶层（maxHeight-1层）
            // 但保持列行位置循环，避免完全重叠
            layIndex = this.maxHeight - 1;
            index = arrIndex % LAY_NUM; // 循环使用列行位置
        }

        let colIndex = index % this.col; // 列索引
        let rowIndex = Math.floor(index / this.col); // 行索引
        let finalY = layIndex * this.layerSep + this.saveOffset.y;

        return [
            colIndex * this.colSep + this.saveOffset.x,
            finalY,
            rowIndex * this.rowSep + this.saveOffset.z
        ];
    }

    /**
     * 设置节点在背包中的位置
     * @param node 要设置位置的节点
     * @param arrIndex 物品在数组中的索引位置
     */
    setBagPos(node: Node, arrIndex: number) {
        if (!isValid(node)) {
            return;
        }
        let pos = this.getBagPos(arrIndex);
        node.setPosition(...pos);
    }

    /** 背包是否已满 */
    isMax() {
        this.showMax();
        if (!this.hasMaxHeight) {
            return true;
        }
        // 实际最大容量 = maxHeight * 1.5 * (col * row)
        const LAY_NUM = this.col * this.row; // 每层可容纳的物品数量
        const maxCapacity = Math.floor(this.maxHeight * this.maxHeightMultiple * LAY_NUM);

        if (this.items.length + this.flyingToBag.length >= maxCapacity) {
            return false;
        }
        return true;
    }

    /** 展示 MAX 图标 */
    showMax() {
        if (this.max) {
            if (this.items.length + this.flyingToBag.length >= this.maxHeight) {
                this.max.active = true;
            } else {
                this.max.active = false;
            }
        }
    }

    /**
     * 添加物品到背包（带动画效果）
     * 物品会以贝塞尔曲线轨迹飞入背包，完成后执行果冻效果
     * 
     * @param item 要添加的物品组件（必须继承自Component）
     * @param completeCall 完成回调函数，参数success表示是否成功添加
     * @param scale 果冻效果的缩放倍数，默认为1
     * @param hasScale 是否显示缩放效果，默认为true
     * 
     * 流程：
     * 1. 检查物品是否已在背包中、正在飞入或正在离开，如果是则拒绝添加
     * 2. 计算目标位置（下一个空闲位置）
     * 3. 使用贝塞尔曲线动画将物品从当前位置飞到目标位置
     * 4. 动画完成后：将物品加入items列表、设置父节点、排序
     * 5. 执行果冻效果
     * 6. 如果超过最大堆叠数，销毁多余物品
     */
    add(item: T & IBagSpecialCallback, completeCall?: (success: boolean) => void, scale: number = 1, hasScale: Boolean = true, eulerAngles: Vec3 = Vec3.ZERO) {
        if (!this.canAddToBag) return;
        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.items.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }

        // Check if item and item.node are valid before proceeding
        if (!item || !item.node || !isValid(item.node)) {
            completeCall && completeCall(false);
            return;
        }

        // 检查容量限制：实际最大容量 = maxHeight * 1.5 * (col * row)
        if (!this.isMax()) {
            completeCall && completeCall(false);
            return;
        }
        // AudioManager.soundPlay("get", 0.8);
        let endLocalPos = new Vec3(...this.getFreePos());

        this.flyingToBag.push(item);
        let startPos = new Vec3(item.node.worldPosition);
        let ctrlPos = new Vec3();
        let endPos = new Vec3();
        let tmpPos = new Vec3();
        let updatePos = () => {
            Vec3.transformMat4(endPos, endLocalPos, this.bagNode.worldMatrix);
            Vec3.zero(ctrlPos);
            ctrlPos.add(startPos);
            ctrlPos.add(endPos);
            ctrlPos.multiplyScalar(0.5);
            ctrlPos.y += 2;
        }
        tween({ v: 0 })
            .to(this.flyToBagTime, { v: 1 }, {
                onUpdate: o => {
                    updatePos();
                    Utils.bezierCurve(o.v, startPos, ctrlPos, endPos, tmpPos);
                    if (item.node && isValid(item.node)) {
                        item.node.setWorldPosition(tmpPos);
                    } else {
                        this.directRemove(item)
                        return;
                    }

                }
            })
            .call(() => {
                // 检查节点是否仍然有效
                if (!item.node || !isValid(item.node)) {
                    this.directRemove(item);
                    completeCall && completeCall(false);
                    return;
                }

                let index = this.items.indexOf(item);
                if (index == -1) this.items.push(item);
                index = this.flyingToBag.indexOf(item);
                if (index != -1) this.flyingToBag.splice(index, 1);

                item.node.setParent(this.bagNode, true);

                this.sortBag();

                item.resetBeforeJelly && item.resetBeforeJelly();
                if (hasScale) {
                    Utils.jellyEffect(item.node, scale, () => {
                        if (this.items.length > this.maxShowStackNum) {
                            this.directRemove(item);
                            item.node.destroy();
                        }
                        completeCall && completeCall(true);
                    });
                    item.node.eulerAngles = eulerAngles;
                }
                else {
                    Utils.jellyEffect(item.node, 1, () => {
                        if (this.items.length > this.maxShowStackNum) {
                            this.directRemove(item);
                            item.node.destroy();
                        }
                    });
                    item.node.eulerAngles = eulerAngles;
                    completeCall && completeCall(true);
                }

            })
            .start();
    }
    /**
     * 从背包中移除物品（带动画效果）
     * 物品会以贝塞尔曲线轨迹飞出背包到目标节点
     * 
     * @param item 要移除的物品组件
     * @param flyToNode 物品飞向的目标节点
     * @param completeCall 完成回调函数，参数success表示是否成功移除
     * @param jelly 是否执行果冻效果，默认为true
     * @param offset 额外的偏移量（可选），用于微调飞行路径的控制点
     * 
     * 流程：
     * 1. 检查物品是否正在飞入或正在离开，如果是则拒绝移除
     * 2. 检查物品是否在背包中，如果不在则失败
     * 3. 从items列表中移除，重新排序
     * 4. 使用贝塞尔曲线动画将物品从当前位置飞到目标位置
     * 5. 动画完成后：从leavingFromBag列表中移除，执行果冻效果
     */
    remove(item: T & { resetBeforeJelly?: () => void }, flyToNode: Node, completeCall?: (success: boolean) => void, jelly = true, offset?: Vec3) {
        this.showMax();

        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.items.indexOf(item);
        if (index == -1) {
            completeCall && completeCall(false);
            return;
        }

        // 取出时确保物品是可见的（可能在最上层被隐藏）
        if (item.node) {
            item.node.active = true;
        }

        this.items.splice(index, 1);
        this.sortBag();
        this.leavingFromBag.push(item);

        let startPos = new Vec3(item.node.worldPosition);
        let ctrlPos = new Vec3();
        let endPos = new Vec3();
        let tmpPos = new Vec3();
        let updatePos = () => {
            endPos.set(flyToNode.worldPosition);
            Vec3.zero(ctrlPos);
            ctrlPos.add(startPos);
            ctrlPos.add(endPos);
            ctrlPos.multiplyScalar(0.5);
            ctrlPos.y += 2;
            if (offset) {
                ctrlPos.x += offset.x;
                ctrlPos.y += offset.y;
                ctrlPos.z += offset.z;
            }
        }
        tween({ v: 0 })
            .to(this.leavingBagTime, { v: 1 }, {
                onUpdate: o => {
                    updatePos();
                    Utils.bezierCurve(o.v, startPos, ctrlPos, endPos, tmpPos);
                    if (item.node && isValid(item.node)) {
                        item.node.setWorldPosition(tmpPos);
                    } else {
                        // 如果节点无效，停止动画
                        return;
                    }
                }
            })
            .call(() => {
                // 检查节点是否仍然有效
                if (!item.node || !isValid(item.node)) {
                    let index = this.leavingFromBag.indexOf(item);
                    if (index != -1) this.leavingFromBag.splice(index, 1);
                    completeCall && completeCall(false);
                    return;
                }

                let index = this.leavingFromBag.indexOf(item);
                if (index != -1) this.leavingFromBag.splice(index, 1);

                if (jelly) {
                    item.resetBeforeJelly && item.resetBeforeJelly();
                    Utils.jellyEffect(item.node, item.node.scale.x);
                }
                completeCall && completeCall(true);
            })
            .start();
    }

    remove2(item: T & { resetBeforeJelly?: () => void }, flyToNode: Node, completeCall?: (success: boolean) => void, jelly = true, offset?: Vec3) {
        this.showMax();

        let index = this.leavingFromBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.flyingToBag.indexOf(item);
        if (index != -1) {
            completeCall && completeCall(false);
            return;
        }
        index = this.items.indexOf(item);
        if (index == -1) {
            completeCall && completeCall(false);
            return;
        }

        // 取出时确保物品是可见的（可能在最上层被隐藏）
        if (item.node) {
            item.node.active = true;
        }

        this.items.splice(index, 1);
        this.sortBag();
        this.leavingFromBag.push(item);

        let start_pos = item.node.worldPosition.clone()
        let temp_pos = new Vec3()
        let control_position = new Vec3()
        // let endPos = flyToNode.worldPosition.clone()
        let endPos = MathUtils.randomPointInCircle3D(flyToNode.worldPosition.clone(), 1);
        Vec3.add(control_position, start_pos, endPos)
        control_position.multiplyScalar(0.5)
        let posX = math.random() * 2 - 1;
        let posZ = math.random() * 2 - 1;

        // let posX = math.random() * 2;
        // let posZ = math.random() * 2;
        control_position.add3f(posX, 2, posZ)
        let euler = math.random() * 360

        tween({ v: 0 })
            .to(this.leavingBagTime, { v: 1 }, {
                onUpdate: o => {
                    Utils.bezierCurve(o.v, start_pos, control_position, endPos, temp_pos);
                    if (item.node && isValid(item.node)) {
                        item.node.setWorldPosition(temp_pos);
                    } else {
                        // 如果节点无效，停止动画
                        return;
                    }
                }
            })
            .call(() => {
                // 检查节点是否仍然有效
                if (!item.node || !isValid(item.node)) {
                    let index = this.leavingFromBag.indexOf(item);
                    if (index != -1) this.leavingFromBag.splice(index, 1);
                    completeCall && completeCall(false);
                    return;
                }

                let index = this.leavingFromBag.indexOf(item);
                if (index != -1) this.leavingFromBag.splice(index, 1);

                if (jelly) {
                    item.resetBeforeJelly && item.resetBeforeJelly();
                    Utils.jellyEffect(item.node, item.node.scale.x);
                }
                completeCall && completeCall(true);
            })
            .start();

        const rot = item.node.eulerAngles.clone()
        tween(item.node)
            .to(this.leavingBagTime, { eulerAngles: new Vec3(euler, euler, euler) })
            .call(() => {
                item.node.eulerAngles = rot
            })
            .start()
    }
    /**
     * 直接添加物品到背包（无动画）
     * 适用于初始化或需要立即添加的场景
     * 
     * @param item 要添加的物品组件
     */
    directAdd(item: T) {
        if (!this.canAddToBag) return;
        let index = this.items.indexOf(item);
        if (index != -1) {
            return; // 已存在，不重复添加
        }
        // 检查容量限制：实际最大容量 = maxHeight * 1.5 * (col * row)
        if (!this.isMax()) {
            return; // 超过容量，不再存放
        }
        // AudioManager.soundPlay("get", 0.8);

        this.items.push(item);
        this.sortBag();
    }

    /**
     * 直接从背包中移除物品（无动画）
     * 适用于需要立即移除的场景
     * 
     * @param item 要移除的物品组件
     */
    directRemove(item: T) {
        let index = this.items.indexOf(item);
        if (index == -1) {
            return; // 不存在，无需移除
        }
        this.showMax();

        // 取出时确保物品是可见的（可能在最上层被隐藏）
        if (item.node && item.node.isValid) {
            item.node.active = true;
        }

        this.items.splice(index, 1);
        this.sortBag();
    }

    /**
     * 获取背包中最后一个物品
     * @returns 返回最后一个物品组件，如果背包为空则返回null
     */
    lastItem() {
        if (this.bagIsEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }

    /**
     * 排序背包中的所有物品
     * 重新计算并设置每个物品的位置，使其按照数组顺序整齐排列
     * 会在排序前调用每个物品的resetBeforeSort回调（如果存在）
     * 如果物品堆叠到最上层，会关闭active（隐藏）
     */
    sortBag() {
        const LAY_NUM = this.col * this.row; // 每层可容纳的物品数量
        const MAX_LAYER_ITEMS = this.maxHeight * LAY_NUM; // 最大可显示层数对应的物品数量

        for (let i = 0; i < this.items.length; i++) {
            this.items[i].resetBeforeSort && this.items[i].resetBeforeSort();
            this.setBagPos(this.items[i].node, i);

            // 如果物品堆叠到最上层，关闭active（隐藏）
            if (i >= MAX_LAYER_ITEMS && this.items[i].node) {
                this.items[i].node.active = false;
            } else if (this.items[i].node) {
                // 否则打开active（显示）
                this.items[i].node.active = true;
            }
        }
    }

    /**
     * 检查背包是否为空
     * @returns 如果背包为空返回true，否则返回false
     */
    bagIsEmpty() {
        return this.items.length == 0;
    }
}


