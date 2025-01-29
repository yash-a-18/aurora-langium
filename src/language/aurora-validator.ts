import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { AuroraAstType, IssueCoordinate } from './generated/ast.js';
import type { AuroraServices } from './aurora-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AuroraServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AuroraValidator;
    const checks: ValidationChecks<AuroraAstType> = {
        IssueCoordinate: validator.checkIssueCoordinateStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AuroraValidator {

    checkIssueCoordinateStartsWithCapital(issueCoordinate: IssueCoordinate, accept: ValidationAcceptor): void {
        if (issueCoordinate.name) {
            const firstChar = issueCoordinate.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'IssueCoordinate should start with a capital.', { node: issueCoordinate, property: 'name' });
            }
        }
    }

}
