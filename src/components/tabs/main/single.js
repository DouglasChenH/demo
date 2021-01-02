import Immutable from "immutable";
import moment from 'moment';
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import {
    Form,
    Button,
    Input,
    Select,
    DatePicker,
    TimePicker,
    Radio,
    InputNumber,
    Row,
    Col,
    Card,
    Upload,
    Icon,
    Divider,
    BackTop,
} from "antd";
import { FaRegTrashAlt } from 'react-icons/fa';
import { showSuccess, showError } from '../../utils/notification';
import { DeleteButtonWithModal, UpdatingOverlay } from '../../generics';

const { Option } = Select;

export class CoreConfigFormB extends React.Component {
    normFile = e => {
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList;
    };

    render() {
        const { records, form, isEditable } = this.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: { span: 6, offset: 4 },
            wrapperCol: { span: 8 },
        };

        return (
            <Form
                layout="vertical"
                // {...formItemLayout}
                labelAlign="left"
            >   
                <Card
                    title="分析结果"
                    extra={
                        <Button className="btn btn-danger">
                            <FaRegTrashAlt className="react-icons" />
                        </Button>
                    }
                >
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="一阶段分析结果" extra="any file/demo">
                                {getFieldDecorator('period_1_report', {
                                    valuePropName: 'fileList',
                                    getValueFromEvent: this.normFile,
                                    rules: [
                                        {
                                            required: true,
                                            message: "请上传一阶段分析结果!"
                                        }
                                    ]
                                })(
                                    <Upload name="logo" action="/upload.do" listType="picture">
                                      <Button>
                                        <Icon type="upload" /> Click to upload
                                      </Button>
                                    </Upload>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="二阶段分析结果" extra="any file/demo">
                                {getFieldDecorator('period_2_report', {
                                    valuePropName: 'fileList',
                                    getValueFromEvent: this.normFile,
                                    rules: [
                                        {
                                            required: true,
                                            message: "请上传二阶段分析结果!"
                                        }
                                    ]
                                })(
                                    <Upload name="logo" action="/upload.do" listType="picture" >
                                      <Button>
                                        <Icon type="upload" /> Click to upload
                                      </Button>
                                    </Upload>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        );
    }
}

CoreConfigFormB = Form.create({ name: "core_config_form_B" })(CoreConfigFormB)

export class CoreConfigForm extends React.Component {
    getValidateStatus = (field, index) => {
        const startTime = this.props.form.getFieldValue(`start_time[${index}]`);
        const endTime = this.props.form.getFieldValue(`end_time[${index}]`);
         // console.log(startTime, endTime)
        if (field.includes('start_time') && startTime === null) {
            return 'error';
        }
        if (field.includes('end_time') && endTime === null) {
            return 'error';
        }
        if (startTime && startTime !== null && endTime && endTime !== null) {
            if (field.includes('start_time')) {
                return startTime.isSameOrAfter(endTime) ? "error" : null;
            }
            else {
                return endTime.isSameOrBefore(startTime) ? "error" : null;
            }
        }
        
        return null;
    };

    getFeedback = (field, index) => {
        const startTime = this.props.form.getFieldValue(`start_time[${index}]`);
        const endTime = this.props.form.getFieldValue(`end_time[${index}]`);

        if (field.includes('start_time')) {
            if (startTime === null) {
                return "请输入开始时间!"
            }
            if (startTime && startTime !== null && endTime && endTime !== null) {
                if (startTime.isSameOrAfter(endTime)) {
                    return "开始时间应该早于结束时间！";
                }
            }
        }
        if (field.includes('end_time')) {
            if (startTime && startTime !== null && endTime && endTime !== null) {
                if (endTime.isSameOrBefore(startTime)) {
                    return "结束时间应该迟于开始时间！";
                }
            }
            if (endTime === null) {
                return "请输入结束时间!"
            }
        }

        return null;
    };

    handleStartTimeChange = (startTime, index) => {
        const endTime = this.props.form.getFieldValue(`end_time[${index}]`);

        if (startTime && endTime && endTime.isAfter(startTime)) {
            this.props.form.setFieldsValue({
              [`period[${index}]`]: endTime.diff(startTime, 'seconds') // 1
            });
        }
        else {
            this.props.form.setFieldsValue({
                [`period[${index}]`]: null
            });
        }
    };

    handleEndTimeChange = (endTime, index) => {
        const startTime = this.props.form.getFieldValue(`start_time[${index}]`);

        if (startTime && endTime && endTime.isAfter(startTime)) {
            this.props.form.setFieldsValue({
                [`period[${index}]`]: endTime.diff(startTime, 'seconds') // 1
            });
        }
        else {
            this.props.form.setFieldsValue({
                [`period[${index}]`]: null
            });
        }
    };

    render() {
        const { records, form, isEditable } = this.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: { span: 6, offset: 4 },
            wrapperCol: { span: 8 },
        };

        return (
                <Form
                    layout="vertical"
                    // {...formItemLayout}
                    labelAlign="left"
                >   
                    <Form.Item>
                        <div className="button-row-right-w-bottom-margin">
                            <Button
                                type="primary"
                                icon="plus"
                                onClick={this.props.add}
                            >
                                添加单项记录
                            </Button>
                        </div>
                    </Form.Item>
                    {this.props.records.map((record, index) => 
                        <div key={index}>
                            <Card
                                title={`单项记录 ${index + 1}`}
                                className="single-A-record-form"
                                extra={
                                    <DeleteButtonWithModal
                                        iconOnly
                                        modalText="该单项记录将被删除."
                                        handleConfirmClick={() => this.props.remove(index)}
                                    />
                                }
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item label="次数">
                                            {getFieldDecorator(`times[${index}]`, {
                                                initialValue: record.get("times", null),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入次数!"
                                                    }
                                                ]
                                            })(
                                                <InputNumber disabled={!isEditable} style={{ width: '100%'}}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="第几次">
                                            {getFieldDecorator(`time[${index}]`, {
                                                initialValue: record.get("time", null),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入这是第几次!"
                                                    }
                                                ]
                                            })(
                                                <InputNumber disabled={!isEditable} style={{ width: '100%'}} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item
                                            label="时间点开始"
                                            validateStatus={this.getValidateStatus(`start_time[${index}]`, index)}
                                            help={this.getFeedback(`start_time[${index}]`, index)}
                                        >
                                            {getFieldDecorator(`start_time[${index}]`, {
                                                initialValue: record.get("start_time", null),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入开始时间!"
                                                    }
                                                ]
                                            })(
                                                <TimePicker
                                                    onChange={(value) => this.handleStartTimeChange(value, index)}
                                                    allowClear={false}
                                                    style={{ width: '100%'}}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            label="时间点结束"
                                            validateStatus={this.getValidateStatus(`end_time[${index}]`, index)}
                                            help={this.getFeedback(`end_time[${index}]`, index)}
                                        >
                                            {getFieldDecorator(`end_time[${index}]`, {
                                                initialValue: record.get("end_time", null),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入结束时间!"
                                                    }
                                                ]
                                            })(
                                                <TimePicker
                                                    onChange={(value) => this.handleEndTimeChange(value, index)}
                                                    allowClear={false}
                                                    style={{ width: '100%'}}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="持续（秒）" help={'基于起始时间自动计算'}>
                                            {getFieldDecorator(`period[${index}]`, {
                                                initialValue: record.get("period", null),
                                                // rules: [
                                                //     {
                                                //         required: true,
                                                //         message: "请输入时长!"
                                                //     }
                                                // ]
                                            })(
                                                <InputNumber disabled style={{ width: '100%'}}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item label="周期">
                                            {getFieldDecorator(`cycle[${index}]`, {
                                                initialValue: record.get("cycle", null),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入周期!"
                                                    }
                                                ]
                                            })(
                                                <InputNumber style={{ width: '100%'}}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="间隔时间（秒）">
                                            {getFieldDecorator(`break[${index}]`, {
                                                initialValue: record.get("break", null),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入间隔时间!"
                                                    }
                                                ]
                                            })(
                                                <InputNumber style={{ width: '100%'}}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="起源">
                                            {getFieldDecorator(`origin[${index}]`, {
                                                initialValue: record.get("origin", ""),
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入起源!"
                                                    }
                                                ]
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item label="备注">
                                            {getFieldDecorator(`comment[${index}]`, {
                                                initialValue: record.get("备注", ""),
                                            })(
                                                <Input.TextArea disabled={!isEditable} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                            <Divider />
                        </div>
                    ).toArray()}
                    {this.props.records.size > 0 &&
                        <Form.Item>
                            <div className="button-row-right-w-bottom-margin">
                                <Button
                                    type="primary"
                                    icon="plus"
                                    onClick={this.props.add}
                                >
                                    添加单项记录
                                </Button>
                            </div>
                        </Form.Item>
                    }
                </Form>
            
        );
    }
}

CoreConfigForm = Form.create({})(CoreConfigForm)

export class SingleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            records: Immutable.List([Immutable.Map()]),
            isLoading: true,
            isSubmitting: false,
            type: 1,
            _rev: undefined,
        };
    }

    componentDidMount() {
        this.fetchData(this.props.id);
    }

    fetchData = async(id) => {
        try {
            var doc = await this.props.db.get(`singleA:user_${id}`);

            let records = Immutable.fromJS(doc.records);
            records = records.map(config => 
                config.set('start_time', moment(config.get('start_time'), 'HH:mm:ss'))
                    .set('end_time', moment(config.get('end_time'), 'HH:mm:ss'))
            );

            this.setState({
                records: records,
                _rev: doc._rev,
                isLoading: false,
            });
        } catch (err) {
            console.log(err);
            this.setState({
                isLoading: false,
            });
            if (err.error === 'not_found') {
            }
            else {
                showError(`用户（${id}）单项记录 A 载入失败: ${err.message}`);
            }
        }
    };

    submitData = async (doc) => {
        this.setState({
            isSubmitting: true,
        });

        try {
            var response = await this.props.db.put(doc);
            this.setState({
                _rev: response.rev,
                isSubmitting: false,
            });
            showSuccess(`用户（${this.props.id}）单项记录 A 已更新`);
            
            // this.props.history.push(`/`);
        } catch (err) {
            console.log(err);
            this.setState({
                isSubmitting: false,
            });
            showError(`用户（${this.props.id}）单项记录 A 更新失败`);
        }
    };

    add = () => {
        this.setState(prevState => ({
            records: prevState.records.push(Immutable.Map())
        }), () => {
            // jump to the new added record
            const recordForms = document.getElementsByClassName("single-A-record-form");
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
    }

    handleSubmit = e => {
        e.preventDefault();

        this.formRef.validateFields((err, values) => {
            if (err) {
                return;
            }

            // an array of record
            const records = values.times.map((value, index) => ({
                times: values.times[index],
                time: values.time[index],
                period: values.period[index],
                cycle: values.cycle[index],
                break: values.break[index],
                origin: values.origin[index],
                start_time: values.start_time[index].format('HH:mm:ss'),
                end_time: values.end_time[index].format('HH:mm:ss'),
                comment: values.comment[index]
            }));
            

            let isEdit = false;
            let doc = {
                _id: `singleA:user_${this.props.id}`,
                records: records,
            };

            if (this.state._rev) {
                doc._rev = this.state._rev;
            }

            this.submitData(doc);
        });
    };

    render() {
        const { records, isLoading } = this.state;
        const cancelLink = '/';
        let content = (
            <UpdatingOverlay />
        );

        if (!isLoading) {
            content = this.state.type === 1
                ?
                    <CoreConfigForm
                        ref={formRef => {this.formRef = formRef;}}
                        records={records}
                        isEditable={this.props.isEditable}
                        add={this.add}
                        remove={this.remove}
                    />
                : 
                    <CoreConfigFormB
                        ref={formRef => {this.formRefB = formRef;}}
                        records={records}
                        isEditable={this.props.isEditable}
                    />           
        }
       
        return (
            <div>
                <div className="button-row-space-between">
                    <Link to={cancelLink}>
                        {'< 回到用户列表'}
                    </Link>
                    {this.props.isEditable &&
                        <Button
                            className="btn btn-default"
                            type="primary"
                            onClick={this.handleSubmit}
                            loading={this.state.isSubmitting}
                            disabled={!this.props.isEditable}
                        >
                            Save
                        </Button>
                    }
                </div>
                <Form layout="vertical">
                    <Form.Item
                        label="形式"
                    >
                        <Radio.Group onChange={e => this.setState({ type: e.target.value})} value={this.state.type}>
                            <Radio value={1}>A</Radio>
                            <Radio value={2}>B</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
                <hr />
                {content}
                     
                <br />
                <BackTop />
                <div className="button-row-space-between">
                    {this.props.isEditable &&
                        <Button
                            className="btn btn-default"
                            id="singleBottomBtn"
                            type="primary"
                            onClick={this.handleSubmit}
                            loading={this.state.isSubmitting}
                            disabled={!this.props.isEditable}
                        >
                            Save
                        </Button>
                    }
                </div>
            </div>
        );
    }
}

SingleForm.propTypes = {
    isEditable: PropTypes.bool
};

SingleForm.defaultProps = {
    isEditable: true
};

export default SingleForm;