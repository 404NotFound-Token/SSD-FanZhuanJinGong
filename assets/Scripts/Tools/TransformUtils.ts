import { Component } from 'cc';
import { Node, Vec3, Quat, Mat4, Vec4 } from 'cc';

export class TransformUtils {
    /**
     * 修改父节点并保持世界变换(包括Rotation)
     * @param node 要修改的节点
     * @param newParent 新的父节点
     */
    public static changeParentAndKeepRotation(node: Node, newParent: Node): void {
        if (!node || !newParent) return;

        const worldPos = new Vec3();
        const worldRot = new Quat();

        node.getWorldPosition(worldPos);
        node.getWorldRotation(worldRot);

        const originalParent = node.parent;
        node.parent = newParent;

        node.setWorldPosition(worldPos);
        node.setWorldRotation(worldRot);
    }

    /**
 * 修改父节点并保持世界变换(包括Rotation)
 * @param comp 要修改的节点
 * @param newParent 新的父节点
 */
    public static changeParent<T extends Component>(comp: Node | T, newParent: Node): void {
        if (!comp || !newParent) return;

        let node = null;
        if (comp instanceof Node) {
            node = comp;
        } else {
            node = comp.node;
        }

        const worldPos = new Vec3();

        node.getWorldPosition(worldPos);

        const originalParent = node.parent;
        node.parent = newParent;

        node.setWorldPosition(worldPos);
    }

    /**
     * 批量修改多个节点的父节点
     * @param nodes 节点数组
     * @param newParent 新的父节点
     */
    public static changeParents(nodes: Node[], newParent: Node): void {
        const worldTransforms = nodes.map(node => {
            const pos = new Vec3();
            const rot = new Quat();
            node.getWorldPosition(pos);
            node.getWorldRotation(rot);
            return { node, pos, rot };
        });

        worldTransforms.forEach(({ node, pos, rot }) => {
            node.parent = newParent;
            node.setWorldPosition(pos);
            node.setWorldRotation(rot);
        });
    }

    /**
     * 安全修改父节点（防止循环引用）
     * @param node 要修改的节点
     * @param newParent 新的父节点
     */
    public static safeChangeParent(node: Node, newParent: Node): boolean {
        if (!node || !newParent) return false;

        // 检查循环引用
        let parent: Node | null = newParent;
        while (parent) {
            if (parent === node) {
                console.error('不能将节点设置为其自身的子节点或孙节点');
                return false;
            }
            parent = parent.parent;
        }

        this.changeParentAndKeepRotation(node, newParent);
        return true;
    }


    /**
     * 修改节点的父节点，同时保持世界坐标位置不变
     * @param node 要修改父节点的节点
     * @param newParent 新的父节点
     */
    public static changeParentKeepWorldTransform(node: Node, newParent: Node): void {
        if (!node || !newParent) {
            console.warn('节点或父节点为空');
            return;
        }

        // 保存当前的世界坐标和世界旋转
        const worldPosition = new Vec3();
        const worldRotation = new Quat();

        node.getWorldPosition(worldPosition);
        node.getWorldRotation(worldRotation);

        // 修改父节点
        node.parent = newParent;

        // 恢复世界坐标和世界旋转
        node.setWorldPosition(worldPosition);
        node.setWorldRotation(worldRotation);
    }

    /**
     * 修改节点的父节点，保持世界坐标、旋转和缩放
     * @param node 要修改父节点的节点
     * @param newParent 新的父节点
     */
    public static changeParentKeepAllWorldTransform(node: Node, newParent: Node): void {
        if (!node || !newParent) {
            console.warn('节点或父节点为空');
            return;
        }

        // 保存当前的世界变换
        const worldPosition = new Vec3();
        const worldRotation = new Quat();
        const worldScale = new Vec3();

        node.getWorldPosition(worldPosition);
        node.getWorldRotation(worldRotation);
        node.getWorldScale(worldScale);

        // 修改父节点
        node.parent = newParent;

        // 恢复世界变换
        node.setWorldPosition(worldPosition);
        node.setWorldRotation(worldRotation);
        node.setWorldScale(worldScale);
    }

    /**
     * 修改节点的父节点，保持世界矩阵不变
     * @param node 要修改父节点的节点
     * @param newParent 新的父节点
     */
    public static changeParentKeepWorldMatrix(node: Node, newParent: Node): void {
        if (!node || !newParent) {
            console.warn('节点或父节点为空');
            return;
        }

        // 保存当前的世界矩阵
        const worldMatrix = node.worldMatrix;
        // 修改父节点
        node.parent = newParent;
        // 设置世界矩阵
        node.matrix = newParent.worldMatrix.clone().invert().multiply(worldMatrix);
    }
}