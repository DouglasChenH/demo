import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";
import { surgeryNames } from '../../fixture/surgeryNames';


export class SurgeryRelatedInfo extends React.Component {
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
                    name: '手术名称',
                    type: 'select',
                    options: surgeryNames,
                },
                {
                    name: '手术日期',
                    type: 'date',
                    validation: {
                        required: true,
                    },
                },
            ],
            [
                {
                    name: 'ABC',
                    type: 'number',
                },
                {
                    name: 'ACC',
                    type: 'number',
                },
                {
                    name: 'STAT',
                    type: 'number',
                },
            ],
            [
                {
                    name: '麻醉开始时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '麻醉结束时间',
                        former: '麻醉开始时间',
                        result: '麻醉时间（h）',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '麻醉结束时间',
                    },
                },
                {
                    name: '麻醉结束时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '麻醉结束时间',
                        former: '麻醉开始时间',
                        result: '麻醉时间（h）',
                    },
                    validation: {
                        required: true,
                    },
                },
                {
                    name: '麻醉时间（h）',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '手术开始时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '手术结束时间',
                        former: '手术开始时间',
                        result: '手术时间（h)',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '手术结束时间',
                    },
                },
                {
                    name: '手术结束时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '手术结束时间',
                        former: '手术开始时间',
                        result: '手术时间（h)',
                    },
                    validation: {
                        required: true,
                    },
                },
                {
                    name: '手术时间（h)',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '体外循环时间（min)',
                    type: 'number',
                },
                {
                    name: '主动脉阻断时间（min)',
                    type: 'number',
                },
                {
                    name: '停循环时间（min）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '是否脑灌注',
                    type: 'radio',
                    options: ['否', '是', ''],
                },
                {
                    name: '是否下半身灌注',
                    type: 'radio',
                    options: ['否', '是', ''],
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
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

SurgeryRelatedInfo.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

SurgeryRelatedInfo.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default SurgeryRelatedInfo;