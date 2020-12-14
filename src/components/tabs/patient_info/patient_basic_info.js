import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class PatientBasicInfo extends React.Component {
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
                let values = formatRawDocData(Immutable.fromJS(doc.data));

                values = values.set('病案号', id);
                
                this.setState({
                    values: values,
                    _rev: doc._rev,
                });
            })
            .catch(err => {
                this.setState({
                    values: Immutable.Map({
                        '病案号': id
                    }),
                });
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
                    name: '患者姓名',
                    type: 'text'
                },
                {
                    name: '病案号',
                    type: 'text',
                    disabled: true,
                },
                {
                    name: '性别',
                    type: 'radio',
                    options: ['男', '女', ''],
                },
            ],
            [
                {
                    name: '体重（kg）',
                    type: 'number',
                    bindings: { // result = latter - former
                        type: 'formula',
                        former: '体重（kg）',
                        coeff: 0.035,
                        const: 1,
                        result: '体表面积',
                    }
                },
                {
                    name: '身长 (cm)',
                    type: 'number',
                },
                {
                    name: '体表面积',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '出生日期',
                    type: 'date',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '手术日期',
                        former: '出生日期',
                        result: '手术年龄（天）',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '手术日期',
                    },
                },
                {
                    name: '手术日期',
                    type: 'date',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '手术日期',
                        former: '出生日期',
                        result: '手术年龄（天）',
                    },
                    validation: {
                        required: true,
                    },
                },
                {
                    name: '手术年龄（天）',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '胎龄（周）',
                    type: 'number'
                },
                {
                    name: '是否足月',
                    type: 'radio',
                    options: ['否', '是', ''],
                },
                {
                    name: '诊断',
                    type: 'text',
                },
            ],
            [
                {
                    name: '病种',
                    type: 'text'
                },
                {
                    name: '是否基因异常',
                    type: 'radio',
                    options: ['是', '否', ''],
                },
                {
                    name: '具体基因异常情况',
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
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

PatientBasicInfo.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

PatientBasicInfo.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default PatientBasicInfo;