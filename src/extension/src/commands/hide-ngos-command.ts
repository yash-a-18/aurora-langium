import * as vscode from 'vscode'
import { HIDE_NGOS_ACTION_KIND, HideNGOsAction } from '../../../../shared/utils.js';
import { NamedGroupOrder, OrderCoordinate, Orders, PCM } from '../../../language/generated/ast.js';
import { LanguageClientConfigSingleton } from '../../langclientconfig.js';


export function hideNGOs(pcm: PCM, langConfig: LanguageClientConfigSingleton) {
    let quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = 'Choose which NGOs to hide...';
    let ngoOptions = pcm.elements.filter(e => e.$type === 'Orders').flatMap(o => (o as Orders).namedGroups)
    quickPick.items = ngoOptions.map(ngoName => { return { label: ngoName.name }; });
    var selectedNGOs: NamedGroupOrder[] = []
    
    quickPick.canSelectMany = true
    
    quickPick.onDidChangeSelection(selection => {
        if (selection && selection.length > 0) {
            const selectedLabels = selection.map(s => s.label.trim());
            console.log('selectedLabels:', selectedLabels);

            const result = ngoOptions.filter(ngo =>
                selectedLabels.includes(ngo.name.trim())
            );

            selectedNGOs = result
        }
    });

          
    quickPick.show();
                
    quickPick.onDidAccept(() => {
        const hideTheseOrderCoordinates = selectedNGOs.flatMap(ngo => ngo.orders)
                                                  .filter(o => o.$type === 'OrderCoordinate')
                                                  .map(o => o as OrderCoordinate)
                                                   
        const hideTheseChildren = hideTheseOrderCoordinates.flatMap(oc => oc.narrative)
        
        const action: HideNGOsAction = {
            kind: HIDE_NGOS_ACTION_KIND,
            ocNames: hideTheseOrderCoordinates.map(o => (o as OrderCoordinate).name),
            children: hideTheseChildren.map(n => n.name)
        };    
        langConfig.webviewProvider?.findActiveWebview()?.sendAction(action);  
        quickPick.dispose();
    });
}