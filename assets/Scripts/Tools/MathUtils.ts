// MathUtils.ts
import { Vec2, Vec3, Quat, MathBase, math, Rect } from 'cc';

export class MathUtils {


    /**
     * 获取圆内的随机点
     * @param center 圆心坐标
     * @param radius 圆的半径
     * @returns 圆内的随机点
     */
    public static randomPointInCircle2D(center: Vec2, radius: number): Vec2 {
        // 生成随机角度 (0 到 2π)
        const angle = Math.random() * Math.PI * 2;

        // 生成随机半径的平方根，确保点在圆内均匀分布
        const r = radius * Math.sqrt(Math.random());

        // 计算点的坐标
        const x = center.x + r * Math.cos(angle);
        const y = center.y + r * Math.sin(angle);

        return new Vec2(x, y);
    }

    /**
     * 获取圆内的随机点 (xz平面)
     * @param center 圆心坐标
     * @param radius 圆的半径
     * @returns 圆内的随机点
     */
    public static randomPointInCircle3D(center: Vec3, radius: number): Vec3 {
        // 生成随机角度 (0 到 2π)
        const angle = Math.random() * Math.PI * 2;

        // 生成随机半径的平方根，确保点在圆内均匀分布
        const r = radius * Math.sqrt(Math.random());

        // 计算点的坐标
        const x = center.x + r * Math.cos(angle);
        const z = center.z + r * Math.sin(angle);

        return new Vec3(x, center.y, z);
    }

    /**
     * 获取矩形内的随机点 (2D)
     * @param rect 矩形区域
     * @returns 矩形内的随机点
     */
    public static randomPointInRect(rect: Rect): Vec2 {
        const x = rect.x + Math.random() * rect.width;
        const y = rect.y + Math.random() * rect.height;
        return new Vec2(x, y);
    }


    /**
     * 获取矩形内的随机点 (通过中心点和尺寸)
     * @param center 矩形中心点
     * @param size 矩形尺寸 (width, height)
     * @returns 矩形内的随机点
     */
    public static randomPointInRectByCenter(center: Vec2, size: Vec2): Vec2 {
        const x = center.x - size.x / 2 + Math.random() * size.x;
        const y = center.y - size.y / 2 + Math.random() * size.y;
        return new Vec2(x, y);
    }

    /**
     * 获取矩形内的随机点 (通过边界)
     * @param min 矩形最小边界
     * @param max 矩形最大边界
     * @returns 矩形内的随机点
     */
    public static randomPointInRectByBounds(min: Vec2, max: Vec2): Vec2 {
        const x = min.x + Math.random() * (max.x - min.x);
        const y = min.y + Math.random() * (max.y - min.y);
        return new Vec2(x, y);
    }


    /**
     * 获取球体内的随机点 (真正的均匀分布)
     * @param center 球心坐标
     * @param radius 球体半径
     * @returns 球体内的随机点
     */
    public static randomPointInSphereUniform(center: Vec3, radius: number): Vec3 {
        // 方法1: 使用正态分布（推荐，效率高）
        let x, y, z, lenSq;

        do {
            // 生成 [-1, 1] 范围内的随机坐标
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
            lenSq = x * x + y * y + z * z;
        } while (lenSq > 1 || lenSq === 0); // 确保点在单位球内且不为零向量

        // 归一化并缩放到球体内
        const scale = radius * Math.cbrt(Math.random()) / Math.sqrt(lenSq);

        return new Vec3(
            center.x + x * scale,
            center.y + y * scale,
            center.z + z * scale
        );
    }

    /**
     * 获取球体内的随机点 (使用球坐标的均匀分布版本)
     * @param center 球心坐标
     * @param radius 球体半径
     * @returns 球体内的随机点
     */
    public static randomPointInSphereSpherical(center: Vec3, radius: number): Vec3 {
        // 生成均匀分布的球坐标
        const u = Math.random();
        const v = Math.random();
        const w = Math.random();

        // 球坐标转换
        const theta = 2 * Math.PI * u;          // 方位角 [0, 2π]
        const phi = Math.acos(2 * v - 1);       // 极角 [0, π]
        const r = radius * Math.cbrt(w);        // 半径，使用立方根确保体积均匀

        // 转换为直角坐标
        const sinPhi = Math.sin(phi);
        const x = r * sinPhi * Math.cos(theta);
        const y = r * sinPhi * Math.sin(theta);
        const z = r * Math.cos(phi);

        return new Vec3(
            center.x + x,
            center.y + y,
            center.z + z
        );
    }

    /**
     * 获取球体表面的随机点 (均匀分布)
     * @param center 球心坐标
     * @param radius 球体半径
     * @returns 球体表面的随机点
     */
    public static randomPointOnSphereSurfaceUniform(center: Vec3, radius: number): Vec3 {
        // 使用Marsaglia方法生成均匀分布的球面点
        let x, y, z, lenSq;

        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
            lenSq = x * x + y * y + z * z;
        } while (lenSq > 1 || lenSq === 0);

        // 归一化到球面
        const scale = radius / Math.sqrt(lenSq);

        return new Vec3(
            center.x + x * scale,
            center.y + y * scale,
            center.z + z * scale
        );
    }

    /**
     * 获取圆柱体内的随机点 (均匀分布)
     * @param center 圆柱体底面中心
     * @param radius 底面半径
     * @param height 圆柱体高度
     * @returns 圆柱体内的随机点
     */
    public static randomPointInCylinder(center: Vec3, radius: number, height: number): Vec3 {
        // 圆柱坐标
        const angle = Math.random() * Math.PI * 2;
        const r = radius * Math.sqrt(Math.random()); // 圆截面均匀分布
        const h = Math.random() * height;

        return new Vec3(
            center.x + r * Math.cos(angle),
            center.y + h,
            center.z + r * Math.sin(angle)
        );
    }


    /**
     * 生成 [min, max] 范围内的随机整数
     */
    static rangeInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 生成 [min, max] 范围内的随机浮点数
     */
    static rangeFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 随机布尔值
     * @param probability 为true的概率，默认0.5
     */
    static randomBool(probability: number = 0.5): boolean {
        return Math.random() < probability;
    }

    /**
     * 从数组中随机选择一个元素
     */
    static randomElement<T>(array: T[]): T {
        if (array.length === 0) throw new Error('数组不能为空');
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * 从数组中随机选择多个元素（可重复）
     * @param count 选择的数量
     */
    static randomElements<T>(array: T[], count: number): T[] {
        const result: T[] = [];
        for (let i = 0; i < count; i++) {
            result.push(this.randomElement(array));
        }
        return result;
    }

    /**
     * 从数组中随机选择多个不重复的元素
     * @param count 选择的数量
     */
    static randomUniqueElements<T>(array: T[], count: number): T[] {
        if (count > array.length) {
            throw new Error('选择数量不能超过数组长度');
        }

        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * 随机打乱数组 (Fisher-Yates shuffle)
     */
    static shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // ========== 权重随机函数 ==========

    /**
     * 根据权重随机选择一个索引
     * @param weights 权重数组
     * @returns 被选中的索引
     */
    static weightedRandomIndex(weights: number[]): number {
        if (weights.length === 0) throw new Error('权重数组不能为空');

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (totalWeight <= 0) throw new Error('权重总和必须大于0');

        const randomValue = Math.random() * totalWeight;
        let weightSum = 0;

        for (let i = 0; i < weights.length; i++) {
            weightSum += weights[i];
            if (randomValue <= weightSum) {
                return i;
            }
        }

        // 理论上不会执行到这里，但作为fallback
        return weights.length - 1;
    }

    /**
     * 根据权重从数组中随机选择一个元素
     * @param array 源数组
     * @param weights 权重数组，长度必须与源数组相同
     */
    static weightedRandomElement<T>(array: T[], weights: number[]): T {
        if (array.length !== weights.length) {
            throw new Error('数组和权重数组长度必须相同');
        }

        const index = this.weightedRandomIndex(weights);
        return array[index];
    }

    /**
     * 根据对象数组的某个属性作为权重进行随机选择
     * @param array 对象数组
     * @param weightKey 权重属性名
     */
    static weightedRandomByKey<T>(array: T[], weightKey: keyof T): T {
        const weights = array.map(item => {
            const weight = item[weightKey];
            if (typeof weight !== 'number' || weight < 0) {
                throw new Error(`权重属性 ${String(weightKey)} 必须是大于等于0的数字`);
            }
            return weight as number;
        });

        const index = this.weightedRandomIndex(weights);
        return array[index];
    }

    /**
     * 权重随机选择多个元素（可重复）
     * @param array 源数组
     * @param weights 权重数组
     * @param count 选择数量
     */
    static weightedRandomElements<T>(array: T[], weights: number[], count: number): T[] {
        const result: T[] = [];
        for (let i = 0; i < count; i++) {
            result.push(this.weightedRandomElement(array, weights));
        }
        return result;
    }

    /**
     * 权重随机选择多个不重复的元素
     * @param array 源数组
     * @param weights 权重数组
     * @param count 选择数量
     */
    static weightedRandomUniqueElements<T>(array: T[], weights: number[], count: number): T[] {
        if (count > array.length) {
            throw new Error('选择数量不能超过数组长度');
        }

        const result: T[] = [];
        const availableIndices = array.map((_, index) => index);
        const availableWeights = [...weights];

        for (let i = 0; i < count; i++) {
            const selectedIndex = this.weightedRandomIndex(availableWeights);
            const originalIndex = availableIndices[selectedIndex];

            result.push(array[originalIndex]);

            // 移除已选择的元素
            availableIndices.splice(selectedIndex, 1);
            availableWeights.splice(selectedIndex, 1);
        }

        return result;
    }


    // ========== 特殊随机分布 ==========

    /**
     * 正态分布（高斯分布）随机数
     * @param mean 均值
     * @param stdDev 标准差
     */
    static normalDistribution(mean: number = 0, stdDev: number = 1): number {
        // 使用Box-Muller变换
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();

        const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z0 * stdDev + mean;
    }

    /**
     * 在 [min, max] 范围内生成正态分布的随机数
     */
    static normalDistributionRange(min: number, max: number, stdDevFactor: number = 0.2): number {
        const mean = (min + max) / 2;
        const range = max - min;
        const stdDev = range * stdDevFactor;

        let result: number;
        do {
            result = this.normalDistribution(mean, stdDev);
        } while (result < min || result > max);

        return result;
    }


    // ========== 颜色随机函数 ==========

    // /**
    //  * 随机颜色（十六进制）
    //  */
    // static randomColor(): string {
    //     return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    // }

    /**
     * 随机颜色（RGB数组）
     */
    static randomRGB(): [number, number, number] {
        return [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ];
    }

    // /**
    //  * 在色相范围内随机颜色
    //  * @param hueMin 最小色相 (0-360)
    //  * @param hueMax 最大色相 (0-360)
    //  */
    // static randomColorInHueRange(hueMin: number, hueMax: number): string {
    //     const hue = MathUtils.rangeFloat(hueMin, hueMax);
    //     const saturation = MathUtils.rangeFloat(0.7, 1.0);
    //     const lightness = MathUtils.rangeFloat(0.4, 0.6);

    //     // HSL转RGB的简化实现
    //     const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    //     const huePrime = hue / 60;
    //     const x = chroma * (1 - Math.abs(huePrime % 2 - 1));

    //     let r = 0, g = 0, b = 0;
    //     if (huePrime >= 0 && huePrime < 1) [r, g, b] = [chroma, x, 0];
    //     else if (huePrime >= 1 && huePrime < 2) [r, g, b] = [x, chroma, 0];
    //     else if (huePrime >= 2 && huePrime < 3) [r, g, b] = [0, chroma, x];
    //     else if (huePrime >= 3 && huePrime < 4) [r, g, b] = [0, x, chroma];
    //     else if (huePrime >= 4 && huePrime < 5) [r, g, b] = [x, 0, chroma];
    //     else[r, g, b] = [chroma, 0, x];

    //     const m = lightness - chroma / 2;
    //     r = Math.round((r + m) * 255);
    //     g = Math.round((g + m) * 255);
    //     b = Math.round((b + m) * 255);

    //     return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    // }

    /**
     * 线性插值
     */
    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * 向量线性插值
     */
    public static lerpVec3(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3 {
        Vec3.lerp(out, a, b, t);
        return out;
    }

    /**
     * 平滑阻尼（类似 Unity 的 Mathf.SmoothDamp）
     */
    public static smoothDamp(
        current: number,
        target: number,
        currentVelocity: { value: number },
        smoothTime: number,
        maxSpeed: number = Infinity,
        deltaTime: number = 1 / 60
    ): number {
        smoothTime = Math.max(0.0001, smoothTime);
        const num = 2 / smoothTime;
        const num2 = num * deltaTime;
        const num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
        let num4 = current - target;
        const num5 = target;
        const num6 = maxSpeed * smoothTime;
        num4 = math.clamp(num4, -num6, num6);
        target = current - num4;
        const num7 = (currentVelocity.value + num * num4) * deltaTime;
        currentVelocity.value = (currentVelocity.value - num * num7) * num3;
        let num8 = target + (num4 + num7) * num3;
        if (num5 - current > 0 === num8 > num5) {
            num8 = num5;
            currentVelocity.value = (num8 - num5) / deltaTime;
        }
        return num8;
    }

    /**
     * 角度平滑阻尼
     */
    public static smoothDampAngle(
        current: number,
        target: number,
        currentVelocity: { value: number },
        smoothTime: number,
        maxSpeed: number = Infinity,
        deltaTime: number = 1 / 60
    ): number {

        target = current + this.DeltaAngle(current, target);
        return this.smoothDamp(
            current,
            target,
            currentVelocity,
            smoothTime,
            maxSpeed,
            deltaTime
        );
    }



    /**
     * 向量平滑阻尼
     */
    public static smoothDampVec3(
        current: Vec3,
        target: Vec3,
        currentVelocity: Vec3,
        smoothTime: number,
        maxSpeed: number = Infinity,
        deltaTime: number = 1 / 60
    ): Vec3 {
        const result = new Vec3();
        result.x = this.smoothDamp(current.x, target.x, { value: currentVelocity.x }, smoothTime, maxSpeed, deltaTime);
        result.y = this.smoothDamp(current.y, target.y, { value: currentVelocity.y }, smoothTime, maxSpeed, deltaTime);
        result.z = this.smoothDamp(current.z, target.z, { value: currentVelocity.z }, smoothTime, maxSpeed, deltaTime);
        return result;
    }

    /**
     * 数值映射（从一个范围映射到另一个范围）
     */
    public static map(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
        return (value - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
    }

    /**
     * 给定一个区间，将值映射到0-1之间
     * @returns 
     */
    public static inverseLerp(value: number, a: number, b: number) {
        return a !== b ? math.clamp01((value - a) / (b - a)) : 0;
    }

    /**
     * 限制数值在指定范围内
     */
    public static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * 重复数值（类似 Unity 的 Mathf.Repeat） 类似于取模，但是不会有负数
     */
    public static repeat(t: number, length: number): number {
        return this.clamp(t - Math.floor(t / length) * length, 0, length);
    }

    /**
     * 乒乓数值（在 0 和 length 之间来回变化）
     */
    public static pingPong(t: number, length: number): number {
        t = this.repeat(t, length * 2);
        return length - Math.abs(t - length);
    }

    /**
     * 线性插值（不进行范围限制）
     */
    public static lerpUnclamped(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }


    /**
     * 角度插值（处理角度环绕）
     */
    public static lerpAngle(a: number, b: number, t: number) {
        let num = this.repeat(b - a, 360);
        if (num > 180) {
            num -= 360;
        }
        return a + num * math.clamp01(t);
    }

    /**
     * 将当前值移至目标值
     * @param current 
     * @param target 
     * @param maxDelta  对当前值所施加的变化量
     * @returns 
     */
    public static moveTowards(current: number, target: number, maxDelta: number): number {
        return Math.abs(target - current) <= maxDelta ? target : current + Math.sign(target - current) * maxDelta;
    }

    /**
     * 将当前角度值移至目标角度,确保在360°内
     * @param current 
     * @param target 
     * @param maxDelta  对当前值所施加的变化量
     * @returns 
     */
    public static moveTowardsAngle(current: number, target: number, maxDelta: number): number {
        let num = this.DeltaAngle(current, target);
        if (-maxDelta < num && num < maxDelta) {
            return target;
        } else {
            return this.moveTowards(current, target, maxDelta);
        }
    }

    /**
     * 计算两个角度之间的最短有符号差值,找到最短旋转路径
     * @param current 
     * @param target 
     * @returns 
     */
    public static DeltaAngle(current: number, target: number): number {
        let num = this.repeat(target - current, 360);
        if (num > 180) {
            num -= 360;
        }
        return num;
    }

    /**
     * 在最小值和最大值之间进行插值，并在边界处进行平滑处理
     * @param from 
     * @param to 
     * @param t 
     * @returns 
     */
    public static smoothStep(from: number, to: number, t: number) {
        t = math.clamp01(t);
        t = (-2 * t * t * t + 3 * t * t)
        return to * t + from * (1 - t);
    }

    /**
     * 当gamma=1时，是线性关系。
     * 当gamma>1时，曲线更陡，意味着在输入值较小时，输出变化较小，而在输入值较大时，输出变化较大。
     * 当0<gamma<1时，曲线更平缓，意味着在输入值较小时，输出变化较大，而在输入值较大时，输出变化较小
     * @param value 输入值
     * @param absmax 绝对最大值
     * @param gamma gamma 值
     * @returns 处理后的值
     */
    public static Gamma(value: number, absmax: number, gamma: number): number {
        const isNegative = value < 0;
        const absValue = Math.abs(value);
        if (absValue > absmax) {
            return isNegative ? -absValue : absValue;
        }

        const result = Math.pow(absValue / absmax, gamma) * absmax;
        return isNegative ? -result : result;
    }


    /**
     * 基于方程法计算两直线交点(无限长的直线)
     * @param p1 直线1上的a点
     * @param p2 直线1上的b点
     * @param p3 直线2上的a点
     * @param p4 直线2上的b点
     * @param result 线段相交的点
     * @returns 是否相交
     */
    static LineIntersection(
        p1: Vec2,
        p2: Vec2,
        p3: Vec2,
        p4: Vec2,
        result: Vec2
    ): boolean {
        const num1 = p2.x - p1.x;
        const num2 = p2.y - p1.y;
        const num3 = p4.x - p3.x;
        const num4 = p4.y - p3.y;

        const num5 = num1 * num4 - num2 * num3;  // 叉积计算

        if (Math.abs(num5) < 1e-8) {  // 使用容差值而不是精确比较
            return false;
        }

        const num6 = p3.x - p1.x;
        const num7 = p3.y - p1.y;
        const num8 = (num6 * num4 - num7 * num3) / num5;

        result.x = p1.x + num8 * num1;
        result.y = p1.y + num8 * num2;

        return true;
    }


    /**
     * 基于方程法计算线段交点
     * @param p1 线段1上的a点
     * @param p2 线段1上的b点
     * @param p3 线段2上的a点
     * @param p4 线段2上的b点
     * @param result 线段相交的点
     * @returns 是否相交
     */
    static LineSegmentIntersection(
        p1: Vec2,
        p2: Vec2,
        p3: Vec2,
        p4: Vec2,
        result: Vec2
    ): boolean {
        const num1 = p2.x - p1.x;
        const num2 = p2.y - p1.y;
        const num3 = p4.x - p3.x;
        const num4 = p4.y - p3.y;

        const num5 = num1 * num4 - num2 * num3;  // 叉积计算

        if (Math.abs(num5) < 1e-8) {  // 使用容差值判断平行
            return false;
        }

        const num6 = p3.x - p1.x;
        const num7 = p3.y - p1.y;
        const num8 = (num6 * num4 - num7 * num3) / num5;  // 参数t

        // 检查交点是否在第一条线段范围内
        if (num8 < 0.0 || num8 > 1.0) {
            return false;
        }

        const num9 = (num6 * num2 - num7 * num1) / num5;  // 参数u

        // 检查交点是否在第二条线段范围内
        if (num9 < 0.0 || num9 > 1.0) {
            return false;
        }

        // 计算实际交点坐标
        result.x = p1.x + num8 * num1;
        result.y = p1.y + num8 * num2;

        return true;
    }

    /**
     * 二次贝塞尔曲线计算
     * @param startPoint 起始点
     * @param controlPoint 控制点
     * @param endPoint 结束点
     * @param t 插值参数 [0, 1]
     * @returns 曲线上的点
     */
    public static quadraticBezier(startPoint: Vec3, controlPoint: Vec3, endPoint: Vec3, t: number): Vec3 {
        const result = new Vec3();

        // 二次贝塞尔曲线公式: B(t) = (1-t)² * P0 + 2*(1-t)*t * P1 + t² * P2
        const oneMinusT = 1 - t;
        const oneMinusTSqr = oneMinusT * oneMinusT;
        const tSqr = t * t;

        Vec3.scaleAndAdd(result, result, startPoint, oneMinusTSqr);
        Vec3.scaleAndAdd(result, result, controlPoint, 2 * oneMinusT * t);
        Vec3.scaleAndAdd(result, result, endPoint, tSqr);

        return result;
    }

    // 二阶贝塞尔曲线
    public static bezierCurve(t: number, p1: Vec3, cp: Vec3, p2: Vec3, out: Vec3) {
        out.x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        out.y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
        out.z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
    }

    /**
     * 三次贝塞尔曲线计算
     * @param startPoint 起始点
     * @param controlPoint1 控制点1
     * @param controlPoint2 控制点2
     * @param endPoint 结束点
     * @param t 插值参数 [0, 1]
     * @returns 曲线上的点
     */
    public static cubicBezier(startPoint: Vec3, controlPoint1: Vec3, controlPoint2: Vec3, endPoint: Vec3, t: number): Vec3 {
        const result = new Vec3();

        // 三次贝塞尔曲线公式: B(t) = (1-t)³ * P0 + 3*(1-t)²*t * P1 + 3*(1-t)*t² * P2 + t³ * P3
        const oneMinusT = 1 - t;
        const oneMinusTSqr = oneMinusT * oneMinusT;
        const oneMinusTCub = oneMinusTSqr * oneMinusT;
        const tSqr = t * t;
        const tCub = tSqr * t;

        Vec3.scaleAndAdd(result, result, startPoint, oneMinusTCub);
        Vec3.scaleAndAdd(result, result, controlPoint1, 3 * oneMinusTSqr * t);
        Vec3.scaleAndAdd(result, result, controlPoint2, 3 * oneMinusT * tSqr);
        Vec3.scaleAndAdd(result, result, endPoint, tCub);

        return result;
    }


    /**
     * 在圆环区域内生成随机点 (2D)
     * @param center 圆心坐标
     * @param innerRadius 内圆半径
     * @param outerRadius 外圆半径
     * @returns 圆环区域内的随机点
     */
    static randomPointInRing2D(center: Vec2, innerRadius: number, outerRadius: number): Vec2 {
        if (innerRadius < 0 || outerRadius < 0) {
            throw new Error('半径不能为负数');
        }

        if (innerRadius >= outerRadius) {
            throw new Error('内圆半径必须小于外圆半径');
        }

        // 确保点在圆环区域内（内圆和外圆之间）
        // 使用面积比例来计算半径，确保均匀分布
        const minRadiusSq = innerRadius * innerRadius;
        const maxRadiusSq = outerRadius * outerRadius;

        // 计算半径，确保在圆环内均匀分布
        const randomRadius = Math.sqrt(
            minRadiusSq + Math.random() * (maxRadiusSq - minRadiusSq)
        );

        const angle = Math.random() * Math.PI * 2;

        return new Vec2(
            center.x + randomRadius * Math.cos(angle),
            center.y + randomRadius * Math.sin(angle)
        );
    }

    /**
     * 在圆环区域内生成随机点 (3D XZ平面)
     * @param center 圆心坐标
     * @param innerRadius 内圆半径
     * @param outerRadius 外圆半径
     * @returns 圆环区域内的随机点 (XZ平面)
     */
    static randomPointInRing3D(center: Vec3, innerRadius: number, outerRadius: number): Vec3 {
        if (innerRadius < 0 || outerRadius < 0) {
            throw new Error('半径不能为负数');
        }

        if (innerRadius >= outerRadius) {
            throw new Error('内圆半径必须小于外圆半径');
        }

        const minRadiusSq = innerRadius * innerRadius;
        const maxRadiusSq = outerRadius * outerRadius;

        const randomRadius = Math.sqrt(
            minRadiusSq + Math.random() * (maxRadiusSq - minRadiusSq)
        );

        const angle = Math.random() * Math.PI * 2;

        return new Vec3(
            center.x + randomRadius * Math.cos(angle),
            center.y,
            center.z + randomRadius * Math.sin(angle)
        );
    }


    /**
     * 在圆环区域内生成多个随机点
     * @param center 圆心坐标
     * @param innerRadius 内圆半径
     * @param outerRadius 外圆半径
     * @param count 点的数量
     * @returns 圆环区域内的随机点数组
     */
    static randomPointsInRing(center: Vec2, innerRadius: number, outerRadius: number, count: number): Vec2[] {
        const points: Vec2[] = [];
        for (let i = 0; i < count; i++) {
            points.push(this.randomPointInRing2D(center, innerRadius, outerRadius));
        }
        return points;
    }

    /**
     * 在圆环扇区内生成随机点
     * @param center 圆心坐标
     * @param innerRadius 内圆半径
     * @param outerRadius 外圆半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 圆环扇区内的随机点
     */
    static randomPointInRingSector2D(
        center: Vec2,
        innerRadius: number,
        outerRadius: number,
        startAngle: number,
        endAngle: number
    ): Vec2 {
        if (innerRadius < 0 || outerRadius < 0) {
            throw new Error('半径不能为负数');
        }

        if (innerRadius >= outerRadius) {
            throw new Error('内圆半径必须小于外圆半径');
        }

        if (startAngle >= endAngle) {
            throw new Error('起始角度必须小于结束角度');
        }

        const minRadiusSq = innerRadius * innerRadius;
        const maxRadiusSq = outerRadius * outerRadius;

        const randomRadius = Math.sqrt(
            minRadiusSq + Math.random() * (maxRadiusSq - minRadiusSq)
        );

        const angle = startAngle + Math.random() * (endAngle - startAngle);

        return new Vec2(
            center.x + randomRadius * Math.cos(angle),
            center.y + randomRadius * Math.sin(angle)
        );
    }

    /**
     * 在圆环扇区内生成随机点
     * @param center 圆心坐标
     * @param innerRadius 内圆半径
     * @param outerRadius 外圆半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 圆环扇区内的随机点
     */
    static randomPointInRingSector3D(
        center: Vec3,
        innerRadius: number,
        outerRadius: number,
        startAngle: number,
        endAngle: number
    ): Vec3 {
        if (innerRadius < 0 || outerRadius < 0) {
            throw new Error('半径不能为负数');
        }

        if (innerRadius >= outerRadius) {
            throw new Error('内圆半径必须小于外圆半径');
        }

        if (startAngle >= endAngle) {
            throw new Error('起始角度必须小于结束角度');
        }

        const minRadiusSq = innerRadius * innerRadius;
        const maxRadiusSq = outerRadius * outerRadius;

        const randomRadius = Math.sqrt(
            minRadiusSq + Math.random() * (maxRadiusSq - minRadiusSq)
        );

        const angle = startAngle + Math.random() * (endAngle - startAngle);

        return new Vec3(
            center.x + randomRadius * Math.cos(angle),
            center.y,
            center.z + randomRadius * Math.sin(angle)
        );
    }

    /**
     * 验证点是否在圆环区域内
     * @param point 要验证的点
     * @param center 圆心坐标
     * @param innerRadius 内圆半径
     * @param outerRadius 外圆半径
     * @returns 是否在圆环区域内
     */
    static isPointInRing(point: Vec2, center: Vec2, innerRadius: number, outerRadius: number): boolean {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const distanceSq = dx * dx + dy * dy;

        const innerRadiusSq = innerRadius * innerRadius;
        const outerRadiusSq = outerRadius * outerRadius;

        return distanceSq >= innerRadiusSq && distanceSq <= outerRadiusSq;
    }

    /**
     * 在扇形区域内生成随机点 (2D)
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 扇形区域内的随机点
     */
    static randomPointInSector(center: Vec2, radius: number, startAngle: number, endAngle: number): Vec2 {
        if (radius < 0) {
            throw new Error('半径不能为负数');
        }

        if (startAngle >= endAngle) {
            throw new Error('起始角度必须小于结束角度');
        }

        // 确保角度在合理范围内
        const normalizedStartAngle = this.normalizeAngle(startAngle);
        const normalizedEndAngle = this.normalizeAngle(endAngle);
        const angleRange = normalizedEndAngle - normalizedStartAngle;

        // 计算半径，确保在扇形内均匀分布
        const randomRadius = radius * Math.sqrt(Math.random());

        // 随机角度
        const randomAngle = normalizedStartAngle + Math.random() * angleRange;

        return new Vec2(
            center.x + randomRadius * Math.cos(randomAngle),
            center.y + randomRadius * Math.sin(randomAngle)
        );
    }

    /**
     * 在扇形区域内生成随机点 (3D XZ平面)
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 扇形区域内的随机点 (XZ平面)
     */
    static randomPointInSector3D(center: Vec3, radius: number, startAngle: number, endAngle: number): Vec3 {
        if (radius < 0) {
            throw new Error('半径不能为负数');
        }

        if (startAngle >= endAngle) {
            throw new Error('起始角度必须小于结束角度');
        }

        const normalizedStartAngle = this.normalizeAngle(startAngle);
        const normalizedEndAngle = this.normalizeAngle(endAngle);
        const angleRange = normalizedEndAngle - normalizedStartAngle;

        const randomRadius = radius * Math.sqrt(Math.random());
        const randomAngle = normalizedStartAngle + Math.random() * angleRange;

        return new Vec3(
            center.x + randomRadius * Math.cos(randomAngle),
            center.y,
            center.z + randomRadius * Math.sin(randomAngle)
        );
    }

    /**
     * 在扇形区域内生成多个随机点
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @param count 点的数量
     * @returns 扇形区域内的随机点数组
     */
    static randomPointsInSector(
        center: Vec2,
        radius: number,
        startAngle: number,
        endAngle: number,
        count: number
    ): Vec2[] {
        const points: Vec2[] = [];
        for (let i = 0; i < count; i++) {
            points.push(this.randomPointInSector(center, radius, startAngle, endAngle));
        }
        return points;
    }

    /**
     * 在扇形区域内生成随机点（使用角度制）
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngleDeg 起始角度（度）
     * @param endAngleDeg 结束角度（度）
     * @returns 扇形区域内的随机点
     */
    static randomPointInSectorDegrees(center: Vec2, radius: number, startAngleDeg: number, endAngleDeg: number): Vec2 {
        const startAngleRad = startAngleDeg * Math.PI / 180;
        const endAngleRad = endAngleDeg * Math.PI / 180;

        return this.randomPointInSector(center, radius, startAngleRad, endAngleRad);
    }

    /**
     * 验证点是否在扇形区域内
     * @param point 要验证的点
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 是否在扇形区域内
     */
    static isPointInSector(point: Vec2, center: Vec2, radius: number, startAngle: number, endAngle: number): boolean {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const distanceSq = dx * dx + dy * dy;

        // 检查距离
        if (distanceSq > radius * radius) {
            return false;
        }

        // 检查角度
        const pointAngle = Math.atan2(dy, dx);
        const normalizedPointAngle = this.normalizeAngle(pointAngle);
        const normalizedStartAngle = this.normalizeAngle(startAngle);
        const normalizedEndAngle = this.normalizeAngle(endAngle);

        // 处理角度跨越0度的情况
        if (normalizedStartAngle > normalizedEndAngle) {
            return normalizedPointAngle >= normalizedStartAngle || normalizedPointAngle <= normalizedEndAngle;
        } else {
            return normalizedPointAngle >= normalizedStartAngle && normalizedPointAngle <= normalizedEndAngle;
        }
    }

    /**
     * 在扇形边缘生成随机点（扇形弧线上）
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 扇形弧线上的随机点
     */
    static randomPointOnSectorArc(center: Vec3, radius: number, startAngle: number, endAngle: number): Vec3 {
        if (radius < 0) {
            throw new Error('半径不能为负数');
        }

        if (startAngle >= endAngle) {
            throw new Error('起始角度必须小于结束角度');
        }

        const normalizedStartAngle = this.normalizeAngle(startAngle);
        const normalizedEndAngle = this.normalizeAngle(endAngle);
        const angleRange = normalizedEndAngle - normalizedStartAngle;

        const randomAngle = normalizedStartAngle + Math.random() * angleRange;

        return new Vec3(
            center.x + radius * Math.cos(randomAngle),
            center.y,
            center.z + radius * Math.sin(randomAngle)
        );
    }

    /**
     * 规范化角度到 [0, 2π) 范围内
     * @param angle 原始角度（弧度）
     * @returns 规范化后的角度
     */
    private static normalizeAngle(angle: number): number {
        let normalized = angle % (2 * Math.PI);
        if (normalized < 0) {
            normalized += 2 * Math.PI;
        }
        return normalized;
    }

    /**
     * 获取扇形的三个顶点（用于绘制扇形）
     * @param center 圆心坐标
     * @param radius 扇形半径
     * @param startAngle 起始角度（弧度）
     * @param endAngle 结束角度（弧度）
     * @returns 扇形的三个顶点 [圆心, 起始点, 结束点]
     */
    static getSectorVertices(center: Vec2, radius: number, startAngle: number, endAngle: number): [Vec2, Vec2, Vec2] {
        const normalizedStartAngle = this.normalizeAngle(startAngle);
        const normalizedEndAngle = this.normalizeAngle(endAngle);

        const startPoint = new Vec2(
            center.x + radius * Math.cos(normalizedStartAngle),
            center.y + radius * Math.sin(normalizedStartAngle)
        );

        const endPoint = new Vec2(
            center.x + radius * Math.cos(normalizedEndAngle),
            center.y + radius * Math.sin(normalizedEndAngle)
        );

        return [center.clone(), startPoint, endPoint];
    }

    /**
     * 从数组中随机选择一个元素
     */
    public static choice<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * 从数组中随机选择多个不重复元素
     */
    public static choices<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * 随机布尔值
     */
    public static boolean(): boolean {
        return Math.random() < 0.5;
    }

    /**
     * 按权重随机选择
     */
    public static weightedChoice<T>(items: T[], weights: number[]): T {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[items.length - 1];
    }

    public static getQuatAngleDifference(q1: Quat, q2: Quat): number {
        // 创建临时四元数并单位化（确保计算安全）
        const normalizedQ1 = new Quat();
        const normalizedQ2 = new Quat();

        Quat.normalize(normalizedQ1, q1);
        Quat.normalize(normalizedQ2, q2);

        // 计算逆四元数
        const inverseQ1 = new Quat();
        Quat.invert(inverseQ1, normalizedQ1);

        // 计算相对旋转
        const relativeRot = new Quat();
        Quat.multiply(relativeRot, normalizedQ2, inverseQ1);

        // 再次单位化相对旋转（乘法可能引入微小误差）
        Quat.normalize(relativeRot, relativeRot);

        // 提取角度
        let angle = 2 * Math.acos(Math.abs(relativeRot.w));

        // 处理浮点误差
        if (isNaN(angle)) {
            angle = 0;
        }

        angle = Math.min(angle, Math.PI);
        return math.toDegree(angle);
    }

    // 验证四元数是否为单位四元数
    public static isUnitQuat(q: Quat, epsilon: number = 1e-6): boolean {
        const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
        return Math.abs(lenSq - 1) < epsilon;
    }

    /**
     * 弧度转角度
     */
    public static Rad2Deg = 360 / (2 * Math.PI);
    /**
     * 角度转弧度
     */
    public static Deg2Rad = (2 * Math.PI) / 360;
}