import { _decorator, Component, Node, Vec3, EventTarget, Quat, find, Enum } from 'cc';
import { TransformUtils } from './TransformUtils';
const { ccclass, property } = _decorator;

export enum ConveyorState {
    RUNNING = 'running',
    PAUSED = 'paused',
    STOPPED = 'stopped'
}

// 自定义移动方法类型
export type CustomMoveFunction = (
    item: Node,
    currentPosition: Vec3,
    targetPosition: Vec3,
    moveSpeed: number,
    deltaTime: number,
    itemData: ConveyorItemData
) => Vec3;

// 自定义旋转方法类型
export type CustomRotateFunction = (
    item: Node,
    rotationSpeed: number,
    deltaTime: number,
    currentPosition: Vec3,
    targetPosition: Vec3,
    itemData: ConveyorItemData
) => void;

export interface AddItemOptions {
    startWayPointIndex?: number;              // 起始路径点索引
    moveToStartPoint?: boolean;               // 是否先移动到起始路径点
    moveDuration?: number;                    // 移动到起始点的持续时间，设置的有速度就不再启用时间
    moveToStartPointSpeed?: number;           // 移动到起始点的速度
    onMoveToStartPointComplete?: (item: Node) => void; // 移动到起始点完成的回调
    onMoveToEndPointComplete?: (item: Node) => void;   // 移动到终点完成的回调
    startImmediately?: boolean;               // 是否立即开始运输
    customMoveFunction?: CustomMoveFunction;  // 自定义移动方法
    customRotateFunction?: CustomRotateFunction; // 自定义旋转方法
    autoRemove?:true; //抵达终点之后,是否自动从传送带中移除

    // itemSpeed?: number;
}

@ccclass('ConveyorBelt')
export class ConveyorBelt extends Component {

    @property([Node])
    wayPoints: Node[] = [];

    @property
    moveSpeed: number = 5;

    @property
    rotationSpeed: number = 0;

    @property
    autoStart: boolean = true;

    @property({tooltip:'自动获取路径点(所有子物体)'})
    autoGetPath: boolean = false;

    @property({tooltip:'自动移动到第一个路径点'})
    public enableAutoMoveToStartPoint: boolean = true;
    @property({ type: Enum({Duration:0,Speed:1}),tooltip:'自动移动到第一个路径点时，移动方式',visible:function(this:ConveyorBelt) {return this.enableAutoMoveToStartPoint}})
    public moveToStartPointType: number = 0;
    @property({ displayName:'移动到起始点时间',visible: function (this: ConveyorBelt) { return this.moveToStartPointType == 0 } })
    public moveToStartPointDuration: number = 0.5;
    @property({displayName:'移动到起始点速度', visible: function (this: ConveyorBelt) { return this.moveToStartPointType == 1 } })
    public moveToStartPointSpeed: number = 5;
    
    public eventTarget: EventTarget = new EventTarget();
    public static readonly ITEM_ARRIVED_EVENT = 'conveyor_item_arrived';
    public static readonly CONVEYOR_PAUSED_EVENT = 'conveyor_paused';
    public static readonly CONVEYOR_RESUMED_EVENT = 'conveyor_resumed';
    public static readonly CONVEYOR_SPEED_CHANGED_EVENT = 'conveyor_speed_changed';

    private items: Map<Node, ConveyorItemData> = new Map();
    private speedMultiplier: number = 1.0;
    private state: ConveyorState = ConveyorState.STOPPED;
    private totalDistance: number = 0;
    private segmentDistances: number[] = [];

    onLoad() {
        if(this.autoGetPath){
            //this.wayPoints = this.node.children;
            let len = this.node.children.length;
            for(let i = 0; i < len; i++){
                this.wayPoints.push(this.node.children[i])
            }
        }
        if (this.wayPoints.length < 2) {
            console.warn('传送带需要至少两个路径点');
            return;
        }

        this.calculatePathData();

        if (this.autoStart) {
            this.start();
        }
    }

    /**
     * 计算路径数据
     */
    private calculatePathData(): void {
        this.totalDistance = 0;
        this.segmentDistances = [];

        for (let i = 0; i < this.wayPoints.length - 1; i++) {
            const distance = Vec3.distance(
                this.wayPoints[i].worldPosition,
                this.wayPoints[i + 1].worldPosition
            );
            this.segmentDistances.push(distance);
            this.totalDistance += distance;
        }
    }

    public getWayPoints(): Node[] {
        return this.wayPoints;
    }

    /**
     * 添加物品到传送带
     */
    addItem(item: Node, options: AddItemOptions = {}): void {
        if (!item) return;

        const {
            startWayPointIndex = 0,
            moveToStartPoint = this.enableAutoMoveToStartPoint,
            moveDuration = this.moveToStartPointType == 0 ? this.moveToStartPointDuration : 1,
            moveToStartPointSpeed= this.moveToStartPointType == 1 ? this.moveToStartPointSpeed : undefined,
            onMoveToStartPointComplete,
            onMoveToEndPointComplete,
            startImmediately = true,
            customMoveFunction,
            customRotateFunction,
        } = options;

        // 验证起始路径点
        const validatedIndex = Math.max(0, Math.min(startWayPointIndex, this.wayPoints.length - 1));

        //this.node.addChild(item);
        TransformUtils.changeParent(item, this.node)

        const itemData: ConveyorItemData = {
            node: item,
            currentWayPointIndex: validatedIndex,
            targetWayPointIndex: Math.min(validatedIndex + 1, this.wayPoints.length - 1),
            isMoving: false,
            segmentProgress: 0,
            totalProgress: this.calculateProgressToWayPoint(validatedIndex),
            isMovingToStartPoint: moveToStartPoint,
            moveToStartDuration: moveDuration,
            moveToStartSpeed: moveToStartPointSpeed,
            moveToStartProgress: 0,
            moveToStartPointCompleteCallback: onMoveToStartPointComplete,
            moveToEndPointCompleteCallback: onMoveToEndPointComplete,
            startImmediately: startImmediately,
            customMoveFunction: customMoveFunction,
            customRotateFunction: customRotateFunction,
            autoRemove: options.autoRemove||true
        };

        this.items.set(item, itemData);

        if (moveToStartPoint) {
            // 记录起始位置，准备移动到目标路径点
            itemData.initialPosition = item.worldPosition.clone();
            itemData.targetStartPosition = this.wayPoints[validatedIndex].worldPosition.clone();
        } else {
            // 直接设置到起始路径点位置
            item.setWorldPosition(this.wayPoints[validatedIndex].worldPosition);
            if (startImmediately) {
                this.startItem(item);
            }
        }
    }


    /**
     * 添加物品到传送带
     */
    insertItem(item: Node,_currentWayPointIndex:number, options: AddItemOptions = {}): void {
        if (!item) return;

        const {
            startWayPointIndex = 0,
            moveToStartPoint = false,
            moveDuration = this.moveToStartPointType == 0 ? this.moveToStartPointDuration : 1,
            moveToStartPointSpeed = this.moveToStartPointType == 1 ? this.moveToStartPointSpeed : undefined,
            onMoveToStartPointComplete,
            onMoveToEndPointComplete,
            startImmediately = true,
            customMoveFunction,
            customRotateFunction
        } = options;

        // 验证起始路径点
        const validatedIndex = Math.min(_currentWayPointIndex, this.wayPoints.length - 1)

        //this.node.addChild(item);
        TransformUtils.changeParent(item, this.node)

        const itemData: ConveyorItemData = {
            node: item,
            currentWayPointIndex: validatedIndex,
            targetWayPointIndex: Math.min(validatedIndex + 1, this.wayPoints.length - 1),
            isMoving: true,
            segmentProgress: 0,
            totalProgress: this.calculateProgressToWayPoint(validatedIndex),
            isMovingToStartPoint: moveToStartPoint,
            moveToStartDuration: moveDuration,
            moveToStartSpeed:moveToStartPointSpeed,
            moveToStartProgress: 1,
            moveToStartPointCompleteCallback: onMoveToStartPointComplete,
            moveToEndPointCompleteCallback: onMoveToEndPointComplete,
            startImmediately: startImmediately,
            customMoveFunction: customMoveFunction,
            customRotateFunction: customRotateFunction,
            autoRemove: options.autoRemove||true,
            initialPosition: item.worldPosition.clone(),
            targetStartPosition: this.wayPoints[Math.min(validatedIndex + 1, this.wayPoints.length - 1)].worldPosition.clone(),
        };

        this.items.set(item, itemData);

        if (startImmediately) {
            this.startItem(item);
        }
    }

    /**
     * 计算到指定路径点的进度
     */
    private calculateProgressToWayPoint(wayPointIndex: number): number {
        if (wayPointIndex <= 0) return 0;
        if (wayPointIndex >= this.wayPoints.length) return 1;

        let traveledDistance = 0;
        for (let i = 0; i < wayPointIndex; i++) {
            traveledDistance += this.segmentDistances[i];
        }

        return traveledDistance / this.totalDistance;
    }

    /**
     * 开始传送带运行
     */
    start(): void {
        this.state = ConveyorState.RUNNING;

        this.items.forEach((itemData, item) => {
            if (!itemData.isMovingToStartPoint && itemData.startImmediately) {
                itemData.isMoving = true;
            }
        });
    }

    /**
     * 暂停传送带
     */
    pause(): void {
        if (this.state !== ConveyorState.RUNNING) return;

        this.state = ConveyorState.PAUSED;

        this.items.forEach((itemData) => {
            itemData.isMoving = false;
        });

        this.eventTarget.emit(ConveyorBelt.CONVEYOR_PAUSED_EVENT, this);
    }

    /**
     * 恢复传送带运行
     */
    resume(): void {
        if (this.state !== ConveyorState.PAUSED) return;

        this.state = ConveyorState.RUNNING;

        this.items.forEach((itemData) => {
            if (!itemData.isMovingToStartPoint && itemData.startImmediately) {
                itemData.isMoving = true;
            }
        });

        this.eventTarget.emit(ConveyorBelt.CONVEYOR_RESUMED_EVENT, this);
    }

    /**
     * 开始物品移动
     */
    startItem(item: Node): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.isMoving = true;
            itemData.isMovingToStartPoint = false;
        }
    }

    update(deltaTime: number) {
        if (this.state !== ConveyorState.RUNNING) return;

        // 应用速度倍率
        const adjustedDeltaTime = deltaTime * this.speedMultiplier;

        this.items.forEach((itemData, item) => {
            if (itemData.isMovingToStartPoint) {
                // 处理移动到起始点的逻辑
                this.updateMoveToStartPoint(item, itemData, adjustedDeltaTime);
            } else if (itemData.isMoving) {
                // 处理正常传送带移动
                this.updateItemMovement(item, itemData, adjustedDeltaTime);
            }
        });
    }

    /**
     * 默认移动方法 - 直线移动
     */
    private defaultMoveFunction(
        item: Node,
        currentPosition: Vec3,
        targetPosition: Vec3,
        moveSpeed: number,
        deltaTime: number,
        itemData: ConveyorItemData
    ): Vec3 {
        const direction = new Vec3();
        Vec3.subtract(direction, targetPosition, currentPosition);
        const distance = direction.length();

        if (distance < 0.1) {
            return targetPosition.clone();
        }

        direction.normalize();
        const moveDistance = moveSpeed * deltaTime;

        if (moveDistance >= distance) {
            return targetPosition.clone();
        } else {
            const newPos = new Vec3();
            Vec3.scaleAndAdd(newPos, currentPosition, direction, moveDistance);
            return newPos;
        }
    }

    /**
     * 默认旋转方法 - 绕Y轴旋转
     */
    private defaultRotateFunction(
        item: Node,
        rotationSpeed: number,
        currentPosition: Vec3,
        targetPosition: Vec3,
        deltaTime: number,
        itemData: ConveyorItemData
    ): void {
        if (rotationSpeed !== 0) {
            // 计算方向向量
            const direction = new Vec3();
            Vec3.subtract(direction, targetPosition, currentPosition);
            Vec3.normalize(direction, direction);

            // 使用lookAt方法让物体面向移动方向
            const lookAtPos = new Vec3();
            Vec3.add(lookAtPos, currentPosition, direction);
            item.lookAt(new Vec3(lookAtPos.x,item.worldPosition.y,lookAtPos.z));

            const rotation = item.rotation.clone();
            //Quat.rotateY(rotation,rotation,-90*MathUtils.Deg2Rad);
            item.setRotation(rotation);
        }
    }

    /**
     * 更新物品移动到起始点的过程
     */
    private updateMoveToStartPoint(item: Node, itemData: ConveyorItemData, deltaTime: number): void {
        if (!itemData.initialPosition || !itemData.targetStartPosition) return;

        const currentPosition = item.worldPosition;
        const targetPosition = itemData.targetStartPosition;

        // 计算移动方向和距离
        const direction = new Vec3();
        Vec3.subtract(direction, targetPosition, currentPosition);
        const distance = direction.length();

        if (distance < 0.1) {
            // 已经非常接近目标点
            item.setWorldPosition(targetPosition);
            itemData.isMovingToStartPoint = false;
            itemData.moveToStartProgress = 1;

            // 触发移动到起始点完成的回调
            if (itemData.moveToStartPointCompleteCallback) {
                itemData.moveToStartPointCompleteCallback(item);
            }

            if (itemData.startImmediately) {
                this.startItem(item);
            }
        } else {
            // 计算移动速度（基于总距离和持续时间）

            const totalDistance = Vec3.distance(itemData.initialPosition, targetPosition);
            let moveSpeed = 0;
            if (itemData.moveToStartDuration == undefined) {
                moveSpeed = totalDistance / itemData.moveToStartDuration;
            }
            else {
                moveSpeed = itemData.moveToStartSpeed
            }

            // 使用自定义移动方法或默认方法
            let newPosition: Vec3;
            if (itemData.customMoveFunction) {
                newPosition = itemData.customMoveFunction(
                    item,
                    currentPosition,
                    targetPosition,
                    moveSpeed,
                    deltaTime,
                    itemData
                );
            } else {
                newPosition = this.defaultMoveFunction(
                    item,
                    currentPosition,
                    targetPosition,
                    moveSpeed,
                    deltaTime,
                    itemData
                );
            }

            item.setWorldPosition(newPosition);

            // 更新进度
            const totalProgress = Vec3.distance(itemData.initialPosition, newPosition) / totalDistance;
            itemData.moveToStartProgress = totalProgress;

            // 使用自定义旋转方法或默认方法
            if (itemData.customRotateFunction) {
                itemData.customRotateFunction(item, this.rotationSpeed, deltaTime,currentPosition,targetPosition, itemData);
            } else {
                this.defaultRotateFunction(item, this.rotationSpeed,currentPosition,targetPosition, deltaTime, itemData);
            }
        }
    }

    /**
     * 更新物品在传送带上的移动
     */
    private updateItemMovement(item: Node, itemData: ConveyorItemData, deltaTime: number): void {
        // 检查是否到达终点
        if (itemData.currentWayPointIndex >= this.wayPoints.length - 1) {
            this.onItemArrived(item);
            return;
        }

        const currentWayPoint = this.wayPoints[itemData.currentWayPointIndex];
        const targetWayPoint = this.wayPoints[itemData.targetWayPointIndex];
        const currentPosition = item.worldPosition;
        const targetPosition = targetWayPoint.worldPosition;

        // 计算移动方向和距离
        const direction = new Vec3();
        Vec3.subtract(direction, targetPosition, currentPosition);
        const distance = direction.length();

        if (distance < 0.01) {
            // 到达当前目标路径点
            item.setWorldPosition(targetPosition);

            // 移动到下一个路径点
            itemData.currentWayPointIndex = itemData.targetWayPointIndex;
            itemData.targetWayPointIndex = Math.min(itemData.currentWayPointIndex + 1, this.wayPoints.length - 1);
            itemData.segmentProgress = 0;

            // 更新总体进度
            this.updateItemProgress(itemData);

            // 如果到达终点
            if (itemData.currentWayPointIndex >= this.wayPoints.length - 1) {
            
                this.onItemArrived(item);
            }
        } else {
            // 使用自定义移动方法或默认方法
            let newPosition: Vec3;
            if (itemData.customMoveFunction) {
                newPosition = itemData.customMoveFunction(
                    item,
                    currentPosition,
                    targetPosition,
                    this.moveSpeed,
                    deltaTime,
                    itemData
                );
            } else {
                newPosition = this.defaultMoveFunction(
                    item,
                    currentPosition,
                    targetPosition,
                    this.moveSpeed,
                    deltaTime,
                    itemData
                );
            }

            item.setWorldPosition(newPosition);

            // 更新段内进度
            const segmentDistance = Vec3.distance(currentWayPoint.worldPosition, targetPosition);
            const movedDistance = Vec3.distance(currentPosition, newPosition);
            itemData.segmentProgress += movedDistance / segmentDistance;

            // 更新总体进度
            this.updateItemProgress(itemData);

            // 使用自定义旋转方法或默认方法
            if (itemData.customRotateFunction) {
                itemData.customRotateFunction(item, this.rotationSpeed, deltaTime,currentPosition,targetPosition, itemData);
            } else {
                this.defaultRotateFunction(item, this.rotationSpeed,currentPosition,targetPosition, deltaTime, itemData);
            }
        }
    }

    /**
     * 更新物品进度
     */
    private updateItemProgress(itemData: ConveyorItemData): void {
        if (itemData.currentWayPointIndex >= this.wayPoints.length - 1) {
            itemData.totalProgress = 1.0;
        } else {
            let traveledDistance = 0;

            // 计算已经走过的路径段
            for (let i = 0; i < itemData.currentWayPointIndex; i++) {
                traveledDistance += this.segmentDistances[i];
            }

            // 加上当前段的进度
            if (itemData.currentWayPointIndex < this.wayPoints.length - 1) {
                const currentSegmentDistance = this.segmentDistances[itemData.currentWayPointIndex];
                traveledDistance += currentSegmentDistance * itemData.segmentProgress;
            }

            itemData.totalProgress = traveledDistance / this.totalDistance;
        }
    }

    /**
     * 物品到达终点
     */
    private onItemArrived(item: Node): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.isMoving = false;
            itemData.totalProgress = 1.0;
            if(itemData.autoRemove){
                this.removeItem(item);
            }
            
            // 触发全局事件
            this.eventTarget.emit(ConveyorBelt.ITEM_ARRIVED_EVENT, item, this);

            // 触发移动到终点完成的回调
            if (itemData.moveToEndPointCompleteCallback) {
                itemData.moveToEndPointCompleteCallback(item);
            }
        }
    }

    // ==================== 公共接口 ====================

    /**
     * 设置速度倍率
     */
    setSpeedMultiplier(multiplier: number): void {
        this.speedMultiplier = Math.max(0, multiplier);
        this.eventTarget.emit(ConveyorBelt.CONVEYOR_SPEED_CHANGED_EVENT, this, this.speedMultiplier);
    }

    /**
     * 获取当前速度倍率
     */
    getSpeedMultiplier(): number {
        return this.speedMultiplier;
    }

    /**
     * 获取传送带状态
     */
    getState(): ConveyorState {
        return this.state;
    }

    /**
     * 获取物品进度
     */
    getItemProgress(item: Node): number {
        const itemData = this.items.get(item);
        return itemData ? itemData.totalProgress : -1;
    }

    /**
     * 获取物品当前段进度
     */
    getItemSegmentProgress(item: Node): number {
        const itemData = this.items.get(item);
        return itemData ? itemData.segmentProgress : -1;
    }

    /**
     * 获取物品移动到起始点的进度
     */
    getItemMoveToStartProgress(item: Node): number {
        const itemData = this.items.get(item);
        return itemData ? itemData.moveToStartProgress : -1;
    }

    /**
     * 获取所有物品进度
     */
    getAllItemsProgress(): Map<Node, number> {
        const progressMap = new Map<Node, number>();
        this.items.forEach((itemData, item) => {
            progressMap.set(item, itemData.totalProgress);
        });
        return progressMap;
    }

    /**
     * 从传送带移除物品
     */
    removeItem(item: Node): void {
        if (this.items.has(item)) {
            this.items.delete(item);
        }
    }

    /**
     * 获取传送带上所有物品
     */
    getAllItems(): Node[] {
        return Array.from(this.items.keys());
    }

    /**
     * 清空传送带
     */
    clearAllItems(): Node[] {
        const removeItems:Node[] = [];
        this.items.forEach((_, item) => {
            item.removeFromParent();
            removeItems.push(item);
        });
        this.items.clear();
        return removeItems;
    }

    /**
     * 暂停单个物品
     */
    pauseItem(item: Node): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.isMoving = false;
        }
    }

    /**
     * 恢复单个物品
     */
    resumeItem(item: Node): void {
        const itemData = this.items.get(item);
        if (itemData && this.state === ConveyorState.RUNNING) {
            itemData.isMoving = true;
        }
    }

    /**
     * 设置物品起始路径点
     */
    setItemStartWayPoint(item: Node, wayPointIndex: number, moveToWayPoint: boolean = false, duration: number = 1.0): void {
        const itemData = this.items.get(item);
        if (!itemData) return;

        const validatedIndex = Math.max(0, Math.min(wayPointIndex, this.wayPoints.length - 1));

        if (moveToWayPoint) {
            itemData.isMoving = false;
            itemData.isMovingToStartPoint = true;
            itemData.moveToStartDuration = duration;
            itemData.moveToStartProgress = 0;
            itemData.currentWayPointIndex = validatedIndex;
            itemData.targetWayPointIndex = Math.min(validatedIndex + 1, this.wayPoints.length - 1);
            itemData.initialPosition = item.worldPosition.clone();
            itemData.targetStartPosition = this.wayPoints[validatedIndex].worldPosition.clone();
        } else {
            item.setWorldPosition(this.wayPoints[validatedIndex].worldPosition);
            itemData.currentWayPointIndex = validatedIndex;
            itemData.targetWayPointIndex = Math.min(validatedIndex + 1, this.wayPoints.length - 1);
            itemData.segmentProgress = 0;
            itemData.totalProgress = this.calculateProgressToWayPoint(validatedIndex);
        }
    }

    /**
     * 获取路径总长度
     */
    getTotalDistance(): number {
        return this.totalDistance;
    }

    /**
     * 获取当前段长度
     */
    getCurrentSegmentDistance(item: Node): number {
        const itemData = this.items.get(item);
        if (!itemData || itemData.currentWayPointIndex >= this.segmentDistances.length) return 0;
        return this.segmentDistances[itemData.currentWayPointIndex];
    }

    /**
     * 获取物品当前所在的路径点索引
     */
    getItemCurrentWayPoint(item: Node): number {
        const itemData = this.items.get(item);
        return itemData ? itemData.currentWayPointIndex : -1;
    }

    /**
     * 获取物品下一个目标路径点索引
     */
    getItemTargetWayPoint(item: Node): number {
        const itemData = this.items.get(item);
        return itemData ? itemData.targetWayPointIndex : -1;
    }

    /**
     * 检查物品是否正在移动到起始点
     */
    isItemMovingToStart(item: Node): boolean {
        const itemData = this.items.get(item);
        return itemData ? itemData.isMovingToStartPoint : false;
    }

    /**
     * 设置物品的自定义移动方法
     */
    setItemCustomMoveFunction(item: Node, moveFunction: CustomMoveFunction): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.customMoveFunction = moveFunction;
        }
    }

    /**
     * 设置物品的自定义旋转方法
     */
    setItemCustomRotateFunction(item: Node, rotateFunction: CustomRotateFunction): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.customRotateFunction = rotateFunction;
        }
    }

    /**
     * 移除物品的自定义移动方法（恢复默认）
     */
    removeItemCustomMoveFunction(item: Node): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.customMoveFunction = undefined;
        }
    }

    /**
     * 移除物品的自定义旋转方法（恢复默认）
     */
    removeItemCustomRotateFunction(item: Node): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.customRotateFunction = undefined;
        }
    }

    /**
     * 设置物品的移动到终点完成回调
     */
    setItemMoveToEndPointCompleteCallback(item: Node, callback: (item: Node) => void): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.moveToEndPointCompleteCallback = callback;
        }
    }

    /**
     * 设置物品的移动到起始点完成回调
     */
    setItemMoveToStartPointCompleteCallback(item: Node, callback: (item: Node) => void): void {
        const itemData = this.items.get(item);
        if (itemData) {
            itemData.moveToStartPointCompleteCallback = callback;
        }
    }
}

export interface ConveyorItemData {
    node: Node;
    currentWayPointIndex: number;    // 当前路径点索引
    targetWayPointIndex: number;     // 目标路径点索引
    isMoving: boolean;               // 是否正在移动
    segmentProgress: number;         // 当前段进度 (0-1)
    totalProgress: number;           // 总体进度 (0-1)
    isMovingToStartPoint: boolean;   // 是否正在移动到起始点
    moveToStartDuration: number;     // 移动到起始点的持续时间
    moveToStartSpeed?: number;        // 移动到起始点的速度
    moveToStartProgress: number;     // 移动到起始点的进度 (0-1)
    moveToStartPointCompleteCallback?: (item: Node) => void; // 移动到起始点完成的回调
    moveToEndPointCompleteCallback?: (item: Node) => void;   // 移动到终点完成的回调
    startImmediately: boolean;       // 是否立即开始运输
    initialPosition?: Vec3;          // 移动到起始点的初始位置
    targetStartPosition?: Vec3;      // 移动到起始点的目标位置
    customMoveFunction?: CustomMoveFunction; // 自定义移动方法
    customRotateFunction?: CustomRotateFunction; // 自定义旋转方法
    autoRemove?: boolean;
}





/**
 * 示例
 */
// import { _decorator, Component, Node, Prefab, instantiate, Button, Label, Vec3 } from 'cc';
// import { ConveyorBelt } from '../Eframework/core/Tools/ConveyorBelt/ConveyorBelt';
// const { ccclass, property } = _decorator;

// @ccclass('ConveyorExample')
// export class ConveyorExample extends Component {
    
//     @property(ConveyorBelt)
//     conveyor: ConveyorBelt = null!;
    
//     @property(Node)
//     itemPrefab: Node = null!;
    
//     @property(Label)
//     statusLabel: Label = null!;
    
//     private itemCount: number = 0;
    
//     onLoad() {
//         this.conveyor.eventTarget.on(ConveyorBelt.ITEM_ARRIVED_EVENT, this.onItemArrived, this);
//         this.updateStatus();
//         this.testMultipleCallbacks();
//     }
    
//     onDestroy() {
//         this.conveyor.eventTarget.off(ConveyorBelt.ITEM_ARRIVED_EVENT, this.onItemArrived, this);
//     }
    
//     /**
//      * 添加物品，使用所有回调
//      */
//     addItemWithAllCallbacks(): void {
//         const item = instantiate(this.itemPrefab);
//         item.name = `Item_${++this.itemCount}`;
        
//         // 设置物品在随机位置
//         item.setWorldPosition(
//             Math.random() * 10 - 5,
//             Math.random() * 5,
//             0
//         );
        
//         this.conveyor.addItem(item, {
//             startWayPointIndex: 0,
//             moveToStartPoint: true,
//             moveDuration: 2.0,
//             onMoveToStartPointComplete: (movedItem) => {
//                 console.log(`物品 ${movedItem.name} 已移动到起始点，开始沿路径移动`);
                
//                 // 可以在这里添加一些效果，比如改变颜色
//                 // movedItem.getComponent(Sprite)?.color = Color.GREEN;
//             },
//             onMoveToEndPointComplete: (arrivedItem) => {
//                 console.log(`物品 ${arrivedItem.name} 已到达终点，触发完成回调`);
                
//                 // 可以在这里添加一些效果，比如闪烁
//                 // this.blinkItem(arrivedItem);
                
//                 // 延迟一段时间后移除物品
//                 this.scheduleOnce(() => {
//                     this.conveyor.removeItem(arrivedItem);
//                 }, 2.0);
//             },
//             startImmediately: true
//         });
//     }
    
//     /**
//      * 添加物品，只使用移动到起始点回调
//      */
//     addItemWithStartPointCallback(): void {
//         const item = instantiate(this.itemPrefab);
//         item.name = `Item_${++this.itemCount}`;
        
//         // 设置物品在随机位置
//         item.setWorldPosition(
//             Math.random() * 10 - 5,
//             Math.random() * 5,
//             0
//         );
        
//         this.conveyor.addItem(item, {
//             startWayPointIndex: 0,
//             moveToStartPoint: true,
//             moveDuration: 2.0,
//             onMoveToStartPointComplete: (movedItem) => {
//                 console.log(`物品 ${movedItem.name} 已移动到起始点`);
                
//                 // 延迟2秒后开始移动
//                 this.scheduleOnce(() => {
//                     this.conveyor.startItem(movedItem);
//                     console.log(`物品 ${movedItem.name} 开始沿路径移动`);
//                 }, 2.0);
//             },
//             startImmediately: false // 不立即开始
//         });
//     }
    
//     /**
//      * 添加物品，只使用移动到终点回调
//      */
//     addItemWithEndPointCallback(): void {
//         const item = instantiate(this.itemPrefab);
//         item.name = `Item_${++this.itemCount}`;
        
//         this.conveyor.addItem(item, {
//             startWayPointIndex: 0,
//             moveToStartPoint: false,
//             onMoveToEndPointComplete: (arrivedItem) => {
//                 console.log(`物品 ${arrivedItem.name} 已到达终点`);
                
//                 // 播放音效
//                 // this.playArrivalSound();
                
//                 // 增加分数
//                 // this.addScore(10);
                
//                 // 延迟1秒后移除物品
//                 this.scheduleOnce(() => {
//                     this.conveyor.removeItem(arrivedItem);
//                 }, 1.0);
//             },
//             startImmediately: true
//         });
//     }
    
//     /**
//      * 动态设置物品的回调
//      */
//     setItemCallbacksDynamically(): void {
//         const items = this.conveyor.getAllItems();
//         if (items.length > 0) {
//             const randomItem = items[Math.floor(Math.random() * items.length)];
            
//             // 动态设置移动到终点回调
//             this.conveyor.setItemMoveToEndPointCompleteCallback(randomItem, (item) => {
//                 console.log(`动态设置的回调: 物品 ${item.name} 已到达终点`);
                
//                 // 随机效果
//                 if (Math.random() > 0.5) {
//                     // 50%几率立即移除
//                     this.conveyor.removeItem(item);
//                 } else {
//                     // 50%几率延迟移除
//                     this.scheduleOnce(() => {
//                         this.conveyor.removeItem(item);
//                     }, 1.5);
//                 }
//             });
            
//             console.log(`已为物品 ${randomItem.name} 动态设置移动到终点回调`);
//         }
//     }
    
//     /**
//      * 测试多个回调组合
//      */
//     testMultipleCallbacks(): void {
//         for (let i = 0; i < 3; i++) {
//             this.scheduleOnce(() => {
//                 const item = instantiate(this.itemPrefab);
//                 item.name = `Item_${++this.itemCount}_Batch${i}`;
                
//                 // 设置物品在随机位置
//                 item.setWorldPosition(
//                     Math.random() * 10 - 5,
//                     Math.random() * 5,
//                     0
//                 );
                
//                 this.conveyor.addItem(item, {
//                     startWayPointIndex: i, // 从不同路径点开始
//                     moveToStartPoint: true,
//                     moveDuration: 1.0 + i * 0.5,
//                     onMoveToStartPointComplete: (movedItem) => {
//                         console.log(`批次 ${i}: 物品 ${movedItem.name} 已移动到起始点`);
//                     },
//                     onMoveToEndPointComplete: (arrivedItem) => {
//                         console.log(`批次 ${i}: 物品 ${arrivedItem.name} 已到达终点`);
                        
//                         // 根据批次使用不同的延迟时间
//                         const delay = 1.0 + i * 0.5;
//                         this.scheduleOnce(() => {
//                             this.conveyor.removeItem(arrivedItem);
//                         }, delay);
//                     },
//                     startImmediately: true
//                 });
//             }, i * 2.0); // 每隔2秒添加一个物品
//         }
//     }
    
//     private onItemArrived(item: Node, conveyor: ConveyorBelt): void {
//         // 全局事件回调 - 所有物品到达终点都会触发
//         console.log(`全局事件: 物品 ${item.name} 已到达终点`);
        
//         // 注意：这里不要移除物品，因为可能已经在物品特定的回调中处理了
//         // 如果物品没有设置特定的回调，可以在这里处理
//         if (!this.hasCustomEndCallback(item)) {
//             this.scheduleOnce(() => {
//                 conveyor.removeItem(item);
//             }, 1.0);
//         }
//     }
    
//     /**
//      * 检查物品是否有自定义的终点回调
//      */
//     private hasCustomEndCallback(item: Node): boolean {
//         // 在实际项目中，你可能需要跟踪哪些物品设置了自定义回调
//         // 这里简单返回false，实际使用时需要根据业务逻辑实现
//         return false;
//     }
    
//     private updateStatus(): void {
//         if (this.statusLabel) {
//             const state = this.conveyor.getState();
//             const speed = this.conveyor.getSpeedMultiplier();
//             const itemCount = this.conveyor.getAllItems().length;
            
//             this.statusLabel.string = 
//                 `状态: ${state}\n` +
//                 `速度: ${speed}x\n` +
//                 `物品数量: ${itemCount}`;
//         }
//     }
    
//     // UI控制方法
//     startConveyor(): void {
//         this.conveyor.start();
//         this.updateStatus();
//     }
    
//     pauseConveyor(): void {
//         this.conveyor.pause();
//         this.updateStatus();
//     }
    
//     resumeConveyor(): void {
//         this.conveyor.resume();
//         this.updateStatus();
//     }
    
//     setNormalSpeed(): void {
//         this.conveyor.setSpeedMultiplier(1.0);
//     }
    
//     setDoubleSpeed(): void {
//         this.conveyor.setSpeedMultiplier(2.0);
//     }
    
//     setHalfSpeed(): void {
//         this.conveyor.setSpeedMultiplier(0.5);
//     }
    
//     stopConveyor(): void {
//         this.conveyor.pause();
//         this.conveyor.clearAllItems();
//         this.updateStatus();
//     }
    
//     /**
//      * 打印所有物品的详细信息
//      */
//     printItemsInfo(): void {
//         const items = this.conveyor.getAllItems();
//         console.log(`传送带上有 ${items.length} 个物品:`);
        
//         items.forEach(item => {
//             const progress = this.conveyor.getItemProgress(item);
//             const segmentProgress = this.conveyor.getItemSegmentProgress(item);
//             const currentWayPoint = this.conveyor.getItemCurrentWayPoint(item);
//             const targetWayPoint = this.conveyor.getItemTargetWayPoint(item);
//             const isMovingToStart = this.conveyor.isItemMovingToStart(item);
//             const moveToStartProgress = this.conveyor.getItemMoveToStartProgress(item);
            
//             let status = isMovingToStart ? 
//                 `移动到起始点: ${(moveToStartProgress * 100).toFixed(1)}%` : 
//                 `运输中: 总体进度 ${(progress * 100).toFixed(1)}%`;
            
//             console.log(`- ${item.name}: ${status}, 当前路径点 ${currentWayPoint}, 目标路径点 ${targetWayPoint}`);
//         });
//     }
// }