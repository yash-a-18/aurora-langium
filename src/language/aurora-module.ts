import { type Module, inject } from 'langium';
import {
    createDefaultModule,
    createDefaultSharedModule,
    type DefaultSharedModuleContext,
    type LangiumServices,
    type PartialLangiumServices
} from 'langium/lsp';
import { AuroraGeneratedModule, AuroraGeneratedSharedModule } from './generated/module.js';
import { AuroraValidator, registerValidationChecks } from './aurora-validator.js';
import { AuroraScopeComputation, AuroraScopeProvider } from './aurora-scope.js';
import { AuroraDiagramGenerator } from './aurora-diagram-generator.js';
import {
    type LangiumSprottyServices,
    type LangiumSprottySharedServices,
    type SprottyDiagramServices,
    SprottyDefaultModule,
    SprottySharedModule
} from 'langium-sprotty';
import {
    DefaultElementFilter,
    type ElkFactory,
    ElkLayoutEngine,
    type IElementFilter,
    type ILayoutConfigurator
} from 'sprotty-elk';
import ElkConstructor from 'elkjs/lib/elk.bundled.js';
import { AuroraHoverProvider } from './hover-provider.js';
import { AuroraCommandHandler } from './aurora-commands.js';
import { AuroraLayoutConfigurator } from '../../shared/utils.js';

export type AuroraAddedServices = {
    validation: {
        AuroraValidator: AuroraValidator
    },
    layout: {
        ElkFactory: ElkFactory,
        ElementFilter: IElementFilter,
        LayoutConfigurator: ILayoutConfigurator
    }
}

export type AuroraServices = LangiumSprottyServices & LangiumServices & AuroraAddedServices;

export const AuroraModule: Module<AuroraServices, PartialLangiumServices & SprottyDiagramServices & AuroraAddedServices> = {
    diagram: {
        DiagramGenerator: services => new AuroraDiagramGenerator(services),
        ModelLayoutEngine: services => new ElkLayoutEngine(
            services.layout.ElkFactory,
            services.layout.ElementFilter,
            services.layout.LayoutConfigurator
        ) as any
    },
    validation: {
        AuroraValidator: () => new AuroraValidator()
    },
    references: {
        ScopeComputation: services => new AuroraScopeComputation(services),
        ScopeProvider: services => new AuroraScopeProvider(services)
    },
    layout: {
        ElkFactory: () => () => new ElkConstructor.default({ algorithms: ['layered', 'stress', 'mrtree', 'radial', 'force', 'disco'] }),
        ElementFilter: () => new DefaultElementFilter(),
        LayoutConfigurator: () => new AuroraLayoutConfigurator()
    },
    lsp: {
        HoverProvider: services => new AuroraHoverProvider(services)
    }
};

export function createAuroraServices(context: DefaultSharedModuleContext): {
    shared: LangiumSprottySharedServices,
    Aurora: AuroraServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        AuroraGeneratedSharedModule,
        SprottySharedModule
    );

    const Aurora = inject(
        createDefaultModule({ shared }),
        SprottyDefaultModule,
        AuroraGeneratedModule,
        AuroraModule
    );

    shared.ServiceRegistry.register(Aurora);
    registerValidationChecks(Aurora);

    if (context.connection) {
        const commandHandler = new AuroraCommandHandler();
        context.connection.onExecuteCommand(async params => {
            return commandHandler.executeCommand(params.command, params.arguments ?? []);
        });
    } else {
        shared.workspace.ConfigurationProvider.initialized({});
    }

    return { shared, Aurora };
}
