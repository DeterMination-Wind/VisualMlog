import PropTypes from 'prop-types';
import React from 'react';

import VM from 'scratch-vm';

import SpriteLibrary from '../../containers/sprite-library.jsx';
import SpriteSelectorComponent from '../sprite-selector/sprite-selector.jsx';
import StageSelector from '../../containers/stage-selector.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants';
import {
    deleteStageNode,
    getGraphState,
    getNodeInfo,
    getProcessorForNode,
    selectProcessor,
    selectStageNode,
    subscribeGraphState,
    updateNodeField
} from '../../lib/mlog-stage-store';

import styles from './target-pane.css';

const useGraphState = () => {
    const [graphState, setGraphState] = React.useState(getGraphState());
    React.useEffect(() => subscribeGraphState(setGraphState), []);
    return graphState;
};

const buildGraphSprites = project => project.stage.nodes.reduce((sprites, node, index) => {
    const info = getNodeInfo(node);
    const processor = getProcessorForNode(project, node.id);
    sprites[node.id] = {
        costume: {
            asset: null,
            bitmapResolution: 1,
            name: info.label,
            rotationCenterX: 0,
            rotationCenterY: 0,
            url: info.icon
        },
        costumeURL: info.icon,
        details: processor ?
            `${processor.name} · ${processor.links.length} 个连接` :
            `${info.label} · 普通节点`,
        direction: 90,
        id: node.id,
        name: node.linkName,
        order: index,
        rotationStyle: 'all around',
        size: 100,
        visible: true,
        x: node.x,
        y: node.y
    };
    return sprites;
}, {});

/*
 * Pane that contains the sprite selector, sprite info, stage selector,
 * and the new sprite, costume and backdrop buttons
 * @param {object} props Props for the component
 * @returns {React.Component} rendered component
 */
const TargetPane = ({
    editingTarget,
    fileInputRef,
    hoveredTarget,
    graphNodeLibraryVisible,
    spriteLibraryVisible,
    onActivateBlocksTab,
    onChangeSpriteDirection,
    onChangeSpriteName,
    onChangeSpriteRotationStyle,
    onChangeSpriteSize,
    onChangeSpriteVisibility,
    onChangeSpriteX,
    onChangeSpriteY,
    onDeleteSprite,
    onDrop,
    onDuplicateSprite,
    onExportSprite,
    onFileUploadClick,
    onNewSpriteClick,
    onPaintSpriteClick,
    onRequestCloseSpriteLibrary,
    onSelectSprite,
    onSpriteUpload,
    onSurpriseSpriteClick,
    raiseSprites,
    stage,
    stageSize,
    sprites,
    useGraphTargets,
    vm,
    ...componentProps
}) => {
    const graphState = useGraphState();
    const graphSprites = buildGraphSprites(graphState.project);
    if (useGraphTargets) {
        const {project, selectedStageNodeId} = graphState;
        const selectedNode = selectedStageNodeId ?
            project.stage.nodes.find(node => node.id === selectedStageNodeId) :
            null;
        const openGraphNodeLibrary = event => {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            onNewSpriteClick(event);
        };
        const noop = event => {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
        };
        const handleSelectSprite = nodeId => {
            const processor = getProcessorForNode(project, nodeId);
            if (processor) {
                selectProcessor(processor.id);
            } else {
                selectStageNode(nodeId);
            }
        };
        const updateSelectedNodeField = field => value => {
            if (!selectedNode) return;
            updateNodeField(selectedNode.id, field, value);
        };

        return (
            <div
                className={styles.targetPane}
                {...componentProps}
            >
                <SpriteSelectorComponent
                    editingTarget={selectedStageNodeId}
                    hoveredTarget={hoveredTarget}
                    libraryButtonTitle="选择节点"
                    raised={raiseSprites}
                    selectedId={selectedStageNodeId}
                    spriteFileInput={fileInputRef}
                    sprites={graphSprites}
                    stageSize={stageSize}
                    useLibraryOnlyMenu
                    onChangeSpriteDirection={updateSelectedNodeField('direction')}
                    onChangeSpriteName={updateSelectedNodeField('name')}
                    onChangeSpriteRotationStyle={updateSelectedNodeField('rotationStyle')}
                    onChangeSpriteSize={updateSelectedNodeField('size')}
                    onChangeSpriteVisibility={updateSelectedNodeField('visible')}
                    onChangeSpriteX={updateSelectedNodeField('x')}
                    onChangeSpriteY={updateSelectedNodeField('y')}
                    onDeleteSprite={deleteStageNode}
                    onFileUploadClick={openGraphNodeLibrary}
                    onNewSpriteClick={openGraphNodeLibrary}
                    onPaintSpriteClick={openGraphNodeLibrary}
                    onSelectSprite={handleSelectSprite}
                    onSpriteUpload={noop}
                    onSurpriseSpriteClick={openGraphNodeLibrary}
                />
                <div>
                    {graphNodeLibraryVisible ? (
                        <SpriteLibrary
                            vm={vm}
                            onActivateBlocksTab={onActivateBlocksTab}
                            onRequestClose={onRequestCloseSpriteLibrary}
                        />
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles.targetPane}
            {...componentProps}
        >

            <SpriteSelectorComponent
                editingTarget={editingTarget}
                hoveredTarget={hoveredTarget}
                raised={raiseSprites}
                selectedId={editingTarget}
                spriteFileInput={fileInputRef}
                sprites={sprites}
                stageSize={stageSize}
                onChangeSpriteDirection={onChangeSpriteDirection}
                onChangeSpriteName={onChangeSpriteName}
                onChangeSpriteRotationStyle={onChangeSpriteRotationStyle}
                onChangeSpriteSize={onChangeSpriteSize}
                onChangeSpriteVisibility={onChangeSpriteVisibility}
                onChangeSpriteX={onChangeSpriteX}
                onChangeSpriteY={onChangeSpriteY}
                onDeleteSprite={onDeleteSprite}
                onDrop={onDrop}
                onDuplicateSprite={onDuplicateSprite}
                onExportSprite={onExportSprite}
                onFileUploadClick={onFileUploadClick}
                onNewSpriteClick={onNewSpriteClick}
                onPaintSpriteClick={onPaintSpriteClick}
                onSelectSprite={onSelectSprite}
                onSpriteUpload={onSpriteUpload}
                onSurpriseSpriteClick={onSurpriseSpriteClick}
            />
            <div className={styles.stageSelectorWrapper}>
                {stage.id && <StageSelector
                    asset={
                        stage.costume &&
                        stage.costume.asset
                    }
                    backdropCount={stage.costumeCount}
                    id={stage.id}
                    selected={stage.id === editingTarget}
                    onSelect={onSelectSprite}
                />}
                <div>
                    {spriteLibraryVisible ? (
                        <SpriteLibrary
                            vm={vm}
                            onActivateBlocksTab={onActivateBlocksTab}
                            onRequestClose={onRequestCloseSpriteLibrary}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const spriteShape = PropTypes.shape({
    costume: PropTypes.shape({
        // asset is defined in scratch-storage's Asset.js
        asset: PropTypes.object, // eslint-disable-line react/forbid-prop-types
        url: PropTypes.string,
        name: PropTypes.string.isRequired,
        // The following are optional because costumes uploaded from disk
        // will not have these properties available
        bitmapResolution: PropTypes.number,
        rotationCenterX: PropTypes.number,
        rotationCenterY: PropTypes.number
    }),
    costumeCount: PropTypes.number,
    direction: PropTypes.number,
    id: PropTypes.string,
    name: PropTypes.string,
    order: PropTypes.number,
    size: PropTypes.number,
    visibility: PropTypes.bool,
    x: PropTypes.number,
    y: PropTypes.number
});

TargetPane.propTypes = {
    editingTarget: PropTypes.string,
    extensionLibraryVisible: PropTypes.bool,
    fileInputRef: PropTypes.func,
    graphNodeLibraryVisible: PropTypes.bool,
    hoveredTarget: PropTypes.shape({
        hoveredSprite: PropTypes.string,
        receivedBlocks: PropTypes.bool
    }),
    onActivateBlocksTab: PropTypes.func.isRequired,
    onChangeSpriteDirection: PropTypes.func,
    onChangeSpriteName: PropTypes.func,
    onChangeSpriteRotationStyle: PropTypes.func,
    onChangeSpriteSize: PropTypes.func,
    onChangeSpriteVisibility: PropTypes.func,
    onChangeSpriteX: PropTypes.func,
    onChangeSpriteY: PropTypes.func,
    onDeleteSprite: PropTypes.func,
    onDrop: PropTypes.func,
    onDuplicateSprite: PropTypes.func,
    onExportSprite: PropTypes.func,
    onFileUploadClick: PropTypes.func,
    onNewSpriteClick: PropTypes.func,
    onPaintSpriteClick: PropTypes.func,
    onRequestCloseExtensionLibrary: PropTypes.func,
    onRequestCloseSpriteLibrary: PropTypes.func,
    onSelectSprite: PropTypes.func,
    onSpriteUpload: PropTypes.func,
    onSurpriseSpriteClick: PropTypes.func,
    raiseSprites: PropTypes.bool,
    spriteLibraryVisible: PropTypes.bool,
    sprites: PropTypes.objectOf(spriteShape),
    stage: spriteShape,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    useGraphTargets: PropTypes.bool,
    vm: PropTypes.instanceOf(VM)
};

export default TargetPane;
