import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";
import { NumberRangeInput } from '../../generics/customized_components';
import {
    Form,
    Row,
    Col,
    Input,
    Radio,
} from 'antd';

class InputComponent extends React.Component {
    triggerChange = changedValue => {
        const { onChange } = this.props;

        if (onChange) {
            onChange(changedValue);
        }
    };

    render() {
        const { value, max, suffix, isForFilters } = this.props;
        
        if (isForFilters) {
            return (
                <NumberRangeInput
                    value={value}
                    suffix={suffix}
                    min={0}
                    max={max}
                    onChange={this.triggerChange}
                    style={{ width: '100%'}}
                />
            );
        }

        return (
            <Input
                type="number"
                addonAfter={suffix}
                value={value}
                onChange={this.triggerChange}
                min={0}
                max={max}
            />
        );
    }
}


export class ScreenUsage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.Map(),
            type: '是',
            isLoading: true,
            _rev: undefined,
        };
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        fetchDataMixin(id, path, title)
            .then(doc => {
                const values = formatRawDocData(Immutable.fromJS(doc.data));

                this.setState({
                    values: values,
                    type: values.get('是否已经上学'),
                    _rev: doc._rev,
                });
            })
            .catch(err => {
                console.log(err);
            })
    }

    handleSubmit = e => {
        e.preventDefault();
        const { id, path, title, form } = this.props;

        form.validateFields((err, values) => {
            if (!err && !this.isAnyValidationFailed()) {
                values["是否已经上学"] = this.state.type;

                let doc = {
                    _id:`${path}:user_${id}`,
                    data: values,
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
        });
    };


    createFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '是否已经上学',
                    type: 'radio',
                    options: ['否', '是', '']
                },
                {
                    name: '非周末使用时间（小时）',
                    type: 'number',
                },
                {
                    name: '周末使用时间（小时）',
                    type: 'number',
                },
                {
                    name: '每日使用时间（小时）',
                    type: 'number',
                },
            ]
        ]);

        return fields;
    };

    getValidateStatus = (field) => {
        const { form } = this.props;
        const { values } = this.state;
        const fieldValue = form.getFieldValue(field) || values.get(field, null);

        if (fieldValue > 24) {
            return 'error';
        }

        return null;
    };

    getFeedback = (field) => {
        const { form } = this.props;
        const { values } = this.state;
        const fieldValue = form.getFieldValue(field) || values.get(field, null);

        if (fieldValue > 24) {
            return '最大24!';
        }
        
        return null;
    };

    isAnyValidationFailed = () => {
        if (!this.props.id) {
            return false;
        }

        const isAnyError = [
            "非周末使用时间（小时）",
            "周末使用时间（小时）",
            "每日使用时间（小时）"
        ].some(field => 
            this.getValidateStatus(field) === 'error'
        );

        return isAnyError;
    };

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { id, title, onValuesChange } = this.props;
        const { values, isLoading } = this.state;
        const isForFilters = !id;

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >   
                <Form layout="vertical">
                    <Form.Item
                        label="是否已经上学"
                    >
                        <Radio.Group onChange={e => this.setState({ type: e.target.value})} value={this.state.type}>
                            <Radio value={"否"}>否</Radio>
                            <Radio value={"是"}>是</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {this.state.type === '是' &&
                        <Form.Item
                            label="非周末使用时间（小时）"
                            validateStatus={this.getValidateStatus('非周末使用时间（小时）')}
                            help={this.getFeedback('非周末使用时间（小时）')}
                        >
                            {getFieldDecorator('非周末使用时间（小时）', {
                                initialValue: values.get('非周末使用时间（小时）', null),
                            })(
                                <InputComponent
                                    suffix={"小时"}
                                    max={24}
                                    isForFilters={isForFilters}
                                />
                            )}
                        </Form.Item>
                    }
                    {this.state.type === '是' &&
                        <Form.Item
                            label="周末使用时间（小时）"
                            validateStatus={this.getValidateStatus('周末使用时间（小时）')}
                            help={this.getFeedback('周末使用时间（小时）')}
                        >
                            {getFieldDecorator('周末使用时间（小时）', {
                                initialValue: values.get('周末使用时间（小时）', null),
                            })(
                                <InputComponent
                                    suffix={"小时"}
                                    max={24}
                                    isForFilters={isForFilters}
                                />
                            )}
                        </Form.Item>
                    }
                    {this.state.type === '否' &&
                        <Form.Item
                            label="每日使用时间（小时）"
                            validateStatus={this.getValidateStatus('每日使用时间（小时）')}
                            help={this.getFeedback('每日使用时间（小时）')}
                        >
                            {getFieldDecorator('每日使用时间（小时）', {
                                initialValue: values.get('每日使用时间（小时）', null),
                            })(
                                <InputComponent
                                    suffix={"小时"}
                                    max={24}
                                    isForFilters={isForFilters}
                                />
                            )}
                        </Form.Item>
                    }
                </Form>
            </SharedFrame>
        );
    }
}

function onValuesChange(props, changedValues, allValues) {
    if (!props.id) {
        const fieldName = Object.keys(changedValues)[0];
        const fieldValue = changedValues[fieldName];

        props.onValuesChange(fieldName, fieldValue, 'number')
    }
}

ScreenUsage = Form.create({
    onValuesChange: onValuesChange,
})(ScreenUsage)


ScreenUsage.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

ScreenUsage.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default ScreenUsage;