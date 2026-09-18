import { MOUSEWHEEL_HIDE_ACTION_KIND, MouseWheelHideAction } from '../../../../shared/utils.js';
import { NL_STATEMENT, OrderCoordinate, PCM } from '../../../language/generated/ast.js';
import { LanguageClientConfigSingleton } from '../../langclientconfig.js';
import { AstUtils } from 'langium';


export function mouseWheelHide(pcm: PCM, langConfig: LanguageClientConfigSingleton, state: number) {
    const pcmNars = AstUtils.streamAllContents(pcm).toArray()
                                    .filter(c => c.$type === 'NL_STATEMENT')
                                    .map(n => (n as NL_STATEMENT).name)
    switch(state) {
        case 1 : {
            const action: MouseWheelHideAction = {
                kind: MOUSEWHEEL_HIDE_ACTION_KIND,
                ocNames: [],
                ocChildren: [],
                standaloneNars: pcmNars
            }
            langConfig.webviewProvider?.findActiveWebview()?.sendAction(action);  
            break;
        }
        case 2 : {
            const neutralOCs = AstUtils.streamAllContents(pcm).toArray()
                                    .filter(c => c.$type === 'OrderCoordinate')
                                    .map(a => a as OrderCoordinate)
                                    .filter(oc => oc.qu.length === 0)
            const neutralOCNames = neutralOCs.map(oc => oc.name)
            const neutralOCChildren = neutralOCs.flatMap(oc => oc.narrative).map(n => n.name)
                                    
            const action: MouseWheelHideAction = {
                kind: MOUSEWHEEL_HIDE_ACTION_KIND,
                ocNames: neutralOCNames,
                ocChildren: neutralOCChildren,
                standaloneNars: pcmNars
            }
            langConfig.webviewProvider?.findActiveWebview()?.sendAction(action); 
            break;
        }
        case 7 : {
            const action: MouseWheelHideAction = {
                kind: MOUSEWHEEL_HIDE_ACTION_KIND,
                ocNames: [],
                ocChildren: [],
                standaloneNars: pcmNars
            }
            langConfig.webviewProvider?.findActiveWebview()?.sendAction(action);  
            break;
        }
        default: {
            const action: MouseWheelHideAction = {
                kind: MOUSEWHEEL_HIDE_ACTION_KIND,
                ocNames: [],
                ocChildren: [],
                standaloneNars: []
            }
            langConfig.webviewProvider?.findActiveWebview()?.sendAction(action); 
        }
    }

}