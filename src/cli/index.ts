/**makes thes utils usable from ScalablyTyped perspective */
import type { PCM} from '../language/generated/ast.js';
import { createAuroraServices } from '../language/aurora-module.js';
import { extractAstNode } from './cli-util.js';
import { NodeFileSystem } from 'langium/node';

import { CstUtils,AstUtils} from 'langium'
export {CstUtils,AstUtils}
/** utility function parse a filename to PCM */
export const parse = async (fileName: string): Promise<PCM> => {
    const services = createAuroraServices(NodeFileSystem).Aurora;
    const module = await extractAstNode<PCM>(fileName, services);

    return module;
};

