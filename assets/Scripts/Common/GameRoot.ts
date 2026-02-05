import { _decorator, Component, AudioSource, assert, director, sys, input, Input, EventTouch } from 'cc';
import { AudioManager } from './AudioManager';
import { PlayableSDK } from './PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {

    @property(AudioSource)
    private _audioSource: AudioSource = null!;

    onLoad() {
        this._audioSource = this.getComponent(AudioSource)!;
        // assert(audioSource);
        director.addPersistRootNode(this.node);

        PlayableSDK.adapter();
        PlayableSDK.gameReady();

        // init AudioManager
        AudioManager.init(this._audioSource, this.node);

        let enableAudio = (e) => {
            console.log('AudioManager.resume');
            AudioManager.firstClick = true;
            AudioManager.resume();
            // AudioManager.playSoundLog(e.type);

            // document.removeEventListener('mouseup', enableAudio, true);
            // document.removeEventListener('touchend', enableAudio, true);
            // document.removeEventListener('mousedown', enableAudio, true);
            // document.removeEventListener('touchstart', enableAudio, true);
        }

        // document.addEventListener('mouseup', enableAudio, true);
        // document.addEventListener('touchend', enableAudio, true);
        document.addEventListener('mousedown', enableAudio, { capture: true, once: true });
        document.addEventListener('touchstart', enableAudio, { capture: true, once: true });

        PlayableSDK.hideLoadingBar();
    }

    protected start(): void {
        AudioManager.musicPlay('bgm', true);
    }


}