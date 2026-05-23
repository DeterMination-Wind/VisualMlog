import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape} from 'react-intl';

import Box from '../box/box.jsx';
import ActionMenu from '../action-menu/action-menu.jsx';
import SpriteSelectorItem from '../sprite-selector-item/sprite-selector-item.jsx';
import styles from './mlog-graph-sprite-selector.css';

import spriteIcon from '../action-menu/icon--sprite.svg';
import searchIcon from '../action-menu/icon--search.svg';

const MlogGraphSpriteSelector = props => {
    const {
        editingTarget,
        hoveredTarget,
        intl,
        items,
        onNewNodeClick,
        onSelectSprite,
        raised,
        selectedId
    } = props;
    const addNodeLabel = '选择节点';

    return (
        <Box className={styles.graphSelector}>
            <Box className={styles.graphSelectorScroll}>
                <Box className={styles.graphSelectorItems}>
                    {items.map(item => (
                        <div className={styles.graphSelectorItemWrap} key={item.id}>
                            <SpriteSelectorItem
                                className={styles.graphSelectorItem}
                                costumeURL={item.costumeURL}
                                details={item.details}
                                name={item.name}
                                selected={item.id === selectedId}
                                onClick={() => onSelectSprite(item.id)}
                            />
                        </div>
                    ))}
                </Box>
            </Box>
            <ActionMenu
                className={styles.graphSelectorAddButton}
                img={spriteIcon}
                moreButtons={[
                    {
                        title: addNodeLabel,
                        img: searchIcon,
                        onClick: onNewNodeClick
                    }
                ]}
                title={addNodeLabel}
                onClick={onNewNodeClick}
            />
        </Box>
    );
};

MlogGraphSpriteSelector.propTypes = {
    editingTarget: PropTypes.string,
    hoveredTarget: PropTypes.shape({}),
    intl: intlShape.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    onNewNodeClick: PropTypes.func.isRequired,
    onSelectSprite: PropTypes.func.isRequired,
    raised: PropTypes.bool,
    selectedId: PropTypes.string
};

MlogGraphSpriteSelector.defaultProps = {
    editingTarget: null,
    hoveredTarget: null,
    raised: false,
    selectedId: null
};

export default injectIntl(MlogGraphSpriteSelector);
