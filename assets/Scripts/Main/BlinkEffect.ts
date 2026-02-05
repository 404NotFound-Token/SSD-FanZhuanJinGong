import { _decorator, Color, Component, MeshRenderer, SkinnedMeshRenderer, tween } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('BlinkEffect')
export class BlinkEffect extends Component {
    @property(Color)
    blinkColor = new Color(255, 0, 0, 255);
    @property
    duration = 0.5;
    @property
    factor = 0.7;

    private renderers: (MeshRenderer | SkinnedMeshRenderer)[] = [];
    private time = 0;
    private active = false;
    private blinkFloat32 = new Float32Array(4);

    private isOnce:boolean = false;
    a;
    protected onLoad(): void {
        this.renderers = this.getComponentsInChildren(MeshRenderer);

        Color.toArray(this.blinkFloat32, this.blinkColor);
    }
    protected start(): void {
    }
    changeColor(color: Color) {
        this.blinkColor.set(color);
        Color.toArray(this.blinkFloat32, this.blinkColor);
    }
    play() {
        this.active = true;
        this.blinkFloat32[3] = 0;
        this.time = 0;
    }
    playOnce(){
        if(this.a) return;
        const tweenDuration = this.duration;
        const tempObj = { alpha: 0 };
        
        this.a = tween(tempObj)
            .to(tweenDuration / 2, { alpha: this.factor }, {
                onUpdate: () => {
                    this.blinkFloat32[3] = tempObj.alpha;
                    for (let r of this.renderers) {
                        r.setInstancedAttribute('a_instanced_color', this.blinkFloat32);
                    }
                }
            })
            .to(tweenDuration / 2, { alpha: 0 }, {
                onUpdate: () => {
                    this.blinkFloat32[3] = tempObj.alpha;
                    for (let r of this.renderers) {
                        r.setInstancedAttribute('a_instanced_color', this.blinkFloat32);
                    }
                }
            })
            .call(()=>{
                this.a = null;
            })
            .start();
        
    }
    stop() {
        this.active = false;
        this.blinkFloat32[3] = 0;

        for (let r of this.renderers) {
            r.setInstancedAttribute('a_instanced_color', this.blinkFloat32);
        }
    }

    update(dt: number) {
        if (!this.active) return;
        this.time += dt;

        const t = this.time / this.duration;
        const alpha = (Math.sin(t * Math.PI) + 1) * 0.5 * this.factor;
        this.blinkFloat32[3] = alpha;


        for (let r of this.renderers) {
            r.setInstancedAttribute('a_instanced_color', this.blinkFloat32);
        }
    }
}


