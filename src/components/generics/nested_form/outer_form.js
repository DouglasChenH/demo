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
    Tabs,
} from "antd";
import { FaRegTrashAlt } from 'react-icons/fa';
import { showSuccess, showError } from '../../utils/notification';
import { InputComponent } from '../customized_components';
import { DeleteButtonWithModal, UpdatingOverlay } from '../index';

const { TabPane } = Tabs;

export const formatFormValues = (values, fields) => {
    const firstKey = values.keySeq().first();
    let rowData;
    let fieldName;
    let fieldValue;
    let fieldType;

    // an array of record
    const prepData = values.get(firstKey).map((value, index) => {
        rowData = Immutable.Map();

        fields.forEach(row =>
            row.forEach(field => {
                fieldName = field.get('name');
                fieldType = field.get('type');
                fieldValue = values.getIn([fieldName, index]);

                if (fieldType.includes('date') || fieldType.includes('time')) {
                    if (moment.isMoment(fieldValue)) {
                        fieldValue = fieldValue.format('YYYY-MM-DD HH:mm:ss');     
                    }
                    
                }
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

        return rowData;
    });

    return prepData
}


export class NestedOuterForm extends React.Component {
    state = {
        records: Immutable.List([Immutable.Map()]),
        activeKey: '0',
        formValues: Immutable.List([Immutable.Map()])
    };

    componentDidMount() {
        if (this.props.values) {
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
                    initialValue: records.getIn([rowIndex, 'general', fieldName]),
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
            records: prevState.records.push(Immutable.Map()),
            activeKey: String(prevState.records.size)
        }));
    };

    remove = (index) => {
        this.setState(prevState => ({
            records: prevState.records.delete(index),
            activeKey: String(prevState.records.size - 2)
        }));
    };

    prepSubmit = () => {
        let prepData;

        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }

            prepData = this.state.records;
            const baseFormData = formatFormValues(Immutable.fromJS(values), this.props.fields);
            baseFormData.forEach((form, index) => {
                prepData = prepData.setIn([index, 'general'], form)
            })
            // let childFormData = Immutable.List();
            // let generalPart;
            // let dynamicPart;

            // console.log(this.state.records.toJS())
            // return;
            // this.state.formValues.forEach(layer => {
            //     generalPart = Immutable.Map();
            //     dynamicPart = Immutable.List();

            //     if (layer.has('general')) {
            //         generalPart = formatFormValues(layer.get('general'), this.props.firstLayerFields);
            //     }
            //     if (layer.has('dynamic')) {
            //         let subDynamicPart = Immutable.Map();
            //         layer.get('dynamic').forEach(secondLayer => {
            //             if (secondLayer.has('general')) {
            //                 subDynamicPart = subDynamicPart.set('general', formatFormValues(secondLayer.get('general'), this.props.secondLayerFields));
            //                 dynamicPart = dynamicPart.push(subDynamicPart);
            //             }
            //             if (secondLayer.has('dynamic')) {
            //                 // not used
            //             }
            //         });
            //     }

            //     childFormData = childFormData.push(Immutable.Map({
            //         general: generalPart,
            //         dynamic: dynamicPart
            //     }));
            // });
        
            // // console.log(this.state.formValues.toJS(), childFormData.toJS())

            // const baseFormData = formatFormValues(Immutable.fromJS(values), this.props.fields);
            // prepData = baseFormData.map((form, formLayerIndex) => {
            //     return Immutable.Map({
            //         general: form,
            //         dynamic: childFormData.get(formLayerIndex)
            //     })
            // })
        })

        return prepData;
    };

    renderChildForm = (index) => {
        const children = React.cloneElement(
            this.props.children,
            { 
                values: this.state.records.getIn([index, 'dynamic'], Immutable.List()),
                parentIndexes: this.props.parentIndexes.push(index),
                onValuesChange: (changedValues, allValues, parentIndexes) => this.onValuesChange(changedValues, allValues, parentIndexes)
            }
        );

        return (
            <div>
                <br />
                {children}
            </div>
        );
    };

    onValuesChange = (changedValues, allValues, index) => {
        let formValues = this.state.records;
        const firstChildIndex = index.first();
        const secondChildIndex = index.last();

        // updating the first child
        if (index.size === 1) {
            // the list of 脑电图检查结果 ordered from 0 to n
            const updatedValues = formatFormValues(Immutable.fromJS(allValues), this.props.firstLayerFields);

            if (!formValues.getIn([index.first(), 'dynamic'])) {
                formValues = formValues.setIn([index.first(), 'dynamic'], Immutable.List());
            }

            updatedValues.forEach((firstChildValues, firstChildIndex) => {
                formValues = formValues.setIn([index.first(), 'dynamic', firstChildIndex, 'general'], firstChildValues);
            })
        }
        // updating the second child
        if (index.size === 2) {
            console.log(formValues.toJS())
            // second child
            if (!formValues.getIn([index.first(), 'dynamic'])) {
                formValues = formValues.setIn([index.first(), 'dynamic'], Immutable.List());
            }

            if (!formValues.getIn([index.first(), 'dynamic', index.last(), 'dynamic'])) {
                formValues = formValues.setIn([index.first(), 'dynamic', index.last(), 'dynamic'], Immutable.List());
            }
            console.log(formValues.toJS())
            const updatedValues = formatFormValues(Immutable.fromJS(allValues), this.props.secondLayerFields);

            updatedValues.forEach((secondChildValues, secondChildIndex) => {
                formValues = formValues.setIn([index.first(), 'dynamic', index.last(), 'dynamic', secondChildIndex, 'general'], secondChildValues);
                // formValues = formValues.setIn([index.first(), 'dynamic', firstChildIndex, 'general'], updatedValues);
            })
            console.log(formValues.toJS())
        }
        
        this.setState({
            records: formValues
        })
        console.log(formValues.toJS())
    
    };

    onTabChange = activeKey => {
        console.log(activeKey)
        this.setState({ activeKey });
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
                <TabPane tab={`${this.props.title} ${index + 1}`} key={index}>
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
                        {this.renderChildForm(index)}
                    </Card>
                </TabPane>
            )).toArray();

            content = (
                <Tabs
                    onChange={this.onTabChange}
                    activeKey={this.state.activeKey}
                    tabBarExtraContent={
                        !this.props.isForFilters &&
                        <Button
                            type="primary"
                            icon="plus"
                            onClick={this.add}
                        >
                            {`添加${this.props.title}`}
                        </Button>
                    }
                >
                    {content}
                </Tabs>
            )
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
                {this.generateFormContent(colSpan)}
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
        props.onValuesChange(changedValues, allValues, props.parentIndexes)
    }
}

NestedOuterForm = Form.create({
    onValuesChange: onValuesChange,
})(NestedOuterForm)

NestedOuterForm.propTypes = {
    isForFilters: PropTypes.bool,
    onValuesChange: PropTypes.func,
    fields: PropTypes.instanceOf(Immutable.List),
    values: PropTypes.instanceOf(Immutable.List),
    columns: PropTypes.number,
    title: PropTypes.string,
    renderChildren: PropTypes.string,
    parentIndexes: PropTypes.instanceOf(Immutable.List),
};
NestedOuterForm.defaultProps = {
    isForFilters: false,
    onValuesChange: () => {},
    fields: Immutable.List([Immutable.Map()]),
    values: Immutable.List([Immutable.Map()]),
    columns: 3,
    title: '单项记录',
    renderChildren: 'all',
    parentIndexes: Immutable.List(),
};

export default NestedOuterForm;