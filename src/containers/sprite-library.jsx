import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import {getLibraryItems, placeNodeByType} from '../lib/mlog-stage-store';
import {stageLibraryTags} from '../lib/mindustry-assets';

import LibraryComponent from '../components/library/library.jsx';

class SpriteLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
        this.state = {
            data: getLibraryItems()
        };
    }
    handleItemSelect (item) {
        placeNodeByType(item.type);
        this.props.onActivateBlocksTab();
    }
    render () {
        return (
            <LibraryComponent
                data={this.state.data}
                id="spriteLibrary"
                tags={stageLibraryTags}
                title="选择 Mindustry 节点"
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

SpriteLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(SpriteLibrary);
