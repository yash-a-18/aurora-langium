import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { AuroraAstType, IssueCoordinate, SingleValueUnit } from './generated/ast.js';
import type { AuroraServices } from './aurora-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AuroraServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AuroraValidator;
    const checks: ValidationChecks<AuroraAstType> = {
        // IssueCoordinate: validator.checkIssueCoordinateStartsWithCapital
        SingleValueUnit: validator.checkIncompleteness
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AuroraValidator {

    checkIncompleteness(svu: SingleValueUnit, accept: ValidationAcceptor): void {
        const incompletenessMarker = '???';

        // Check if the value is marked as incomplete
        if (svu.value === incompletenessMarker) {
            accept('warning', 'Value is marked as incomplete.', { 
                node: svu, 
                property: 'value' 
            });
        }

        // Check if the unit is marked as incomplete
        if (svu.unit === incompletenessMarker) {
            accept('warning', 'Unit is marked as incomplete.', { 
                node: svu, 
                property: 'unit' 
            });
        }
    }

    checkIssueCoordinateStartsWithCapital(issueCoordinate: IssueCoordinate, accept: ValidationAcceptor): void {
        if (issueCoordinate.name) {
            const firstChar = issueCoordinate.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'IssueCoordinate should start with a capital.', { node: issueCoordinate, property: 'name' });
            }
        }
    }

}
