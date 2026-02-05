import { _decorator, Node, Prefab, instantiate, warn, error } from 'cc';

/**
 * 对象池管理器
 * @description 用于管理游戏中的对象复用，提高性能
 */
export class PoolManager {
    private static _instance: PoolManager = null!;

    /**
     * 对象池字典
     * key: 预制体或节点的name
     * value: 对象池
     */
    private _poolDict: Map<string, Node[]> = new Map();

    /**
     * 预制体缓存
     */
    private _prefabCache: Map<string, Prefab> = new Map();

    /**
     * 默认池容量
     */
    private _defaultCapacity: number = 20;

    /**
     * 最大池容量
     */
    private _maxCapacity: number = 100;

    private constructor() {
        // 私有构造函数
    }

    public static get instance(): PoolManager {
        if (!this._instance) {
            this._instance = new PoolManager();
        }
        return this._instance;
    }

    /**
     * 初始化对象池
     * @param prefab 预制体
     * @param poolName 池名称（可选，默认使用预制体名称）
     * @param count 初始数量
     */
    public initPool(prefab: Prefab, poolName?: string, count: number = 5): void {
        const name = poolName || prefab.name;

        if (this._poolDict.has(name)) {
            warn(`对象池 ${name} 已经存在`);
            return;
        }

        // 缓存预制体
        this._prefabCache.set(name, prefab);

        // 创建初始对象
        const pool: Node[] = [];
        for (let i = 0; i < count; i++) {
            const obj = instantiate(prefab);
            obj.active = false;
            pool.push(obj);
        }

        this._poolDict.set(name, pool);
    }

    /**
     * 从对象池获取对象
     * @param prefab 预制体
     * @param poolName 池名称（可选）
     * @returns 节点对象
     */
    public get(prefab: Prefab, poolName?: string): Node {
        const name = poolName || prefab.name;

        if (!this._poolDict.has(name)) {
            this.initPool(prefab, name, 1);
        }

        const pool = this._poolDict.get(name)!;

        // 从池中查找可用的对象
        for (let i = 0; i < pool.length; i++) {
            const obj = pool[i];
            if (!obj.active) {
                obj.active = true;
                return obj;
            }
        }

        // 如果没有可用的对象，创建新对象
        const newObj = instantiate(prefab);
        newObj.active = true;
        pool.push(newObj);

        // 检查是否超过最大容量
        if (pool.length > this._maxCapacity) {
            warn(`对象池 ${name} 已超过最大容量 ${this._maxCapacity}`);
        }

        return newObj;
    }

    /**
     * 通过名称获取对象（需要提前初始化）
     * @param poolName 池名称
     * @returns 节点对象
     */
    public getByName(poolName: string): Node | null {
        if (!this._poolDict.has(poolName)) {
            error(`对象池 ${poolName} 未初始化`);
            return null;
        }

        const prefab = this._prefabCache.get(poolName);
        if (!prefab) {
            error(`预制体 ${poolName} 未缓存`);
            return null;
        }

        return this.get(prefab, poolName);
    }

    /**
     * 回收对象到对象池
     * @param node 要回收的节点
     * @param poolName 池名称（可选）
     */
    public put(node: Node, poolName?: string): void {
        if (!node) return;

        const name = poolName || node.name;

        if (!this._poolDict.has(name)) {
            // 如果池不存在，创建新池
            this._poolDict.set(name, []);
        }

        const pool = this._poolDict.get(name)!;

        // 如果池已满，直接销毁节点
        if (pool.length >= this._maxCapacity) {
            node.destroy();
            return;
        }

        // 回收节点
        node.active = false;

        // 重置节点状态
        node.position.set(0, 0, 0);
        node.rotation.set(0, 0, 0, 1);
        node.scale.set(1, 1, 1);

        // 如果节点有父节点，从父节点移除
        if (node.parent) {
            node.removeFromParent();
        }

        // 添加到对象池
        if (pool.indexOf(node) === -1) {
            pool.push(node);
        }
    }

    /**
     * 预加载对象到对象池
     * @param prefab 预制体
     * @param poolName 池名称
     * @param count 数量
     */
    public preload(prefab: Prefab, poolName?: string, count: number = 10): void {
        const name = poolName || prefab.name;

        if (!this._poolDict.has(name)) {
            this.initPool(prefab, name, count);
        } else {
            const pool = this._poolDict.get(name)!;
            const currentCount = pool.length;

            for (let i = currentCount; i < count; i++) {
                const obj = instantiate(prefab);
                obj.active = false;
                pool.push(obj);
            }
        }
    }

    /**
     * 清空指定对象池
     * @param poolName 池名称
     */
    public clear(poolName: string): void {
        if (this._poolDict.has(poolName)) {
            const pool = this._poolDict.get(poolName)!;
            pool.forEach(node => {
                if (node && node.isValid) {
                    node.destroy();
                }
            });
            this._poolDict.delete(poolName);
            this._prefabCache.delete(poolName);
        }
    }

    /**
     * 清空所有对象池
     */
    public clearAll(): void {
        this._poolDict.forEach((pool, name) => {
            pool.forEach(node => {
                if (node && node.isValid) {
                    node.destroy();
                }
            });
        });
        this._poolDict.clear();
        this._prefabCache.clear();
    }

    /**
     * 获取对象池信息
     * @returns 所有对象池的信息
     */
    public getPoolInfo(): Array<{ name: string, total: number, active: number, inactive: number }> {
        const info: Array<{ name: string, total: number, active: number, inactive: number }> = [];

        this._poolDict.forEach((pool, name) => {
            const total = pool.length;
            const active = pool.filter(node => node.active).length;
            const inactive = total - active;

            info.push({
                name,
                total,
                active,
                inactive
            });
        });

        return info;
    }

    /**
     * 设置对象池容量
     * @param defaultCapacity 默认容量
     * @param maxCapacity 最大容量
     */
    public setCapacity(defaultCapacity: number, maxCapacity: number): void {
        this._defaultCapacity = Math.max(1, defaultCapacity);
        this._maxCapacity = Math.max(this._defaultCapacity, maxCapacity);
    }
}