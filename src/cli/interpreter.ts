import type { PCM } from '../language/generated/ast.js';
import { NodeFileSystem } from 'langium/node';
import { createAuroraServices } from '../language/aurora-module.js';
// import { ArithLanguageMetaData } from '../language/generated/module.js';
import { extractDocument } from './cli-util.js';
import chalk from 'chalk';
import { interpretEvaluations } from '../language/aurora-arith-evaluator.js';

export const evalAction = async (fileName: string): Promise<void> => {
    const services = createAuroraServices(NodeFileSystem).Aurora
    const document = await extractDocument(fileName,  services);
    const module = document.parseResult.value;
    for (const [evaluation, value] of interpretEvaluations(module as PCM)) {
        const cstNode = evaluation.expression.$cstNode;
        if (cstNode) {
            const line = cstNode.range.start.line + 1;
            console.log(`line ${line}:`, chalk.green(cstNode.text), '===>', value);
        }
    }
};