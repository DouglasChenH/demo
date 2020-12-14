import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { NumberRangeInput } from '../../generics/customized_components';
import {
    Form,
    Row,
    Col,
    Input,
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

export class ComaTime extends React.Component {
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
        const { id, path, title, form } = this.props;

        form.validateFields((err, values) => {
            if (!err && !this.isAnyValidationFailed()) {
                let doc = {
                    _id:`coma_time:user_${this.props.id}`,
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

    getValidateStatus = (field) => {
        const { form } = this.props;
        const { values } = this.state;
        const fieldValue = form.getFieldValue(field) || values.get(field, null);

        if (field.includes('小时') && fieldValue > 23) {
            return 'error';
        }
        if (field.includes('分钟') && fieldValue > 59) {
            return 'error';
        }
        
        return null;
    };

    getFeedback = (field) => {
        const { form } = this.props;
        const { values } = this.state;
        const fieldValue = form.getFieldValue(field) || values.get(field, null);

        if (field.includes('小时') && fieldValue > 23) {
            return '最大23!';
        }
        if (field.includes('分钟') && fieldValue > 59) {
            return '最大59!';
        }
        
        return null;
    };

    isAnyValidationFailed = () => {
        if (!this.props.id) {
            return false;
        }

        const isAnyError = [
            '入院前昏迷天数',
            '入院前昏迷小时数',
            '入院前昏迷分钟数',
            '入院后昏迷天数',
            '入院后昏迷小时数',
            '入院后昏迷分钟数'
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
                <Form
                    layout="vertical"
                    labelAlign="left"
                    hideRequiredMark
                > 
                    <h3>{"入院前"}</h3>
                    <hr />
                    <br />
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item>
                                {getFieldDecorator('入院前昏迷天数', {
                                    initialValue: values.get('入院前昏迷天数', null),
                                })(
                                    <InputComponent
                                        suffix={"天"}
                                        isForFilters={isForFilters}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                validateStatus={this.getValidateStatus('入院前昏迷小时数')}
                                help={this.getFeedback('入院前昏迷小时数')}
                            >
                                {getFieldDecorator('入院前昏迷小时数', {
                                    initialValue: values.get('入院前昏迷小时数', null),
                                })(
                                    <InputComponent
                                        suffix={"小时"}
                                        max={23}
                                        isForFilters={isForFilters}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                validateStatus={this.getValidateStatus('入院前昏迷分钟数')}
                                help={this.getFeedback('入院前昏迷分钟数')}
                            >
                                {getFieldDecorator('入院前昏迷分钟数', {
                                    initialValue: values.get('入院前昏迷分钟数', null),
                                })(
                                    <InputComponent
                                        suffix={"分钟"}
                                        max={59}
                                        isForFilters={isForFilters}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <h3>{"入院后"}</h3>
                    <hr />
                    <br />
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item>
                                {getFieldDecorator('入院后昏迷天数', {
                                    initialValue: values.get('入院后昏迷天数', null),
                                })(
                                    <InputComponent
                                        suffix={"天"}
                                        isForFilters={isForFilters}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                validateStatus={this.getValidateStatus('入院后昏迷小时数')}
                                help={this.getFeedback('入院后昏迷小时数')}
                            >
                                {getFieldDecorator('入院后昏迷小时数', {
                                    initialValue: values.get('入院后昏迷小时数', null),
                                })(
                                    <InputComponent
                                        suffix={"小时"}
                                        max={23}
                                        isForFilters={isForFilters}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                validateStatus={this.getValidateStatus('入院后昏迷分钟数')}
                                help={this.getFeedback('入院后昏迷分钟数')}
                            >
                                {getFieldDecorator('入院后昏迷分钟数', {
                                    initialValue: values.get('入院后昏迷分钟数', null),
                                })(
                                    <InputComponent
                                        suffix={"分钟"}
                                        max={59}
                                        isForFilters={isForFilters}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
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

ComaTime = Form.create({
    onValuesChange: onValuesChange,
})(ComaTime)

ComaTime.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

ComaTime.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default ComaTime;