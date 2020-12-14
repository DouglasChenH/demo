import React from 'react';
import Loader from 'react-loader-spinner';

export class UpdatingOverlay extends React.Component {
    //other logic
    render() {
        return(
            <div className="loading">
                <Loader
                    type="ThreeDots"
                    color="#00a1b1"
                    // height={80}
                    // width={80}
                />
            </div>
        );
    }
}

export default UpdatingOverlay;