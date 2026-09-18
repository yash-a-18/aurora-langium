import { SModelElementImpl, ZoomMouseListener } from "sprotty";
import { Action } from 'sprotty-protocol/lib/actions';
import { inject } from 'inversify'
import { Messenger } from "vscode-messenger-webview";
import { VsCodeMessenger } from "sprotty-vscode-webview/lib/services";
import { HOST_EXTENSION } from 'vscode-messenger-common';
const shared = require('../../../shared/utils');

export class CtrlZoomMouseListener extends ZoomMouseListener {

    private numberPositiveClicks: number;
    private numberNegativeClicks: number;

    constructor(
            @inject(VsCodeMessenger) private readonly messenger: Messenger
        ){
            super()
            this.numberPositiveClicks = 0  
            this.numberNegativeClicks = 0            
        }

    // For the purposes of this feature, it would be best to use a mouse not a touchpad.
    // That way we can control what happens at every click of the mouse wheel.
    // The touchpad fires too quickly to get practical results.

    override wheel(target: SModelElementImpl, event: WheelEvent): Action[] {
        if(event.ctrlKey) {
            // Increasing detail -> scroll up (deltaY is negative)
            if(event.deltaY < 0) {
                console.log('hitting negative click')
                if (this.numberNegativeClicks < 2) {
                    this.numberNegativeClicks += 1;
                }
                else this.numberNegativeClicks = 0;
                this.sendHideNotification()
            }

            // Decreasing detail -> scroll down (deltaY is positive)
            if(event.deltaY > 0) {
                if (this.numberPositiveClicks < 2) {
                    this.numberPositiveClicks += 1;
                }
                else this.numberPositiveClicks = 0;
                this.sendHideNotification()
            }
        } 
        return super.wheel(target, event)
    }

    private computeState(numberPositiveClicks: number, numberNegativeClicks: number): number {
        const key = `${numberPositiveClicks}_${numberNegativeClicks}`;
        switch (key) {
            case '1_0':
                return 1;
            case '2_0':
                return 2;
            case '2_1':
                return 7;
            default:
                return 3;
        }
    }

    private sendHideNotification() {
        const message = {
                    state: this.computeState(this.numberPositiveClicks, this.numberNegativeClicks)
                }; 
        this.messenger.sendNotification(shared.HideNotification, HOST_EXTENSION, message); 
    }

}