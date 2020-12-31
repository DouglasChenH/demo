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

export class NestedInnerForm extends React.Component {
    state = {
        records: Immutable.List([Immutable.Map()]),
        activeKey: '0',
    };

    componentDidMount() {
        if (this.props.values) {
            let values = this.props.values;

            values = values.size === 0 ? Immutable.List([Immutable.Map()]) : values;
            this.setState({
                records: values
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.values.size > 0 &&
            !prevProps.values.equals(this.props.values)) {
            let values = this.props.values;

            values = values.size === 0 ? Immutable.List([Immutable.Map()]) : values;
            this.setState({
                records: values
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
        }), () => {
            // this.setState({ activeKey: String(this.state.records.size - 1})
            // jump to the new added record
            // const recordForms = document.getElementsByClassName("single-record-form");
            // const lastRecordForm = recordForms[recordForms.length - 1];

            // lastRecordForm.setAttribute('tabindex', '-1');
            // lastRecordForm.focus();
            // lastRecordForm.removeAttribute('tabindex');
        });
    };

    remove = (index) => {
        this.setState(prevState => ({
            records: prevState.records.delete(index)
        }));
    };

    renderChildForm = (index) => {
        const { renderChildren } = this.props;

        if (renderChildren === 'none') {
            return null;
        }
  
        // if (renderChildren === 'all') {
        //     return (
        //         <div>
        //             <br />
        //             {children}
        //         </div>
        //     );
        // }
        if (renderChildren === 'conditional') {
            // handle special cases here
            const flagValue = this.props.form.getFieldValue(`脑电图癫痫[${index}]`);

            if (flagValue === '癫痫发作' || flagValue === '持续性癫痫') {
                console.log(this.state.records.toJS(), this.state.records.getIn([index, 'dynamic'], Immutable.List()).toJS())
                const children = React.cloneElement(
                    this.props.children,
                    { 
                        values: this.state.records.getIn([index, 'dynamic'], Immutable.List()),
                        parentIndexes: this.props.parentIndexes.push(index),
                        onValuesChange: this.props.onValuesChange,
                    }
                );

                return children;
            }
        }

        return null;
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

NestedInnerForm = Form.create({
    onValuesChange: onValuesChange,
})(NestedInnerForm)

NestedInnerForm.propTypes = {
    isForFilters: PropTypes.bool,
    onValuesChange: PropTypes.func,
    fields: PropTypes.instanceOf(Immutable.List),
    values: PropTypes.instanceOf(Immutable.List),
    columns: PropTypes.number,
    title: PropTypes.string,
    renderChildren: PropTypes.string,
    parentIndexes: PropTypes.instanceOf(Immutable.List),
};
NestedInnerForm.defaultProps = {
    isForFilters: false,
    onValuesChange: () => {},
    fields: Immutable.List([Immutable.Map()]),
    values: Immutable.List([Immutable.Map()]),
    columns: 3,
    title: '单项记录',
    renderChildren: 'none',
    parentIndexes: Immutable.List(),
};

export default NestedInnerForm;