import Immutable from "immutable";
import moment from 'moment';
import PropTypes from "prop-types";
import React, { useState } from 'react';
import {
    Form,
    Button,
    Row,
    Col,
    Card,
} from "antd";
import { showSuccess, showError } from '../utils/notification';
import { InputComponent } from './customized_components';

export class GeneralForm extends React.Component {
    triggerAutoBinding = (bindings) => {
        const type = bindings.get('type');
        const result = bindings.get('result');
        const former = bindings.get('former');
        const latter = bindings.get('latter');
        const latterValue = latter && this.props.form.getFieldValue(latter);
        const formerValue = former && this.props.form.getFieldValue(former);

        // special case
        if (type === 'formula') {
            const coeff = bindings.get('coeff', 0);
            const constOfFormula = bindings.get('const', 0);
            const formulaValue = coeff * formerValue + constOfFormula;
            let state = {};
            state[result] = formulaValue.toFixed(3);
            this.props.form.setFieldsValue(state);
            return;
        }
        else if (['years','days', 'hours', 'minutes', 'seconds'].includes(type)) {
            // are they moment objects?
            if (moment.isMoment(latterValue) && moment.isMoment(formerValue)) {
                let state = {};

                const latterValueStartTime = latterValue.clone().startOf(type);
                const formerValueStartTime = formerValue.clone().startOf(type);

                if (latterValueStartTime.isSameOrAfter(formerValueStartTime)) {
                    // add 1 here 
                    state[result] = latterValueStartTime.diff(formerValueStartTime, type) + 1; 
                }
                else {
                    state[result] = null;
                }
                this.props.form.setFieldsValue(state);
                return;
            }
        }
        else {
            // are they numbers?
            if (typeof latterValue === 'number' && typeof formerValue === 'number') {
                let state = {};
                state[result] = latterValue - formerValue;
                this.props.form.setFieldsValue(state);
                return;
            }
        }   
    };

    getValidateStatus = (field) => {
        if (this.props.isForFilters) {
            return null;
        }

        const validation = field.get('validation');

        if (!validation) {
            return null;
        }

        const { form, values } = this.props;
        const fieldName = field.get('name');
        const fieldValue = form.getFieldValue(fieldName) || values.get(fieldName, null);
        let max;
        let min;
        let isError = false;

        if (validation.get('required') && !fieldValue) {
            return 'error';
        }
        if (fieldValue && validation.get('max')) {
            const maxFieldName = validation.get('max');
            max = form.getFieldValue(maxFieldName) || values.get(maxFieldName, null);

            if (max) {
                if (validation.get('type') === 'moment') {
                    isError = fieldValue.isAfter(max.clone().endOf('day'));
                }
                if (validation.get('type') === 'number') {
                    isError = fieldValue > max;
                }
                if (isError) {
                    return 'error';
                }
            }
        }
        if (fieldValue && validation.get('min')) {
            const minFieldName = validation.get('min');
            min = form.getFieldValue(minFieldName) || values.get(minFieldName, null);

            if (min) {
                if (validation.get('type') === 'moment') {
                    isError = fieldValue.isBefore(min.clone().startOf('day'));
                }
                if (validation.get('type') === 'number') {
                    isError = fieldValue < min;
                }
                if (isError) {
                    return 'error';
                } 
            }
        }
        
        return isError ? "error" : null;
    };

    getFeedback = (field) => {
        if (this.props.isForFilters) {
            return null;
        }

        const validation = field.get('validation');

        if (!validation) {
            return null;
        }

        const { form, values } = this.props;
        const fieldName = field.get('name');
        const fieldValue = form.getFieldValue(fieldName) || values.get(fieldName, null);
        let max;
        let min;

        if (validation.get('required') && !fieldValue) {
            return `请输入${fieldName}!`;
        }
        if (fieldValue && validation.get('max')) {
            const maxFieldName = validation.get('max');

            max = form.getFieldValue(maxFieldName) || values.get(maxFieldName, null);

            if (!max) {
                return `请输入${maxFieldName}以验证!`;
            }
            else {
                if (validation.get('type') === 'moment' && fieldValue.isAfter(max.clone().endOf('day'))) {
                    return `${fieldName}应该早于${maxFieldName}！`;
                }
                if (validation.get('type') === 'number' && fieldValue > max) {
                    return `${fieldName}应该小于${maxFieldName}！` ;
                }
            }


        }

        if (fieldValue && validation.get('min')) {
            const minFieldName = validation.get('min');
            min = form.getFieldValue(minFieldName) || values.get(minFieldName, null);

            if (!min) {
                return `请输入${minFieldName}以验证!`;
            }
            else {
                if (validation.get('type') === 'moment' && fieldValue.isBefore(min.clone().startOf('day'))) {
                    return `${fieldName}应该迟于${minFieldName}！`;
                }
                if (validation.get('type') === 'number' && fieldValue < min) {
                    return `${fieldName}应该大于${minFieldName}！`;
                }
            }     
        }
        
        return null;
    };

    createFormItem = (field) => {
        const { values, form } = this.props;
        const { getFieldDecorator } = form;
        const fieldName = field.get('name');
        const fieldType = field.get('type');
        let initialValue = values.get(fieldName);

        if (!initialValue) {
            if (fieldType.includes('date') || fieldType.includes('time')) {
                initialValue = null;
            }
            else if (fieldType === 'number') {
                initialValue = null;
            }
            else if (fieldType === 'file') {
                initialValue = Immutable.List();
            }
            else {
                initialValue = "";
            }
        }
        
        return (
            <Form.Item
                label={fieldName}
                validateStatus={this.getValidateStatus(field)}
                help={this.getFeedback(field)}
            >
                {getFieldDecorator(fieldName, {
                    initialValue: initialValue,
                })(
                    <InputComponent
                        field={field}
                        triggerAutoBinding={this.triggerAutoBinding}
                        isForFilters={this.props.isForFilters}
                    />
                )}
            </Form.Item>
        )
    };

    isAnyValidationFailed = () => {
        if (this.props.isForFilters) {
            return false;
        }

        const isAnyError = this.props.fields.some(row => 
            row.some(field => 
                field.get('validation') && this.getValidateStatus(field) === 'error'
            )
        );

        return isAnyError;
    };

    prepSubmit = () => {
        let prepData;

        this.props.form.validateFields((err, values) => {
            if (err || this.isAnyValidationFailed()) {
                return;
            }

            let fieldName;
            let fieldValue;
            let fieldType;

            this.props.fields.forEach(row =>
                row.forEach(field => {
                    fieldName = field.get('name');
                    fieldType = field.get('type');
                    
                    fieldValue = values[fieldName];

                    // if (fieldType === 'datetime') {
                    //     fieldValue = fieldValue.format('YYYY-MM-DD HH:mm');     
                    // }
                    // else if (fieldType === 'date') {
                    //     fieldValue = fieldValue.format('YYYY-MM-DD');     
                    // }
                    // else if (fieldType === 'time') {
                    //     fieldValue = fieldValue.format('HH:mm:ss');     
                    // }
                    if (fieldType.includes('date') || fieldType.includes('time')) {
                        if (moment.isMoment(fieldValue)) {
                            fieldValue = fieldValue.format('YYYY-MM-DD HH:mm:ss');     
                        }    
                    }
                    if (fieldType === 'number') {
                        if (fieldValue === null || fieldValue === undefined ) {
                            fieldValue = null;
                        }
                        else {
                            fieldValue = Number(fieldValue);     
                        }
                    }
                    if (fieldType === 'file') {
                        if (Immutable.List.isList(fieldValue)) {
                            fieldValue = fieldValue.toJS();
                        }
                        else {
                            fieldValue = fieldValue || []; 
                        }
                    }
                    else {
                        fieldValue = fieldValue || ""; 
                    }

                    values[fieldName] = fieldValue;
                })
            );

            prepData = values;
        })

        return prepData;
    };

    render() {
        const { fields, values, columns = 3, form } = this.props;
        const { getFieldDecorator } = form;
        const colSpan = Math.floor(24 / columns);

        if (fields.size === 0) {
            return null;
        }
        
        return (
            <Form
                layout="vertical"
                labelAlign="left"
                // hideRequiredMark
            > 
                {fields.map((row, rowIndex) => 
                    <Row gutter={24} key={`row_${rowIndex}`}>
                        {row.map((field, colIndex) => 
                            <Col span={colSpan} key={`row_${rowIndex}_col_${colIndex}`}>
                                {this.createFormItem(field)}
                            </Col>
                        )}
                    </Row>
                ).toArray()}
            </Form>
        );
    }
}

function onValuesChange(props, changedValues, allValues) {
    if (props.isForFilters) {
        const fieldName = Object.keys(changedValues)[0];
        const fieldValue = changedValues[fieldName];

        const changedRow = props.fields.find(row => 
            row.find(col => col.get('name') === fieldName)
        )

        if (changedRow) {
            const changedField = changedRow.find(col => col.get('name') === fieldName)
            if (changedField) {
                props.onValuesChange(fieldName, fieldValue, changedField.get('type'))
            }
            
        }
    }
}

GeneralForm = Form.create({
    onValuesChange: onValuesChange,
})(GeneralForm)

GeneralForm.propTypes = {
    isForFilters: PropTypes.bool,
    onValuesChange: PropTypes.func,
    fields: PropTypes.instanceOf(Immutable.List),
    values: PropTypes.instanceOf(Immutable.Map),
    columns: PropTypes.number,
};

GeneralForm.defaultProps = {
    isForFilters: false,
    onValuesChange: () => {},
    fields: Immutable.List(),
    values: Immutable.Map(),
    columns: 3,
};

export default GeneralForm;