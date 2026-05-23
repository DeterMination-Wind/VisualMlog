import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {
    addLink,
    beginLinkFrom,
    cancelLinkSource,
    clearGraphSelection,
    deleteStageNode,
    formatRange,
    getActiveProcessor,
    getActiveProcessorNode,
    getGraphState,
    getNodeInfo,
    getProcessorForNode,
    removeLink,
    getStageNode,
    nodeCenter,
    rangeTilesFor,
    selectStageNode,
    subscribeGraphState,
    updateNodePosition
} from '../../lib/mlog-stage-store';
import styles from './mlog-stage-graph.css';

const useGraphState = () => {
    const [graphState, setGraphState] = React.useState(getGraphState());
    React.useEffect(() => subscribeGraphState(setGraphState), []);
    return graphState;
};

const dragHoldDelay = 320;

const getPoint = event => {
    if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0];
    if (event.touches && event.touches[0]) return event.touches[0];
    return event;
};

const eventSuppressed = dragStateRef => Date.now() < (dragStateRef.current.suppressClickUntil || 0);

const clientToStagePoint = (clientX, clientY, rect, bounds) => ({
    x: ((clientX - rect.left) / rect.width) * bounds.width,
    y: ((clientY - rect.top) / rect.height) * bounds.height
});

const useElementSize = ref => {
    const [size, setSize] = React.useState({width: 0, height: 0});

    React.useLayoutEffect(() => {
        if (!ref.current || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setSize({
                width: rect.width,
                height: rect.height
            });
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);

    return size;
};

const GraphCanvas = props => {
    const {
        graphState,
        interactive,
        viewportRef,
        onBackgroundClick,
        onNodePointerDown,
        onNodeClick,
        onNodeContextMenu
    } = props;
    const {project, linkSourceId, selectedStageNodeId} = graphState;
    const localViewportRef = React.useRef(null);
    const resolvedViewportRef = viewportRef || localViewportRef;
    const viewportSize = useElementSize(resolvedViewportRef);
    const scaleX = viewportSize.width > 0 ? viewportSize.width / project.stage.bounds.width : 1;
    const scaleY = viewportSize.height > 0 ? viewportSize.height / project.stage.bounds.height : 1;

    const selectedNode = selectedStageNodeId ? getStageNode(project, selectedStageNodeId) : null;
    const previewSourceNode = linkSourceId ?
        getStageNode(project, linkSourceId) :
        (selectedNode && getNodeInfo(selectedNode).processor ? selectedNode : null);
    const previewProcessor = previewSourceNode ? getProcessorForNode(project, previewSourceNode.id) : null;
    const previewLabels = previewProcessor ? new Map(previewProcessor.links.map((targetId, index) => [targetId, index])) : new Map();

    const backgroundLines = [];
    const activeLines = [];
    project.processors.forEach(processor => {
        const source = getStageNode(project, processor.stageNodeId);
        if (!source) return;
        const highlighted = previewProcessor && previewProcessor.id === processor.id;
        processor.links.forEach((targetId, index) => {
            const target = getStageNode(project, targetId);
            if (!target) return;
            const start = nodeCenter(source);
            const end = nodeCenter(target);
            const mid = {
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2
            };
            const line = (
                <g key={`${targetId}-${index}`}>
                    <line
                        className={highlighted ? styles.linkLineShadow : styles.linkLineMutedShadow}
                        x1={start.x}
                        x2={end.x}
                        y1={start.y}
                        y2={end.y}
                    />
                    <line
                        className={highlighted ? styles.linkLine : styles.linkLineMuted}
                        x1={start.x}
                        x2={end.x}
                        y1={start.y}
                        y2={end.y}
                    />
                    {highlighted ? (
                        <React.Fragment>
                            <circle
                                className={styles.linkDot}
                                cx={mid.x}
                                cy={mid.y}
                                r="0.18"
                            />
                            <text
                                className={styles.linkIndex}
                                x={mid.x}
                                y={mid.y + 0.04}
                            >
                                {index}
                            </text>
                        </React.Fragment>
                    ) : null}
                </g>
            );
            if (highlighted) {
                activeLines.push(line);
            } else {
                backgroundLines.push(line);
            }
        });
    });

    const rangeTiles = previewSourceNode ? rangeTilesFor(previewSourceNode) : 0;
    const center = previewSourceNode ? nodeCenter(previewSourceNode) : null;

    return (
        <div
            className={styles.graphViewport}
            ref={resolvedViewportRef}
            onClick={interactive ? onBackgroundClick : undefined}
        >
            <svg
                className={styles.graphOverlay}
                preserveAspectRatio="none"
                viewBox={`0 0 ${project.stage.bounds.width} ${project.stage.bounds.height}`}
            >
                {center && rangeTiles !== Number.POSITIVE_INFINITY ? (
                    <circle
                        className={styles.rangeCircle}
                        cx={center.x}
                        cy={center.y}
                        r={rangeTiles * 8}
                    />
                ) : null}
                {backgroundLines}
                {activeLines}
            </svg>
            <div
                className={classNames(styles.graphGrid, {
                    [styles.graphGridInteractive]: interactive
                })}
                style={{
                    width: `${project.stage.bounds.width}px`,
                    height: `${project.stage.bounds.height}px`,
                    transform: `scale(${scaleX}, ${scaleY})`,
                    transformOrigin: 'top left'
                }}
            >
                {project.stage.nodes.map(node => {
                    const info = getNodeInfo(node);
                    const previewIndex = previewLabels.has(node.id) ? previewLabels.get(node.id) : null;
                    const footprint = Math.max(node.w || 1, node.h || 1);
                    const coreSize = info.processor ? 30 : Math.min(24, 18 + ((footprint - 1) * 2));
                    const hitSize = Math.max(72, coreSize + 40);
                    return (
                        <button
                            className={classNames(styles.graphNode, {
                                [styles.graphNodeProcessor]: info.processor,
                                [styles.graphNodeSelected]: selectedStageNodeId === node.id,
                                [styles.graphNodeLinkSource]: linkSourceId === node.id
                            })}
                            key={node.id}
                            style={{
                                left: `${node.x}px`,
                                top: `${node.y}px`,
                                width: `${hitSize}px`,
                                height: `${hitSize}px`,
                                '--node-core-size': `${coreSize}px`
                            }}
                            title={`${info.label} · ${node.linkName}`}
                            type="button"
                            onClick={interactive ? event => onNodeClick(node.id, event) : undefined}
                            onContextMenu={interactive ? event => onNodeContextMenu(node.id, event) : undefined}
                            onMouseDown={interactive ? event => onNodePointerDown(node.id, event) : undefined}
                            onTouchStart={interactive ? event => onNodePointerDown(node.id, event) : undefined}
                        >
                            {previewIndex !== null ? (
                                <span className={styles.graphNodeLabel}>
                                    {`${node.linkName}[${previewIndex}]`}
                                </span>
                            ) : null}
                            <span className={styles.graphNodeCore} />
                            <span className={styles.graphNodeName}>{node.linkName}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

GraphCanvas.propTypes = {
    graphState: PropTypes.shape({}).isRequired,
    interactive: PropTypes.bool,
    viewportRef: PropTypes.shape({current: PropTypes.any}),
    onBackgroundClick: PropTypes.func,
    onNodeClick: PropTypes.func,
    onNodeContextMenu: PropTypes.func,
    onNodePointerDown: PropTypes.func
};

GraphCanvas.defaultProps = {
    interactive: false,
    viewportRef: null,
    onBackgroundClick: null,
    onNodeClick: null,
    onNodeContextMenu: null,
    onNodePointerDown: null
};

const MlogStageGraph = () => {
    const graphState = useGraphState();
    const viewportRef = React.useRef(null);
    const dragStateRef = React.useRef({
        activeNodeId: null,
        dragging: false,
        holdTimer: null,
        pointerOffsetX: 0,
        pointerOffsetY: 0,
        suppressClickUntil: 0
    });

    const {project, status, linkSourceId} = graphState;
    const activeProcessor = getActiveProcessor(project);
    const activeProcessorNode = getActiveProcessorNode(project);

    const onBackgroundClick = React.useCallback(() => {
        if (eventSuppressed(dragStateRef)) {
            return;
        }
        clearGraphSelection();
    }, []);

    const onNodeClick = React.useCallback((nodeId, event) => {
        event.stopPropagation();
        if (eventSuppressed(dragStateRef)) {
            return;
        }
        if (linkSourceId && linkSourceId !== nodeId) {
            const sourceProcessor = getProcessorForNode(project, linkSourceId);
            if (sourceProcessor && sourceProcessor.links.includes(nodeId)) {
                removeLink(linkSourceId, nodeId);
                return;
            }
            addLink(linkSourceId, nodeId);
            return;
        }

        if (linkSourceId === nodeId) {
            cancelLinkSource();
            selectStageNode(nodeId);
            return;
        }

        const node = getStageNode(project, nodeId);
        if (!node) return;
        if (getNodeInfo(node).processor) {
            beginLinkFrom(nodeId);
        } else {
            selectStageNode(nodeId);
        }
    }, [linkSourceId, project]);

    const onNodeContextMenu = React.useCallback((nodeId, event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteStageNode(nodeId);
    }, []);

    const endDrag = React.useCallback(() => {
        const current = dragStateRef.current;
        if (current.holdTimer) {
            clearTimeout(current.holdTimer);
        }
        dragStateRef.current = {
            activeNodeId: null,
            dragging: false,
            holdTimer: null,
            pointerOffsetX: 0,
            pointerOffsetY: 0,
            suppressClickUntil: current.suppressClickUntil || 0
        };
    }, []);

    const onNodePointerDown = React.useCallback((nodeId, event) => {
        event.stopPropagation();
        if ('button' in event && event.button !== 0) return;
        const node = getStageNode(project, nodeId);
        const rect = viewportRef.current && viewportRef.current.getBoundingClientRect();
        if (!node || !rect) return;
        const point = getPoint(event);
        const stagePoint = clientToStagePoint(point.clientX, point.clientY, rect, project.stage.bounds);
        const current = dragStateRef.current;
        if (current.holdTimer) {
            clearTimeout(current.holdTimer);
        }
        dragStateRef.current.activeNodeId = nodeId;
        dragStateRef.current.dragging = false;
        dragStateRef.current.pointerOffsetX = stagePoint.x - node.x;
        dragStateRef.current.pointerOffsetY = stagePoint.y - node.y;
        dragStateRef.current.holdTimer = setTimeout(() => {
            dragStateRef.current.dragging = true;
            dragStateRef.current.suppressClickUntil = Date.now() + 250;
        }, dragHoldDelay);
    }, [project, endDrag]);

    React.useEffect(() => {
        const handlePointerMove = event => {
            const dragState = dragStateRef.current;
            if (!dragState.activeNodeId || !dragState.dragging) {
                return;
            }

            const rect = viewportRef.current && viewportRef.current.getBoundingClientRect();
            const node = getStageNode(project, dragState.activeNodeId);
            if (!rect || !node) {
                return;
            }

            const point = getPoint(event);
            const stagePoint = clientToStagePoint(point.clientX, point.clientY, rect, project.stage.bounds);
            const nextX = stagePoint.x - dragState.pointerOffsetX;
            const nextY = stagePoint.y - dragState.pointerOffsetY;

            event.preventDefault();
            updateNodePosition(node.id, nextX, nextY);
        };

        const handlePointerEnd = () => {
            const dragState = dragStateRef.current;
            if (!dragState.activeNodeId) {
                return;
            }
            if (dragState.dragging) {
                dragStateRef.current.suppressClickUntil = Date.now() + 250;
            }
            endDrag();
        };

        document.addEventListener('mousemove', handlePointerMove);
        document.addEventListener('mouseup', handlePointerEnd);
        document.addEventListener('touchmove', handlePointerMove, {passive: false});
        document.addEventListener('touchend', handlePointerEnd);
        document.addEventListener('touchcancel', handlePointerEnd);
        return () => {
            document.removeEventListener('mousemove', handlePointerMove);
            document.removeEventListener('mouseup', handlePointerEnd);
            document.removeEventListener('touchmove', handlePointerMove);
            document.removeEventListener('touchend', handlePointerEnd);
            document.removeEventListener('touchcancel', handlePointerEnd);
        };
    }, [endDrag, project]);

    return (
        <div className={styles.graphEditor}>
            <div className={styles.graphHeader}>
                <div className={styles.graphHeading}>
                    <div className={styles.graphTitle}>Mindustry Graph Stage</div>
                    <div className={styles.graphMeta}>
                        {activeProcessor && activeProcessorNode ?
                            `${activeProcessor.name} · ${activeProcessorNode.linkName} · ${formatRange(activeProcessorNode)}` :
                            'No active processor'}
                    </div>
                </div>
            </div>
            <div className={styles.graphPreview}>
                <GraphCanvas
                    graphState={graphState}
                    interactive
                    viewportRef={viewportRef}
                    onBackgroundClick={onBackgroundClick}
                    onNodeClick={onNodeClick}
                    onNodeContextMenu={onNodeContextMenu}
                    onNodePointerDown={onNodePointerDown}
                />
            </div>
            <div className={styles.graphStatus}>{status}</div>
        </div>
    );
};

export const MlogStagePreview = () => {
    const graphState = useGraphState();
    return (
        <div className={styles.graphPreview}>
            <GraphCanvas graphState={graphState} />
        </div>
    );
};

MlogStageGraph.propTypes = {};

export default MlogStageGraph;
