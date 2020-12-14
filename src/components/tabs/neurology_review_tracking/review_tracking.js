import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import moment from 'moment';
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";
import { showError } from '../../utils/notification';

export class ReviewTracking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.Map(),
            isLoading: true,
            _rev: undefined,
        };
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        fetchDataMixin(id, path, title)
            .then(doc => {
                this.setState({
                    values: formatRawDocData(Immutable.fromJS(doc.data)),
                    _rev: doc._rev,
                });
                
                if (id) {
                    fetchDataMixin(id, 'surgery_related_info', '手术相关信息')
                        .then(doc => {
                            if (doc.data['手术日期'] === undefined) {
                                showError('请在手术相关信息表中输入手术日期')
                            }
                            else {
                                const operationTime = moment(doc.data['手术日期']);
                                this.setState(prevState => ({
                                    values: prevState.values
                                        .set('术后1个月日期', operationTime.clone().add(1, 'months'))
                                        .set('术后6个月日期', operationTime.clone().add(6, 'months')),
                                }));
                            }
                        })
                        .catch(err => {
                            if (err.error === 'not_found') {
                                showError('请在手术相关信息表中输入手术日期')
                            }
                            console.log(err);
                        })
                }
             })
            .catch(err => {
                console.log(err);
            })
    }

    handleSubmit = e => {
        e.preventDefault();
        const { id, path, title } = this.props;
        let prepData = this.form.prepSubmit();

        if (prepData) {
            let doc = {
                _id:`${path}:user_${id}`,
                data: prepData,
                type: 'general',
            }
            
            if (this.state._rev) {
                doc._rev = this.state._rev;
            }

            submitDataMixin(doc, id, title)
                .then(rev => {
                    this.setState({
                        _rev: rev,
                    });
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };

    createFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '序号',
                    type: 'text',
                },
                {
                    name: '首次复查心脏彩超日期',
                    type: 'date',
                },
                {
                    name: '术后1个月日期',
                    type: 'date',
                    disabled: true,
                },
                {
                    name: '术后6个月日期',
                    type: 'date',
                    disabled: true,
                },
            ],
            [
                {
                    name: '术后MRI诊断',
                    type: 'text',
                },
                {
                    name: '术后MRI轻重辨别',
                    type: 'radio',
                    options: ['轻', '重', ''],
                },
                {
                    name: '术前脑电图诊断',
                    type: 'text',
                },
                {
                    name: '术后脑电诊断',
                    type: 'text',
                },
            ],
        ]);

        return fields;
    };

    render() {
        const { id, title, onValuesChange } = this.props;
        const { values, isLoading } = this.state;

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >
                <GeneralForm
                    wrappedComponentRef={(form) => this.form = form}
                    values={values}
                    fields={this.createFields()}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

ReviewTracking.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

ReviewTracking.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default ReviewTracking;