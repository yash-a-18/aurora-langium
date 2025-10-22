/**makes thes utils usable from ScalablyTyped perspective */
// export type * as GenAstType from '../language/generated/ast.js';
import type {PCM,Clinical,Issues, IssueCoordinate,ClinicalCoordinate,Orders,OrderCoordinate,NamedGroupClinical,NamedGroupOrder} from  '../language/generated/ast.js';
export {PCM,Clinical,Issues, IssueCoordinate,ClinicalCoordinate,Orders,OrderCoordinate,NamedGroupClinical,NamedGroupOrder};

export * as GenAst from '../language/generated/ast.js';
import {AstUtils} from 'langium';
export { AstUtils};


import { createAuroraServices } from '../language/aurora-module.js';
import { extractAstNode } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';
import { EmptyFileSystem } from 'langium';
// import type { PCM} from '../language/generated/ast.js';

/** utility function parse a filename to PCM */
export const parse = async (fileName: string): Promise<PCM> => {
    const services = createAuroraServices(NodeFileSystem).Aurora;
    const module = await extractAstNode<PCM>(fileName, services);

    return module;
};

export const getAuroraServices = async () => {
    const services = await Promise.resolve(createAuroraServices(NodeFileSystem));
    return services;
};

export const getEmptyAuroraServices = async () => {
    const services = await Promise.resolve(createAuroraServices(EmptyFileSystem));
    return services;
}

export { extractAstNode };