import { Prefab } from "cc";
import { Tween } from "cc";
import { Component, director, instantiate, Node, NodePool, resources, Vec3 } from "cc";

export class ObjectPool {
    public static objectPools: Map<string, NodePool>;

    /** 初始化对象池 */
    public static ObjectPoolInit(datas: { path: string, num: number }[]) {
        this.objectPools = new Map<string, NodePool>();
        datas.forEach((data) => {
            let pool = new NodePool();
            for (let a = 0; a < data.num; a++) {
                const prefab: Prefab = resources.get("Prefab/" + data.path);
                if (prefab) {
                    const item = instantiate(prefab);
                    if (item) {
                        pool.put(item);
                    } else {
                        // console.log(`%c对象池初始化失败=> path: Prefab/${data.path}`, 'color:red;')
                    }
                } else {
                    // console.log(`%c对象池初始化失败=> path: Prefab/${data.path}`, 'color:red;')
                }
                // pool.put(instantiate(resources.get("Prefab/" + data.path)));
            }
            this.objectPools.set(data.path, pool);
            // console.log(`%c初始化对象池=> path: Prefab/${data.path} , num:${data.num}`, 'color:green;')
        });
    }

    /**
     *  获取指定对象池节点
     * @param path 对象池路径 传入prefab名字即可
     * @param parent 父节点
     * @param pos 节点位置 传世界坐标
     */
    public static GetPoolItem(path: string, parent: Node, pos?: Vec3) {

        if (this.objectPools == null) {
            return;
        }
        if (!this.objectPools.has(path)) {
            return;
        }

        let pool = this.objectPools.get(path);
        let obj: Node = null;
        if (pool.size() > 0) {
            obj = this.objectPools.get(path).get();
        } else {
            for (let a = 0; a < 10; a++) {
                pool.put(instantiate(resources.get("Prefab/" + path)));
            }
            obj = this.objectPools.get(path).get();
            // obj = instantiate(resources.get("Prefab/" + path));

            // resources.load("Prefab/" + path, (err, prefab: Prefab) => {
            //     obj = instantiate(prefab)
            // })
        }

        obj.active = true;
        obj.setParent(parent);
        if (pos) {
            obj.setWorldPosition(pos);
        } else {
            obj.setPosition(Vec3.ZERO);

        }
        return obj;
    }

    /** 回收指定对象池节点 */
    public static PutPoolItem(path: string, item: Node) {
        Tween.stopAllByTarget(item);
        item.scale = Vec3.ONE;
        item.eulerAngles = Vec3.ZERO;
        item.active = false;
        let pool = this.objectPools.get(path);
        pool.put(item);
    }
}

/**分帧器 */
export function generator(generator: Generator, duration: number, scheduler?, callback?: Function) {
    let component;
    if (scheduler) {
        component = scheduler;
    } else {
        let node: Node = new Node();
        node.setParent(director.getScene());
        component = node.addComponent(Component);
    }
    return new Promise((resolve, reject) => {
        var gen = generator;
        var execute = () => {
            var startTime = new Date().getTime();
            for (var iter = gen.next(); ; iter = gen.next()) {
                if (iter == null || iter.done) {
                    /**分帧完成 */
                    if (!scheduler) {
                        component.node.destroy();
                    }
                    callback && callback();
                    resolve("");
                    return;
                }
                if (new Date().getTime() - startTime > duration) {
                    component.scheduleOnce(() => {
                        execute();
                    });
                    return;
                }
            }
        };
        // 运行执行函数
        execute();
    });
}
