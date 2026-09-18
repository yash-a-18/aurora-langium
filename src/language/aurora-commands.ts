import { AbstractExecuteCommandHandler, ExecuteCommandAcceptor } from "langium/lsp";
import { addToNGOFilter, clearNGOFilter, getNgoFilter} from "./aurora-diagram-generator.js";

export class AuroraCommandHandler extends AbstractExecuteCommandHandler {
    registerCommands(acceptor: ExecuteCommandAcceptor): void {
        acceptor('hideNGO', (args: string[]) => {
            addToNGOFilter(args)
            return "Hiding NGO " + getNgoFilter()
        });
        acceptor('resetHideNGO', (args: any) => {
            clearNGOFilter()
            return "Reset Complete" + getNgoFilter()
        });
    }
}