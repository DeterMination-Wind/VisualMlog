import React from 'react';

import MlogGraphSpriteSelector from './mlog-graph-sprite-selector.jsx';
import {
    getGraphState,
    getNodeInfo,
    getProcessorForNode,
    getStageNode,
    selectProcessor,
    selectStageNode,
    subscribeGraphState
} from '../../lib/mlog-stage-store';

const useGraphState = () => {
    const [graphState, setGraphState] = React.useState(getGraphState());
    React.useEffect(() => subscribeGraphState(setGraphState), []);
    return graphState;
};

const MlogTargetPane = props => {
    const {hoveredTarget, onOpenLibrary, raised} = props;
    const graphState = useGraphState();
    const {project, selectedStageNodeId} = graphState;

    const items = React.useMemo(() => project.stage.nodes.map((node, index) => {
        const info = getNodeInfo(node);
        const processor = getProcessorForNode(project, node.id);
        return {
            id: node.id,
            name: node.linkName,
            details: processor ?
                `${processor.name} · ${processor.links.length} 个连接` :
                `${info.label} · 普通节点`,
            costumeURL: info.icon,
            order: index
        };
    }), [project]);

    return (
        <MlogGraphSpriteSelector
            editingTarget={selectedStageNodeId}
            hoveredTarget={hoveredTarget}
            items={items}
            raised={raised}
            selectedId={selectedStageNodeId}
            onNewNodeClick={onOpenLibrary}
            onSelectSprite={nodeId => {
                const processor = getProcessorForNode(project, nodeId);
                const node = getStageNode(project, nodeId);
                if (!node) return;
                if (processor) {
                    selectProcessor(processor.id);
                } else {
                    selectStageNode(nodeId);
                }
            }}
        />
    );
};

export default MlogTargetPane;
