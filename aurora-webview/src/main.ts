import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';

import { Container } from 'inversify';
import { configureModelElement } from 'sprotty';
import { SprottyDiagramIdentifier, VscodeDiagramServer } from 'sprotty-vscode-webview';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing/index.js';
import { createStateDiagramContainer } from './di.config';
import { PaletteButtonView } from './html-views';
import { PaletteButton } from 'sprotty-vscode-webview/lib/lsp/editing/index.js';
import { AuroraVSCodeDiagramServer } from './aurora-vscode-diagram-server';


export class StatesSprottyStarter extends SprottyLspEditStarter {

    private auroraContainer: Container | undefined;

    get currentAuroraContainer() {
        return this.auroraContainer
    }

    protected override createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        const container = createStateDiagramContainer(diagramIdentifier.clientId);
        this.auroraContainer = container
        return this.auroraContainer
    }

    protected override addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        container.rebind(VscodeDiagramServer).to(AuroraVSCodeDiagramServer).inSingletonScope()
        configureModelElement(container, 'button:create', PaletteButton, PaletteButtonView);
    }

}

new StatesSprottyStarter().start()