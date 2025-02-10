import { type Module, inject } from 'langium';
import { createDefaultModule, createDefaultSharedModule, type DefaultSharedModuleContext, type LangiumServices, type PartialLangiumServices } from 'langium/lsp';
import { AuroraGeneratedModule, AuroraGeneratedSharedModule } from './generated/module.js';
import { AuroraValidator, registerValidationChecks } from './aurora-validator.js';
import { AuroraScopeComputation } from './aurora-scope.js';
import { AuroraDiagramGenerator } from './aurora-diagram-generator.js';
import { LangiumSprottyServices, LangiumSprottySharedServices, SprottyDiagramServices, SprottySharedModule } from 'langium-sprotty';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type AuroraAddedServices = {
    validation: {
        AuroraValidator: AuroraValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type AuroraServices = LangiumSprottyServices & LangiumServices & AuroraAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const AuroraModule: Module<AuroraServices, PartialLangiumServices & SprottyDiagramServices & AuroraAddedServices> = {
    diagram: {
        DiagramGenerator: services => new AuroraDiagramGenerator(services),
    },
    validation: {
        AuroraValidator: () => new AuroraValidator()
    },
    references: {
        ScopeComputation: (services) => new AuroraScopeComputation(services),
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
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
        AuroraGeneratedModule,
        AuroraModule
    );
    shared.ServiceRegistry.register(Aurora);
    registerValidationChecks(Aurora);
    if (!context.connection) {
        // We don't run inside a language server
        // Therefore, initialize the configuration provider instantly
        shared.workspace.ConfigurationProvider.initialized({});
    }
    return { shared, Aurora };
}
