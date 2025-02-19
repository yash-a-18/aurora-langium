import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';

import { Container } from 'inversify';
import { configureModelElement } from 'sprotty';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-webview';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing/index.js';
import { createStateDiagramContainer } from './di.config';
import { PaletteButtonView } from './html-views';
import { PaletteButton } from 'sprotty-vscode-webview/lib/lsp/editing/index.js';

export class StatesSprottyStarter extends SprottyLspEditStarter {

    protected override createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createStateDiagramContainer(diagramIdentifier.clientId);
    }

    protected override addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        configureModelElement(container, 'button:create', PaletteButton, PaletteButtonView);
    }
}

new StatesSprottyStarter().start();