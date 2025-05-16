import '../css/diagram.css';
import 'sprotty/css/sprotty.css';

import { Container, ContainerModule } from 'inversify';
import {
    configureCommand, configureModelElement, ConsoleLogger, CreateElementCommand, HtmlRootImpl,
    HtmlRootView, LogLevel, ManhattanEdgeRouter, overrideViewerOptions, PreRenderedElementImpl,
    PreRenderedView, RectangularNodeView, SGraphView, SLabelView,alignFeature,
    SRoutingHandleImpl, SRoutingHandleView, TYPES, loadDefaultModules, openFeature,
    hoverFeedbackFeature, popupFeature, creatingOnDragFeature, editLabelFeature, labelEditUiModule, SGraphImpl,
    SLabelImpl, SModelRootImpl,
    configureActionHandler
} from 'sprotty';
import { DarkTextLabelView } from './LabelViews'

import { NarrativeDraftNodeView,
    NarrativeExclamationNodeView, NarrativeNodeView, NarrativeTaskCompletedNodeView,NarrativeTaskNodeView,
    OrderCoordinateNodeView, OrderCoordinateOrphanNodeView, IssueCoordinateNodeView, HiddenNodeView} from './NodeViews'
import { CustomRouter } from './custom-edge-router';
import { CreateTransitionPort, StatesEdge, StatesNode } from './model';
import { PolylineArrowEdgeView, TriangleButtonView } from './views';
import { UpdateLayoutActionHandler } from './handlers/update-layout-handler';
import { DefaultElementFilter, ElkFactory, ElkLayoutEngine } from 'sprotty-elk'
import ElkConstructor  from 'elkjs/lib/elk.bundled'
import { HideNGOsActionHandler } from './handlers/hide-ngos-handler';
import { HideNarrativesActionHandler } from './handlers/hide-narratives-handler';
import { ElementSelectedActionHandler } from './handlers/element-selected-handler';
const shared = require('../../shared/utils');

export const elkFactory: ElkFactory = () => new ElkConstructor({
    algorithms: ['layered', 'stress', 'mrtree', 'radial', 'force', 'disco']
});

export var globalLayoutEngine = new ElkLayoutEngine(
                                        elkFactory,
                                        new DefaultElementFilter(),
                                        new shared.AuroraLayoutConfigurator()
                                    )

const statesDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    

    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    rebind(ManhattanEdgeRouter).to(CustomRouter).inSingletonScope();


    const context = { bind, unbind, isBound, rebind };
    
    
    bind(UpdateLayoutActionHandler).toSelf().inSingletonScope();
    bind('updateLayout').toService(UpdateLayoutActionHandler);
    configureActionHandler(context, 'updateLayout', UpdateLayoutActionHandler)

    bind(HideNGOsActionHandler).toSelf().inSingletonScope();
    bind('hideNGOs').toService(HideNGOsActionHandler);
    configureActionHandler(context, 'hideNGOs', HideNGOsActionHandler)

    bind(HideNarrativesActionHandler).toSelf().inSingletonScope();
    bind('hideNarratives').toService(HideNarrativesActionHandler);
    configureActionHandler(context, 'hideNarratives', HideNarrativesActionHandler)

    bind(ElementSelectedActionHandler).toSelf().inSingletonScope();
    bind('elementSelected').toService(ElementSelectedActionHandler);
    configureActionHandler(context, 'elementSelected', ElementSelectedActionHandler)
    
    
    bind(ElkFactory).toConstantValue(elkFactory);

    bind(DefaultElementFilter).toSelf().inSingletonScope(); 
    bind(TYPES.IModelLayoutEngine).toDynamicValue(() => globalLayoutEngine).inSingletonScope();

    configureModelElement(context, 'graph', SGraphImpl, SGraphView, {
        enable: [hoverFeedbackFeature, popupFeature]
    });
    
    configureModelElement(context, 'node', StatesNode, RectangularNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:hidden', StatesNode, HiddenNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:ic', StatesNode, IssueCoordinateNodeView,{enable: [openFeature, alignFeature]});
    configureModelElement(context, 'node:nl', StatesNode, NarrativeNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:nldraft', StatesNode, NarrativeDraftNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:nlexclamation', StatesNode, NarrativeExclamationNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:nltaskcompleted', StatesNode, NarrativeTaskCompletedNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:nltask', StatesNode, NarrativeTaskNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:oc', StatesNode, OrderCoordinateNodeView,{enable: [openFeature]});
    configureModelElement(context, 'node:ocorphan', StatesNode, OrderCoordinateOrphanNodeView,{enable: [openFeature]});


    configureModelElement(context, 'label', SLabelImpl, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:xref', SLabelImpl, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:darktext', SLabelImpl, DarkTextLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'edge', StatesEdge, PolylineArrowEdgeView);
    configureModelElement(context, 'html', HtmlRootImpl, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElementImpl, PreRenderedView);
    configureModelElement(context, 'palette', SModelRootImpl, HtmlRootView);
    configureModelElement(context, 'routing-point', SRoutingHandleImpl, SRoutingHandleView);
    configureModelElement(context, 'volatile-routing-point', SRoutingHandleImpl, SRoutingHandleView);
    configureModelElement(context, 'port', CreateTransitionPort, TriangleButtonView, {
        enable: [popupFeature, creatingOnDragFeature]
    });

    configureCommand(context, CreateElementCommand);
});

export function createStateDiagramContainer(widgetId: string): Container {
    const container = new Container();
    loadDefaultModules(container, { exclude: [ labelEditUiModule ] });
    container.load(statesDiagramModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });
    return container;
}