import { _decorator, Camera, Component, ResolutionPolicy, screen, Size, view } from 'cc';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSceneFit')
export class GameSceneFit extends Component {

    @property(Camera)
    gameCamera: Camera = null!;

    start() {
        view.on("canvas-resize", this.resize, this);
        this.scheduleOnce(this.resize);

        // @ts-ignore
        if (window.setLoadingProgress) {
            // @ts-ignore
            window.setLoadingProgress(100);
        }

    }

    public static viewScale: number = 1;

    private resize(e?) {
        let screenInPx: Size = screen.windowSize; // 屏幕像素尺寸
        const sceneRatio = screenInPx.width / screenInPx.height; // 场景宽高比
        GameSceneFit.viewScale = sceneRatio;

        const isPortrait = screenInPx.width < screenInPx.height;

        if (screen.windowSize.height > screen.windowSize.width && screen.windowSize.width / screen.windowSize.height < 1) {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
        } else {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        }

        console.log(
            `%c屏幕方向: ${isPortrait ? "竖屏" : "横屏"}\n` +
            `分辨率: ${screenInPx.width} x ${screenInPx.height}\n` +
            `场景宽高比: ${sceneRatio}`,
            'color: blue ;',
        );
    }
}