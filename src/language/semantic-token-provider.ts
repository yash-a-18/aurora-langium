// import { type AstNode } from 'langium';
// import { AbstractSemanticTokenProvider, type SemanticTokenAcceptor } from 'langium/lsp';
// import { AstUtils } from 'langium';
// import { IssueCoordinate, OrderCoordinate, PCM, isClinicalCoordinate, isIssueCoordinate, isOrderCoordinate } from './generated/ast.js';
// import { icFromModule, ocFromModule } from './hover-provider.js';


// export class AuroraSemanticTokenProvider extends AbstractSemanticTokenProvider {
//     protected override highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor) {
//         const cst = node.$cstNode
//         let rPCM = (AstUtils.findRootNode(node) as PCM)

//         if (( isIssueCoordinate(node)) && cst) {
//             let id = (node as IssueCoordinate).name
//             let filteredIC = icFromModule(rPCM).filter((i: { name: string; })=> id === i.name).length

//             if(filteredIC == 0) {
//                 acceptor({
//                     cst,
//                     type: "type",
//                     modifier: []
//                 });
//                 return
//             } else {
//                 acceptor({
//                     node,
//                     property: 'name',
//                     type: "type",
//                     modifier: ["documentation"]
//                 });
//                 return
//             }
//         }
//         if ((isClinicalCoordinate(node)) && cst) {
//             acceptor({
//                 cst,
//                 type: "type",
//                 modifier: []
//             });
//             return
//         }
//         if ((isOrderCoordinate(node)) && cst) {
//             let id = (node as OrderCoordinate).name
//             let filteredOC = ocFromModule(rPCM).filter((i: { name: string; })=> id === i.name)

//             if(filteredOC.length == 0) {
//                 acceptor({
//                     cst,
//                     type: "type",
//                     modifier: []
//                 });
//                 return
//             } else {
//                 acceptor({
//                     node,
//                     property: 'name',
//                     type: "type",
//                     modifier: ["documentation"]
//                 });
//                 return
//             }
//         }
//   }
// }