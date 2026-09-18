import { HIDE_NARRATIVES_ACTION_KIND, HideNarrativesAction } from '../../../../shared/utils.js';
import { NL_STATEMENT, PCM } from '../../../language/generated/ast.js';
import { LanguageClientConfigSingleton } from '../../langclientconfig.js';
import { AstUtils } from 'langium';


export function hideNarratives(pcm: PCM, langConfig: LanguageClientConfigSingleton) {
    const narList = AstUtils.streamAllContents(pcm).toArray()
                            .filter(c => c.$type === 'NL_STATEMENT')
                            .map(n => (n as NL_STATEMENT).name)
    const action: HideNarrativesAction = {
        kind: HIDE_NARRATIVES_ACTION_KIND,
        narratives: narList
    }
    langConfig.webviewProvider?.findActiveWebview()?.sendAction(action);  
}