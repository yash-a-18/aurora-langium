/**makes thes utils usable from ScalablyTyped perspective */
// export type * as GenAstType from '../language/generated/ast.js';
import type {
    PCM,
    Clinical,
    Issues,
    IssueCoordinate,
    ClinicalCoordinate,
    Orders,
    OrderCoordinate,
    NamedGroupClinical,
    NamedGroupOrder
} from '../language/generated/ast.js';

export {
    PCM,
    Clinical,
    Issues,
    IssueCoordinate,
    ClinicalCoordinate,
    Orders,
    OrderCoordinate,
    NamedGroupClinical,
    NamedGroupOrder
};

export * as GenAst from '../language/generated/ast.js';
import { AstUtils } from 'langium';
export { AstUtils };

import { createAuroraServices } from '../language/aurora-module.js';
import { extractAstNode } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';
import { EmptyFileSystem } from 'langium';

/** utility function parse a filename to PCM */
export const parse = async (fileName: string): Promise<PCM> => {
    const services = createAuroraServices(NodeFileSystem).Aurora;
    return extractAstNode<PCM>(fileName, services);
};

export const getAuroraServices = async () => {
    return Promise.resolve(createAuroraServices(NodeFileSystem));
};

export const getEmptyAuroraServices = async () => {
    return Promise.resolve(createAuroraServices(EmptyFileSystem));
};

export { extractAstNode };
