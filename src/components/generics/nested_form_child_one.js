import Immutable from "immutable";
import moment from 'moment';
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import {
    Form,
    Button,
    Row,
    Col,
    Card,
    Upload,
    Icon,
    Divider,
    BackTop,
    List,
} from "antd";
import { FaRegTrashAlt } from 'react-icons/fa';
import { showSuccess, showError } from '../utils/notification';
import { InputComponent } from './customized_components';
import { DeleteButtonWithModal, UpdatingOverlay } from './index';

export class NestedFormChildOne extends React.Component {
    state = {
        records: Immutable.List([Immutable.Map()]),
    };

    componentDidMount() {
        if (this.props.values.size > 0) {
            this.setState({
                records: this.props.values
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.values.size > 0 &&
            !prevProps.values.equals(this.props.values)) {
            this.setState({
                records: this.props.values
            });
        }
    }
    
    createFormItem = (field, rowIndex) => {
        const { records } = this.state;
        const { getFieldDecorator } = this.props.form;
        const fieldName = field.get('name');

        return (
            <Form.Item
                label={fieldName}
                // validateStatus={this.getValidateStatus(field)}
                // help={this.getFeedback(field)}
            >
                {getFieldDecorator(`${fieldName}[${rowIndex}]`, {
                    initialValue: records.getIn([rowIndex, fieldName]),
                    rules: [
                        {
                            required: field.get('required', false),
                            message: `请输入${fieldName}!`
                        }
                    ]
                })(
                    <InputComponent
                        field={field}
                        isForFilters={this.props.isForFilters}
                    />
                )}
            </Form.Item>
        )
    };

    add = () => {
        this.setState(prevState => ({
            records: prevState.records.push(Immutable.Map())
        }), () => {
            // jump to the new added record
            const recordForms = document.getElementsByClassName("single-record-form");
            const lastRecordForm = recordForms[recordForms.length - 1];

            lastRecordForm.setAttribute('tabindex', '-1');
            lastRecordForm.focus();
            lastRecordForm.removeAttribute('tabindex');
        });
    };

    remove = (index) => {
        this.setState(prevState => ({
            records: prevState.records.delete(index)
        }));
    };

    prepSubmit = () => {
        let prepData;

        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }

            const firstKey = Object.keys(values)[0];
            let rowData;
            let fieldName;
            let fieldValue;
            let fieldType;

            // an array of record
            prepData = values[firstKey].map((value, index) => {
                rowData = Immutable.Map();

                this.props.fields.forEach(row =>
                    row.forEach(field => {
                        fieldName = field.get('name');
                        fieldType = field.get('type');
                        fieldValue = values[fieldName][index];

                        if (fieldType.includes('date') || fieldType.includes('time')) {
                            fieldValue = fieldValue.format('YYYY-MM-DD HH:mm:ss');     
                        }
                        // if (fieldType === 'datetime') {
                        //     fieldValue = fieldValue.format('YYYY-MM-DD HH:mm');     
                        // }
                        // else if (fieldType === 'date') {
                        //     fieldValue = fieldValue.format('YYYY-MM-DD');     
                        // }
                        // else if (fieldType === 'time') {
                        //     fieldValue = fieldValue.format('HH:mm:ss');     
                        // }
                        else if (fieldType === 'number') {
                            if (fieldValue === null || fieldValue === undefined ) {
                                fieldValue = null;
                            }
                            else {
                                fieldValue = Number(fieldValue);     
                            }
                        }
                        else {
                            fieldValue = fieldValue || ""; 
                        }

                        rowData = rowData.set(fieldName, fieldValue);
                    })
                );

                return rowData.toJS();
            });
        })

        return prepData;
    };

    renderSpecialChildren = (fieldName) => {
        if (this.props.renderChildren === 'all') {
            return this.props.children;
        }
        else {
            // handle special cases here
            const flagValue = this.props.form.getFieldValue(fieldName);

            if (flagValue === '癫痫发作' || flagValue === '持续性癫痫') {
                return this.props.children;
            }

            return null;
        }
    };

    generateFormContent = (colSpan) => {
        let content;
        
        if (this.props.isForFilters) {
            content = this.state.records.map((row, index) => (
                <span key={index}>   
                    {this.props.fields.map((row, rowIndex) => 
                        <Row gutter={24} key={`record_${index}_row_${rowIndex}`}>
                            {row.map((field, colIndex) => 
                                <Col span={colSpan} key={`record_${index}_row_${rowIndex}_col_${colIndex}`}>
                                    {this.createFormItem(field, index)}
                                </Col>
                            )}
                        </Row>
                    )}
                    {this.props.children}
                </span>
                
            )).toArray();
        }
        else {
            content = this.state.records.map((row, index) => (
                <Card
                    title={`${this.props.title} ${index + 1}`}
                    className="single-record-form"
                    key={index}
                    headStyle={{ color: "#00a1b1", fontWeight: 600, fontSize: 16}}
                    size="small"
                    extra={
                        this.state.records.size > 1 &&
                        <DeleteButtonWithModal
                            iconOnly
                            modalText={`该${this.props.title}将被删除.`}
                            handleConfirmClick={() => this.remove(index)}
                        />
                    }
                >   
                    {this.props.fields.map((row, rowIndex) => 
                        <Row gutter={24} key={`record_${index}_row_${rowIndex}`}>
                            {row.map((field, colIndex) => 
                                <Col span={colSpan} key={`record_${index}_row_${rowIndex}_col_${colIndex}`}>
                                    {this.createFormItem(field, index)}
                                </Col>
                            )}
                        </Row>
                    )}
                    {this.props.renderChildren === 'all'
                        ? this.props.children
                        : this.renderSpecialChildren(`脑电图癫痫[${index}]`)
                    }
                </Card>
            )).toArray();
        }

        return content;
    }
    render() {
        const { form, columns = 3, } = this.props;
        const { getFieldDecorator } = form;
        const colSpan = Math.floor(24 / columns);

        return (
            <Form
                layout="vertical"
                // {...formItemLayout}
                labelAlign="left"
                // hideRequiredMark
            >   
                {!this.props.isForFilters &&
                    <Form.Item>
                        <div className="button-row-right-w-bottom-margin">
                            <Button
                                type="default"
                                icon="plus"
                                onClick={this.add}
                            >
                                {`添加${this.props.title}`}
                            </Button>
                        </div>
                    </Form.Item>
                }
                {this.generateFormContent(colSpan)}
                {!this.props.isForFilters && this.state.records.size > 0 &&
                    <Form.Item>
                        <div className="button-row-right-w-bottom-margin">
                            <Button
                                type="default"
                                icon="plus"
                                onClick={this.add}
                            >
                                {`添加${this.props.title}`}
                            </Button>
                        </div>
                    </Form.Item>
                }
            </Form>
        );
    }
}

function onValuesChange(props, changedValues, allValues) {
    if (props.isForFilters) {
        const fieldName = Object.keys(changedValues)[0];
        const fieldValue = changedValues[fieldName][0];

    
        const changedRow = props.fields.find(row => 
            row.find(col => col.get('name') === fieldName)
        )

        if (changedRow) {
            const changedField = changedRow.find(col => col.get('name') === fieldName);
            if (changedField) {
                props.onValuesChange(fieldName, fieldValue, changedField.get('type'))
            }
            
        }
    }
    else {
        console.log(allValues)
        props.onValuesChange(changedValues, allValues);
        // const fieldName = Object.keys(changedValues)[0];
        // const fieldValue = changedValues[fieldName];

        // props.onValuesChange(fieldName, fieldValue)
    
        // const changedRow = props.fields.find(row => 
        //     row.find(col => col.get('name') === fieldName)
        // )

        // if (changedRow) {
        //     const changedField = changedRow.find(col => col.get('name') === fieldName);
        //     if (changedField) {
        //         props.onValuesChange(fieldName, fieldValue, changedField.get('type'))
        //     }
            
        // }
    }
}

NestedFormChildOne = Form.create({
    onValuesChange: onValuesChange,
})(NestedFormChildOne)

NestedFormChildOne.propTypes = {
    isForFilters: PropTypes.bool,
    onValuesChange: PropTypes.func,
    fields: PropTypes.instanceOf(Immutable.List),
    values: PropTypes.instanceOf(Immutable.List),
    columns: PropTypes.number,
    title: PropTypes.string,
    renderChildren: PropTypes.string,
};

NestedFormChildOne.defaultProps = {
    isForFilters: false,
    onValuesChange: () => {},
    fields: Immutable.List([Immutable.Map()]),
    values: Immutable.List([Immutable.Map()]),
    columns: 3,
    title: '单项记录',
    renderChildren: 'all',
};

export default NestedFormChildOne;