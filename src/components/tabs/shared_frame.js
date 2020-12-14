import React from 'react';
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from 'antd';
import { UpdatingOverlay } from '../generics';

export function SharedFrame({children, title, handleSubmit, isLoading, isForFilters}) {
    if (isLoading) {
        return <UpdatingOverlay />
    }

    if (isForFilters) {
        return (
            <div className="shared_frame">
                {children}
            </div>
        );
    }

    return (
        <div className="shared_frame">
            <div className="button-row-space-between">
                <Link to={'/'}>
                    {'< 回到病案列表'}
                </Link>
                <Button
                    className="btn btn-default"
                    type="primary"
                    onClick={handleSubmit}
                >
                    保存
                </Button>
            </div>
            <h2>{title}</h2>
            <hr />
            {children}
            <br />
            <div className="button-row-space-between">
                <Button
                    className="btn btn-default"
                    type="primary"
                    onClick={handleSubmit}
                >
                    保存
                </Button>
            </div>
        </div>
    );
}
SharedFrame.propTypes = {
    isForFilters: PropTypes.bool,
    isLoading: PropTypes.bool,
    title: PropTypes.string,
    handleSubmit: PropTypes.func,
};

SharedFrame.defaultProps = {
    isForFilters: false,
    isLoading: false,
    title: '',
    handleSubmit: () => {},
};

export default SharedFrame;