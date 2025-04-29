import { VscodeDiagramServer } from "sprotty-vscode-webview";


export class AuroraVSCodeDiagramServer extends VscodeDiagramServer {
    protected override messageReceived(data: any): void {
        console.log('Message received from remote server: ' )
        console.log(data)
        super.messageReceived(data)
    }
}