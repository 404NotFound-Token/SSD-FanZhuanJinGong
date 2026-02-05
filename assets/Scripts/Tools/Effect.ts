import { _decorator, Node, tween, Vec3, Tween } from 'cc';
const { ccclass } = _decorator;

@ccclass('Effect')
export class Effect {

    /**
     * 果冻弹性效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.6秒
     * @param strength 弹性强度，默认为0.3
     * @param squashY Y轴压缩比例，默认为0.8
     */
    public static jellyEffect(target: Node, duration: number = 0.6, strength: number = 0.3, squashY: number = 0.8): Tween<Node> {
        const originalScale = target.scale.clone();

        return tween(target)
            .to(duration * 0.2, {
                scale: new Vec3(
                    originalScale.x * (1 + strength),
                    originalScale.y * (1 - strength * squashY),
                    originalScale.z * (1 + strength)
                )
            }, { easing: 'sineOut' })
            .to(duration * 0.3, {
                scale: new Vec3(
                    originalScale.x * (1 - strength * 0.4),
                    originalScale.y * (1 + strength * 0.3),
                    originalScale.z * (1 - strength * 0.4)
                )
            }, { easing: 'sineInOut' })
            .to(duration * 0.5, { scale: originalScale }, { easing: 'elasticOut' });
    }

    // /**
    // * 果冻弹性效果
    // * @param target 目标节点
    // * @param duration 持续时间，默认为0.6秒
    // * @param strength 弹性强度，默认为0.3
    // * @param squashY Y轴压缩比例，默认为0.8
    // */
    // public static jellyEffect1(target: Node, duration: number = 0.6, strength: number = 0.3): Tween<Node> {
    //     const originalScale = target.scale.clone();

    //     return tween(target)
    //         .to(duration * 0.2, {
    //             scale: new Vec3(
    //                 originalScale.x * (1 + strength),
    //                 originalScale.y * (1 - strength),
    //                 originalScale.z * (1 + strength)
    //             )
    //         }, { easing: 'sineOut' })
    //         .to(duration * 0.3, {
    //             scale: new Vec3(
    //                 originalScale.x * (1 - strength * 0.4),
    //                 originalScale.y * (1 + strength * 0.3),
    //                 originalScale.z * (1 - strength * 0.4)
    //             )
    //         }, { easing: 'sineInOut' })
    //         .to(duration * 0.5, { scale: originalScale }, { easing: 'elasticOut' });
    // }

    /**
     * 心跳脉动效果
     * @param target 目标节点
     * @param duration 单次心跳持续时间，默认为0.8秒
     * @param strength 脉冲强度，默认为0.2
     * @param beats 心跳次数，默认为1
     */
    public static heartbeatEffect(target: Node, duration: number = 0.8, strength: number = 0.2, beats: number = 1): Tween<Node> {
        const originalScale = target.scale.clone();
        const singleBeatTime = duration / 3;

        let tweenChain = tween(target);

        for (let i = 0; i < beats; i++) {
            tweenChain = tweenChain
                .to(singleBeatTime, {
                    scale: new Vec3(
                        originalScale.x * (1 + strength),
                        originalScale.y * (1 + strength),
                        originalScale.z * (1 + strength)
                    )
                }, { easing: 'sineIn' })
                .to(singleBeatTime, {
                    scale: new Vec3(
                        originalScale.x * (1 - strength * 0.3),
                        originalScale.y * (1 - strength * 0.3),
                        originalScale.z * (1 - strength * 0.3)
                    )
                }, { easing: 'sineOut' })
                .to(singleBeatTime, { scale: originalScale }, { easing: 'sineInOut' });
        }

        return tweenChain;
    }

    /**
     * 呼吸效果（持续循环）
     * @param target 目标节点
     * @param duration 单次呼吸周期，默认为1.5秒
     * @param strength 呼吸强度，默认为0.15
     */
    public static breathingEffect(target: Node, duration: number = 1.5, strength: number = 0.15): Tween<Node> {
        const originalScale = target.scale.clone();

        return tween(target)
            .repeatForever(
                tween()
                    .to(duration / 2, {
                        scale: new Vec3(
                            originalScale.x * (1 + strength),
                            originalScale.y * (1 + strength),
                            originalScale.z * (1 + strength)
                        )
                    }, { easing: 'sineInOut' })
                    .to(duration / 2, { scale: originalScale }, { easing: 'sineInOut' })
            );
    }

    /**
     * 弹性点击效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.4秒
     * @param strength 弹性强度，默认为0.1
     */
    public static elasticClickEffect(target: Node, duration: number = 0.4, strength: number = 0.1): Tween<Node> {
        const originalScale = target.scale.clone();

        return tween(target)
            .to(duration * 0.3, {
                scale: new Vec3(
                    originalScale.x * (1 - strength),
                    originalScale.y * (1 - strength),
                    originalScale.z * (1 - strength)
                )
            }, { easing: 'backIn' })
            .to(duration * 0.7, { scale: originalScale }, { easing: 'elasticOut' });
    }

    /**
     * 冲击波效果（快速放大后收回）
     * @param target 目标节点
     * @param duration 持续时间，默认为0.5秒
     * @param strength 冲击强度，默认为0.8
     */
    public static shockwaveEffect(target: Node, duration: number = 0.5, strength: number = 0.8): Tween<Node> {
        const originalScale = target.scale.clone();

        return tween(target)
            .to(duration * 0.4, {
                scale: new Vec3(
                    originalScale.x * (1 + strength),
                    originalScale.y * (1 + strength),
                    originalScale.z * (1 + strength)
                )
            }, { easing: 'sineIn' })
            .to(duration * 0.6, { scale: originalScale }, { easing: 'sineOut' });
    }

    /**
     * 弹簧效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.7秒
     * @param strength 弹簧强度，默认为0.5
     * @param bounces 弹跳次数，默认为3
     */
    public static springEffect(target: Node, duration: number = 0.7, strength: number = 0.5, bounces: number = 3): Tween<Node> {
        const originalScale = target.scale.clone();
        const bounceTime = duration / (bounces * 2);
        let tweenChain = tween(target);

        for (let i = 0; i < bounces; i++) {
            const bounceStrength = strength * Math.pow(0.5, i); // 每次弹跳强度减半

            tweenChain = tweenChain
                .to(bounceTime, {
                    scale: new Vec3(
                        originalScale.x * (1 + bounceStrength),
                        originalScale.y * (1 + bounceStrength),
                        originalScale.z * (1 + bounceStrength)
                    )
                }, { easing: 'sineOut' })
                .to(bounceTime, { scale: originalScale }, { easing: 'sineIn' });
        }

        return tweenChain;
    }

    /**
     * 脉冲效果（快速缩放）
     * @param target 目标节点
     * @param duration 单次脉冲持续时间，默认为0.3秒
     * @param strength 脉冲强度，默认为0.4
     * @param pulses 脉冲次数，默认为2
     */
    public static pulseEffect(target: Node, duration: number = 0.3, strength: number = 0.4, pulses: number = 2): Tween<Node> {
        const originalScale = target.scale.clone();
        const pulseTime = duration / (pulses * 2);
        let tweenChain = tween(target);

        for (let i = 0; i < pulses; i++) {
            tweenChain = tweenChain
                .to(pulseTime, {
                    scale: new Vec3(
                        originalScale.x * (1 + strength),
                        originalScale.y * (1 + strength),
                        originalScale.z * (1 + strength)
                    )
                }, { easing: 'sineInOut' })
                .to(pulseTime, { scale: originalScale }, { easing: 'sineInOut' });
        }

        return tweenChain;
    }

    /**
     * 放大入场效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.5秒
     * @param startScale 起始缩放，默认为0
     * @param overshoot 是否 overshoot，默认为true
     */
    public static scaleInEffect(target: Node, duration: number = 0.5, startScale: number = 0, overshoot: boolean = true): Tween<Node> {
        const originalScale = target.scale.clone();
        const startVec = new Vec3(startScale, startScale, startScale);

        target.scale = startVec;

        if (overshoot) {
            return tween(target)
                .to(duration, {
                    scale: new Vec3(
                        originalScale.x * 1.2,
                        originalScale.y * 1.2,
                        originalScale.z * 1.2
                    )
                }, { easing: 'backOut' })
                .to(duration * 0.3, { scale: originalScale }, { easing: 'sineOut' });
        } else {
            return tween(target)
                .to(duration, { scale: originalScale }, { easing: 'backOut' });
        }
    }

    /**
     * 放大入场效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.5秒
     * @param startScale 起始缩放，默认为0
     * @param overshoot 是否 overshoot，默认为true
     */
    public static scaleInEffect1(target: Node, duration: number = 0.5, startScale: number = 0, overshoot: boolean = true): Tween<Node> {
        const originalScale = target.scale.clone();
        const startVec = new Vec3(startScale, startScale, startScale);

        target.scale = startVec;

        if (overshoot) {
            return tween(target)
                .to(duration, {
                    scale: new Vec3(
                        originalScale.x * 0.9,
                        originalScale.y * 0.9,
                        originalScale.z * 0.9
                    )
                })
                .to(duration * 0.3, { scale: originalScale });
        } else {
            return tween(target)
                .to(duration, { scale: originalScale });
        }
    }

    /**
     * 缩小出场效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.4秒
     * @param endScale 结束缩放，默认为0
     */
    public static scaleOutEffect(target: Node, duration: number = 0.4, endScale: number = 0): Tween<Node> {
        const originalScale = target.scale.clone();
        const endVec = new Vec3(endScale, endScale, endScale);

        return tween(target)
            .to(duration, { scale: endVec }, { easing: 'backIn' });
    }

    /**
     * 3D摇摆效果
     * @param target 目标节点
     * @param duration 单次摇摆持续时间，默认为0.6秒
     * @param strength 摇摆强度，默认为0.3
     * @param swings 摇摆次数，默认为2
     */
    public static swing3DEffect(target: Node, duration: number = 0.6, strength: number = 0.3, swings: number = 2): Tween<Node> {
        const originalScale = target.scale.clone();
        const swingTime = duration / (swings * 2);
        let tweenChain = tween(target);

        for (let i = 0; i < swings; i++) {
            const swingStrength = strength * (swings - i) / swings; // 逐渐减弱的摇摆

            tweenChain = tweenChain
                .to(swingTime, {
                    scale: new Vec3(
                        originalScale.x * (1 + swingStrength),
                        originalScale.y * (1 - swingStrength * 0.5),
                        originalScale.z * (1 + swingStrength)
                    )
                }, { easing: 'sineInOut' })
                .to(swingTime, {
                    scale: new Vec3(
                        originalScale.x * (1 - swingStrength * 0.5),
                        originalScale.y * (1 + swingStrength),
                        originalScale.z * (1 - swingStrength * 0.5)
                    )
                }, { easing: 'sineInOut' });
        }

        return tweenChain.to(swingTime, { scale: originalScale }, { easing: 'sineOut' });
    }

    /**
     * 3D旋转缩放效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.8秒
     * @param scaleStrength 缩放强度，默认为0.4
     */
    public static rotateScaleEffect(target: Node, duration: number = 0.8, scaleStrength: number = 0.4): Tween<Node> {
        const originalScale = target.scale.clone();
        const originalRotation = target.eulerAngles.clone();

        return tween(target)
            .parallel(
                tween().to(duration / 2, {
                    scale: new Vec3(
                        originalScale.x * (1 + scaleStrength),
                        originalScale.y * (1 + scaleStrength),
                        originalScale.z * (1 + scaleStrength)
                    )
                }, { easing: 'sineIn' }),
                tween().to(duration / 2, {
                    eulerAngles: new Vec3(
                        originalRotation.x,
                        originalRotation.y + 180,
                        originalRotation.z
                    )
                }, { easing: 'sineInOut' })
            )
            .to(duration / 2, {
                scale: originalScale,
                eulerAngles: new Vec3(
                    originalRotation.x,
                    originalRotation.y + 360,
                    originalRotation.z
                )
            }, { easing: 'sineOut' });
    }

    /**
     * 3D弹跳效果
     * @param target 目标节点
     * @param duration 单次弹跳持续时间，默认为0.5秒
     * @param strength 弹跳强度，默认为0.3
     * @param bounces 弹跳次数，默认为3
     */
    public static bounce3DEffect(target: Node, duration: number = 0.5, strength: number = 0.3, bounces: number = 3): Tween<Node> {
        const originalScale = target.scale.clone();
        const bounceTime = duration / (bounces * 2);
        let tweenChain = tween(target);

        for (let i = 0; i < bounces; i++) {
            const bounceStrength = strength * Math.pow(0.7, i); // 每次弹跳强度递减

            tweenChain = tweenChain
                .to(bounceTime, {
                    scale: new Vec3(
                        originalScale.x * (1 - bounceStrength * 0.5),
                        originalScale.y * (1 + bounceStrength),
                        originalScale.z * (1 - bounceStrength * 0.5)
                    )
                }, { easing: 'sineOut' })
                .to(bounceTime, { scale: originalScale }, { easing: 'sineIn' });
        }

        return tweenChain;
    }

    /**
     * 3D挤压效果
     * @param target 目标节点
     * @param duration 持续时间，默认为0.6秒
     * @param strength 挤压强度，默认为0.4
     * @param axis 主要挤压轴 ('x' | 'y' | 'z')，默认为'y'
     */
    public static squeeze3DEffect(target: Node, duration: number = 0.6, strength: number = 0.4, axis: 'x' | 'y' | 'z' = 'y'): Tween<Node> {
        const originalScale = target.scale.clone();

        let scale1: Vec3, scale2: Vec3;

        switch (axis) {
            case 'x':
                scale1 = new Vec3(
                    originalScale.x * (1 - strength),
                    originalScale.y * (1 + strength * 0.5),
                    originalScale.z * (1 + strength * 0.5)
                );
                scale2 = new Vec3(
                    originalScale.x * (1 + strength * 0.3),
                    originalScale.y * (1 - strength * 0.2),
                    originalScale.z * (1 - strength * 0.2)
                );
                break;
            case 'z':
                scale1 = new Vec3(
                    originalScale.x * (1 + strength * 0.5),
                    originalScale.y * (1 + strength * 0.5),
                    originalScale.z * (1 - strength)
                );
                scale2 = new Vec3(
                    originalScale.x * (1 - strength * 0.2),
                    originalScale.y * (1 - strength * 0.2),
                    originalScale.z * (1 + strength * 0.3)
                );
                break;
            case 'y':
            default:
                scale1 = new Vec3(
                    originalScale.x * (1 + strength * 0.5),
                    originalScale.y * (1 - strength),
                    originalScale.z * (1 + strength * 0.5)
                );
                scale2 = new Vec3(
                    originalScale.x * (1 - strength * 0.2),
                    originalScale.y * (1 + strength * 0.3),
                    originalScale.z * (1 - strength * 0.2)
                );
                break;
        }

        return tween(target)
            .to(duration * 0.4, { scale: scale1 }, { easing: 'sineOut' })
            .to(duration * 0.3, { scale: scale2 }, { easing: 'sineInOut' })
            .to(duration * 0.3, { scale: originalScale }, { easing: 'elasticOut' });
    }

    /**
     * 停止所有特效并恢复原始尺寸
     * @param target 目标节点
     */
    public static stopAllEffects(target: Node): void {
        Tween.stopAllByTarget(target);
    }
}