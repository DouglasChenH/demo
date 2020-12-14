import PropTypes from 'prop-types';
import React from 'react';
import {
    FaAngleLeft,
    FaRegEdit,
    FaRegEye,
    FaHistory,
    FaRegTrashAlt
} from 'react-icons/fa';
import {
    Button,
    Popconfirm,
    Icon,
    Tooltip
} from 'antd';


export function GoBackOverlay({ pageName }) {
    return (
        <div>
            <FaAngleLeft className="react-icons" />
            {` Back to ${pageName}`}
        </div>
    );
}

GoBackOverlay.propTypes = {
    pageName: PropTypes.string.isRequired,
};
GoBackOverlay.defaultProps = {
    pageName: 'Last Page',
};

export class DeleteButtonWithModal extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        modalText: PropTypes.string,
        handleConfirmClick: PropTypes.func.isRequired,
        iconOnly: PropTypes.bool,
    };

    static defaultProps = {
        iconOnly: false,
        disabled: false,
        modalText: '确认删除么？',
    };

    render() {
        return (
            <div className="delete-button-with-modal">
                <Popconfirm
                    title={this.props.modalText}
                    disabled={this.props.disabled}
                    onConfirm={this.props.handleConfirmClick}
                    icon={<Icon type="exclamation-circle" style={{ color: 'red' }} />}
                    // getPopupContainer={trigger => trigger.parentNode}
                    okText="确认"
                    okType="danger"
                    cancelText="取消"
                >
                    <Button
                        className="btn btn-danger"
                        type="danger"
                        disabled={this.props.disabled}
                        onClick={this.toggleModalDisplay}
                    >   
                        {this.props.disabled
                            ?
                            'Delete'
                            :
                            <span>
                                <FaRegTrashAlt className="react-icons" />
                                {!this.props.iconOnly &&'Delete'}
                            </span>
                        }
                    </Button>
                </Popconfirm>
            </div>
        );
    }
}
