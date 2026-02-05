import { Vec3 } from 'cc';
import { Node, Tween, Vec2, lerp } from 'cc';
Reflect.defineProperty(Tween.prototype, 'bezierTo', {
    value: function (duration: number, ...points: Vec2[]): Tween<Node> {
        points.unshift(new Vec2(this._target._lpos.x, this._target._lpos.y));
        return this.to(duration, {}, {
            onUpdate: function (target: Node, ratio: number): void {
                for (var len = points.length, p = new Array(len), i = 0; i < len; p[i] = new Vec2(points[i++]));
                while (len-- > 1) { for (i = 0; i < len; p[i].set(lerp(p[i].x, p[i + 1].x, ratio), lerp(p[i].y, p[i++ + 1].y, ratio))); }
                target.setPosition(p[0].x, p[0].y);
            }
        });
    },
});
Reflect.defineProperty(Tween.prototype, 'bezierBy', {
    value: function (duration: number, ...points: Vec2[]): Tween<Node> {
        let pos = new Vec2(this._target._lpos);
        for (let len = points.length, i = 0; i < len; Vec2.add(points[i], points[i++], pos));
        return this.bezierTo(duration, ...points);
    },
});
Reflect.defineProperty(Tween.prototype, 'bezierTo3D', {
    value: function (duration: number, ...points: Vec3[]): Tween<Node> {
        points.unshift(new Vec3(this._target._lpos.x, this._target._lpos.y, this._target._lpos.z));
        return this.to(duration, {}, {
            onUpdate: function (target: Node, ratio: number): void {
                for (var len = points.length, p = new Array(len), i = 0; i < len; p[i] = new Vec3(points[i++]));

                while (len-- > 1) {
                    for (i = 0; i < len; i++) {
                        p[i].set(
                            lerp(p[i].x, p[i + 1].x, ratio),
                            lerp(p[i].y, p[i + 1].y, ratio),
                            lerp(p[i].z, p[i + 1].z, ratio)
                        );
                    }
                    // console.log(p[i])
                }
                target.setWorldPosition(p[0].x, p[0].y, p[0].z);
            }
        });
    },
});
Reflect.defineProperty(Tween.prototype, 'bezierBy3D', {
    value: function (duration: number, ...points: Vec3[]): Tween<Node> {
        let pos = new Vec3(this._target._lpos);
        for (let len = points.length, i = 0; i < len; i++) {
            Vec3.add(points[i], points[i], pos);
        }
        return this.bezierTo3D(duration, ...points);
    },
});


declare module 'cc' {
    interface Tween<T> {
        /** 贝塞尔曲线移动，duration：持续时间，points：贝塞尔锚点数组 */
        bezierTo(duration: number, ...points: Vec2[]): Tween<Node>;
        /** 同上，唯一的区别：points是相对于初始位置的坐标 */
        bezierBy(duration: number, ...points: Vec2[]): Tween<Node>;

        /** 3D贝塞尔曲线移动，duration：持续时间，points：贝塞尔锚点数组 */
        bezierTo3D(duration: number, ...points: Vec3[]): Tween<Node>;
        /** 同上，唯一的区别：points是相对于初始位置的坐标 */
        bezierBy3D(duration: number, ...points: Vec3[]): Tween<Node>;
    }
}

export class Bezier {

    public static createBezierTween(
        target: Node,
        startPos: Vec3,
        controlPos: Vec3,
        endPos: Vec3,
        duration: number = 0.3,
        callback: () => void
    ): Tween<Node> {
        const tween = new Tween(target)
            .bezierTo3D(duration, startPos, controlPos, endPos)
            .call(callback)
            .start();
        return tween;
    }
}

export class TweenPool {
    private pool: Tween<any>[] = [];

    get<T extends Node>(target: T): Tween<T> {
        if (this.pool.length > 0) {
            const tween = this.pool.pop() as Tween<T>;
            tween.target(target);
            return tween;
        }
        return new Tween(target);
    }

    put(tween: Tween<any>) {
        tween.stop();
        this.pool.push(tween);
    }
}