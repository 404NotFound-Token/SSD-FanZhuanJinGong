import { _decorator, Component } from 'cc';
import { GameManager } from './GameManager';
import { OurTower } from '../Combat/Tower/OurTower';
import { find } from 'cc';
import { Zoom } from '../Tools/AniCtrl';
const { ccclass, property } = _decorator;

@ccclass('LandmarkHandler')
export class LandmarkHandler extends Component {

    @property({ type: OurTower })
    private ourTower1: OurTower = null;

    @property({ type: OurTower })
    private ourTower2: OurTower = null;

    @property({ type: OurTower })
    private ourTower3: OurTower = null;

    @property({ type: OurTower })
    private ourTower4: OurTower = null;

    @property({ type: OurTower })
    private ourTower5: OurTower = null;

    @property({ type: OurTower })
    private ourTower6: OurTower = null;

    protected onLoad(): void {
        GameManager.LandmarkHandler = this;
    }

    private activeOurTower1() {
        console.log("激活OurTower1");
        this.ourTower1.node.active = true;
    }

    private activeOurTower2() {
        console.log("激活OurTower2");
        this.ourTower2.node.active = true;
        find("Main/Our/营地/墙2").active = true
        Zoom(find("Main/Our/营地/墙2"));
        find("Main/Our/营地/墙1").active = false;
        find("Map/我方地面5").active = true;
    }

    private activeOurTower3() {
        console.log("激活OurTower3");
        this.ourTower3.node.active = true;
        // this.ourTower1.upgradeTower();
        // this.ourTower2.upgradeTower();
        // this.ourTower3.upgradeTower();
        find("Main/Our/营地/墙2").active = false;
        find("Main/Our/营地/墙3").active = true;
        Zoom(find("Main/Our/营地/墙3"));
        find("Map/我方地面6").active = true;
    }

    private activeOurTower4() {
        console.log("激活OurTower4");
        this.ourTower4.node.active = true;
    }

    private activeOurTower5() {
        console.log("激活OurTower5");
        this.ourTower5.node.active = true;
    }

    private activeOurTower6() {
        console.log("激活OurTower6");
        this.ourTower6.node.active = true;
    }
}


