import Immutable from 'immutable';
import moment from 'moment';
// import PropTypes from 'prop-types';
import React from 'react';
import Highlighter from 'react-highlight-words';
import exportToExcel from './utils/export_to_excel';
import { Link } from "react-router-dom";
import { showSuccess, showError } from './utils/notification';
import { DeleteButtonWithModal } from './generics/buttons';
import { Layout, Menu, Breadcrumb, Slider } from 'antd';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { db } from '../db/database';
import {
    Card,
    Divider,
    Table,
    Input,
    Modal,
    Form,
    Button,
    Icon,
    InputNumber,
    Collapse,
    Switch,
    Row,
    Col,
    Tag,
} from 'antd';
import { Filter } from './generics/filter';
import { extractPatientIDfromDocKey } from './utils/mixin';
import { SPECIAL_TIME_FIELDS_WITH_FORMATS } from './tabs/form_list';

const { Panel } = Collapse;
const { confirm } = Modal;
const { Content } = Layout;

export const PAGINATION_SETTINGS = {
    showSizeChanger: true,
    showQuickJumper: true,
    hideOnSinglePage: true,
    pageSizeOptions: ['10', '25', '50', '100'],
    // pageSize: 25,
};

function isFieldValueValid(value) {
    if (!value) {
        if (value === 0) {
            return true;
        }
        return false;
    }

    return true;
}
function isValueValid(value) {
    if (Immutable.List.isList(value)) {
        if (value.size === 2 &&
            (value.first() === null ||
            value.last() === null)) {
            return false;
        }
    }

    return true;
}

function parseValueToString(value, type, fieldName) {
    if (Immutable.List.isList(value)) {
        if (type.includes('date') || type.includes('time')) {
            value = value.map(data => {
                if (SPECIAL_TIME_FIELDS_WITH_FORMATS.includes(fieldName)) {
                    return  data.format('HH:mm:ss');
                }
                return data.format('YYYY-MM-DD HH:mm');
            });
            return value.toJS().join(' - ');
        }
        if (type === 'number') {
            return value.toJS().join(' - ');
        }
        if (type === 'radio') {
            // "" to " "
            return value.filter(select => select !== "").toJS().join(', ');
        }
        return value.toJS().join(', ');
    }

    return value;
}

function isValueInMap(mapData, fieldName, filterValue, type) {
    if (!mapData.has(fieldName)) {
        return false;
    }

    const formValue = mapData.get(fieldName);
    // text fields 
    if (type === 'text' || type === 'select') {
        return formValue.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (Immutable.List.isList(filterValue)) {
        // range values like dates, times, numbers
        if (filterValue.size === 2) {
            const min = filterValue.first();
            const max = filterValue.last();

            // time range
            if (type.includes('date') || type.includes('time')) {
                return min.isSameOrBefore(formValue) && max.isSameOrAfter(formValue);
            }
            // number range
            if (type === 'number') {
                return formValue >= min && formValue <= max;
            }
        }
        // multiple checkboxes
        if (type === 'radio') {
            return filterValue.includes(formValue);
        }
    }

    return false;
}

function isValueInDoc(doc, filterName, filterConfig) {
    const docData = doc.getIn(['doc', 'data']);
    const docType = doc.getIn(['doc', 'type']);
    const fieldName = filterConfig.get('key');
    const filterValue = filterConfig.get('value');
    const type = filterConfig.get('type');
    const subformKey = filterConfig.get('subformKey');

    if (docType === 'general') {
        return isValueInMap(docData, fieldName, filterValue, type);
    }
    if (docType === 'dynamic') {
        return docData.some(map => isValueInMap(map, fieldName, filterValue, type));
    }
    if (docType === 'mixed') {
        if (subformKey === 'general') {
            return isValueInMap(docData.get('general'), fieldName, filterValue, type);
        }
        return docData.get('dynamic', Immutable.List()).some(map => isValueInMap(map, fieldName, filterValue, type));
    }
    // "multi-dynamic": multiple dynamic forms
    if (docType === 'multi-dynamic') {
        return docData.get(subformKey, Immutable.List()).some(map => isValueInMap(map, fieldName, filterValue, type));
    }
    // "mixed-multi-dynamic"： mix of a general from and a multi-dynamic form
    if (docType === 'mixed-multi-dynamic') {
        if (subformKey === 'general') {
            return isValueInMap(docData.get('general'), fieldName, filterValue, type);
        }

        return docData.getIn(['dynamic', subformKey], Immutable.List()).some(map => isValueInMap(map, fieldName, filterValue, type));
    }
    // "nested": nested dynimic forms
    if (docType === 'nested') {
        return false;
       // return docData.some(map => isValueInMap(map, fieldName, filterValue, type));
    }
    // "files": upload/manage files
    if (docType === 'file') {
        return false;
    }
    return false;
}

const CreateUserForm = Form.create({ name: "user_form_in_modal" })(
    // eslint-disable-next-line
    class extends React.Component {
        validateFilenamePrefix = (rule, value, callback) => {
           const pattern = /[^a-zA-Z0-9_\u4e00-\u9fa5 （）()#+\-\.\"\']/g;

            if (pattern.test(value)) {
                callback(`请输入汉字，英文字母，数字，或者（()）#+-_'".`);
            }

            return callback();
        };

        render() {
            const { visible, confirmLoading, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;

            return (
                <Modal
                    visible={visible}
                    confirmLoading={confirmLoading}
                    title="添加新病案"
                    okText="添加"
                    cancekText="取消"
                    width={600}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form>
                        <Form.Item label="病案号">
                            {getFieldDecorator('id', {
                                initialValue: '',
                                rules: [
                                    { required: true, message: "请输入病案号!" },
                                    { validator: this.validateFilenamePrefix }
                                ],
                            })(
                                <Input
                                    placeholder="病案号"
                                    style={{ width: '100%' }}
                                />
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);

class CreatePatientBtn extends React.Component {
    state = {
        visible: false,
        confirmLoading: false,
    };

    showModal = () => {
        this.setState({ visible: true });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    handleUserId = async(id) => {
        const { form } = this.formRef.props;
        try {
            const doc = await db.get(`patient_info:user_${id}`);
            let that = this;

            confirm({
                title: '该病案已存在',
                content: '你想修改该已有病案么？',
                onOk() {
                    form.resetFields();
                    that.setState({ visible: false, confirmLoading: false });
                    that.props.history.push(`/patients/${id}/patient_info`);
                },
                okText: "修改",
                cancekText:"取消",
                onCancel() {
                    // form.resetFields();
                    that.setState({ confirmLoading: false });
                },
            });
            
        } catch (err) {
            console.log(err);
            if (err.error === 'not_found') {
                showSuccess(`病案号（${id}）创建成功`);
                form.resetFields();
                this.setState({ visible: false, confirmLoading: false });
                this.props.history.push(`/patients/${id}/patient_info`);
            }
        }
    };

    handleCreate = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            this.setState({ confirmLoading: true });
            this.handleUserId(values.id);
        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    render() {
        return (
            <div>
                <Button
                    type="primary"
                    icon="plus"
                    onClick={this.showModal}
                >
                    添加新病案
                </Button>
                <CreateUserForm
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.visible}
                    confirmLoading={this.state.confirmLoading}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                />
            </div>
        );
    }
}

export class PatientTable extends React.Component {
  constructor(props) {
        super(props);
 
        this.state = {
            filters: Immutable.fromJS({
                '术后48小时连续血管活性药记录': {
                    '多巴胺 （mcg/kg/min） - ICU时间点': {
                        formPath: "vasoactive_drugs_record",
                        key: "ICU时间点",
                        subformKey: "多巴胺 （mcg/kg/min）",
                        type: "number",
                        value: [2, 2],
                    }
                }
            }),
            filteredPatientDocs: Immutable.Map(),
            allDocs: Immutable.List(),
            filteredDocs: Immutable.List(),
            filteredForms: Immutable.List(),
            searchText: '',
            searchedColumn: '',
            patients: Immutable.List(),
            isLoading: true,
            isFilterOn: true,
        };
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState) {
        const { isFilterOn, filters, allDocs } = this.state;

        console.log(filters.toJS())
        if (isFilterOn) {
            if (!prevState.filters.equals(filters) ||
                !prevState.allDocs.equals(allDocs)) {
                this.applyFiltersToExtractDocs();
            }
        }
    }

    loadData = async() => {
        try {
            var result = await db.allDocs({
                include_docs: true,
            });

            console.log(result)
            // let userData;
            const patientsData = result.rows
                .filter(row => row.key.includes('patient_info'))
                .map(row => row.doc);

            console.log(patientsData, result)
            this.setState({
                allDocs: Immutable.fromJS(result.rows),
                patients: Immutable.fromJS(patientsData),
                isLoading: false,
            });
        } catch (err) {
            this.setState({
                isLoading: false,
            });
            showError(`载入数据库失败: ${err.message}`);
            console.log(err);
        }
    };

    applyFiltersToExtractDocs = () => {
        const { filters, patients, allDocs } = this.state;

        let filteredForms = Immutable.List();
        let formPath;

        if (filters.size > 0) {
            filters.forEach((filterConfigs, formName) => {
                if (filterConfigs.first()) {
                    formPath = filterConfigs.first().get('formPath');
                
                    if (!filteredForms.has(formPath)) {
                        filteredForms = filteredForms.push(formPath); 
                    }
                }
            });
        }

        console.log(filteredForms.toJS())
        // filter out the matched form which includes this value
        const matchedDocs = allDocs
            .filter(record => 
                // filter out records of these forms
                filteredForms.some(form => record.get('key').startsWith(form))
            )
        const matchedRecords = matchedDocs
            .filter(record => 
                // pass filters for every form specified
                filters.every((filterConfigs, formName) => {
                    if (filterConfigs.first()) {
                        const formPath = filterConfigs.first().get('formPath');

                        // record matches the filter
                        if (record.get('key').startsWith(formPath)) {
                            return filterConfigs.every((filterConfig, filterName) => 
                                isValueInDoc(record, filterName, filterConfig)
                            );  
                        }
                        // unrelevant records
                        return true;  
                    }
                    // no filter
                    return true;
                }
            ))
        
        let matchedRecordsToPatients = Immutable.Map();
        let patientID;
        let doc;

        matchedRecords.forEach(record => {
            patientID = extractPatientIDfromDocKey(record.get('key'));
            doc = record.get('doc');

            if (!matchedRecordsToPatients.has(patientID)) {
                matchedRecordsToPatients = matchedRecordsToPatients
                    .set(patientID, Immutable.List([doc]));
            }
            else {
                matchedRecordsToPatients = matchedRecordsToPatients
                    .update(patientID, value => value.push(doc));
            }
        })

        const filteredFormsSize = filteredForms.size;
        const isPatientInfoIncluded = filteredForms.has('patient_info');
        let patientInfoDoc = Immutable.Map();
        let filteredPatientDocs = Immutable.Map();
        
        
        matchedRecordsToPatients.forEach((records, patientID) => {
            if (records.size === filteredFormsSize) {
                let catgorizedDocs = Immutable.Map();
                
                records.forEach(doc => {
                    if (catgorizedDocs.has(doc.get('type'))) {
                        catgorizedDocs = catgorizedDocs.update(doc.get('type'), docs => docs.push(doc));
                    }
                    else {
                        catgorizedDocs = catgorizedDocs.set(doc.get('type'), Immutable.List([doc]));
                    }
                })

                filteredPatientDocs = filteredPatientDocs.set(patientID, catgorizedDocs);

                patientInfoDoc = patients.find(patient => patient.getIn(['data', '病案号']) === patientID);
            
                if (!isPatientInfoIncluded && patientInfoDoc) {
                    let generalDocs = filteredPatientDocs.getIn([patientID, 'general'], Immutable.List());
                    
                    generalDocs = generalDocs.unshift(patientInfoDoc);
                    filteredPatientDocs = filteredPatientDocs.setIn([patientID, 'general'], generalDocs);
                }
            }
        })

        console.log(filteredPatientDocs.toJS())
        this.setState({
            filteredForms,
            filteredPatientDocs,
        });
    };

    deletePatient = async (id, name) => {
        const patientDocs = this.state.allDocs
            .filter(doc => doc.get('id', '').endsWith(`:user_${id}`))
            .map(doc => Immutable.Map({
                _id: doc.get('id'),
                _rev: doc.getIn(['value', 'rev']),
                _deleted: true
            }))
            .toJS();
        
        try {
            var result = await db.bulkDocs(patientDocs);

            const index = this.state.patients.findIndex(patient => patient.getIn(['data', '病案号']) === id);
            
            this.setState((prevState) => ({
                patients: prevState.patients.delete(index),
                allDocs: prevState.allDocs.filter(doc => !doc.get('id', '').endsWith(`:user_${id}`))
            }));
            showSuccess(`病案（${name}）已删除`);
        } catch (err) {
            showError(`病案（${name}）删除失败: ${err.message}`);
            console.log(err);
        }
    };

    getColumnSearchProps = (dataIndex, name) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                      this.searchInput = node;
                    }}
                    placeholder={`搜索 ${name}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <div>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        icon="search"
                        size="small"
                        style={{ width: 90 }}
                    >
                        搜索
                    </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        重置
                    </Button>
                </div>
            </div>
        ),
        filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({
            searchText: ''
        });
    };

    exportToExcel = (id) => {
        // const { filteredPatientDocs } = this.state;
        // let docKey;
        // let patientID;

        // const singlePatientData = this.state.allDocs.filter(doc => {
        //     docKey = doc.get('key'); // like "admission:user_2"
        //     patientID = extractPatientIDfromDocKey(docKey);

        //     return patientID === String(id);
        // })

        // return exportToExcel(singlePatientData);
        exportToExcel(this.state.filteredPatientDocs.get(id));
    };

    exportAllToExcel = () => {
        exportToExcel(this.state.filteredPatientDocs);

        // const { isFilterOn, filters, filteredForms, filteredPatientDocs } = this.state;
        // let excelData;

        // if (!isFilterOn || filters.size === 0) {
        //     return;
        // }
        // else {
        //     exportToExcel(filteredPatientDocs);
        //     // const matchedDocs = this.applyFiltersToExtractDocs();
        //     // const matchedPatientIDs = matchedDocs.map(record => extractPatientIDfromDocKey(record.get('key')));
        //     // let docKey;
        //     // let patientID;

        //     // excelData = allDocs.filter(doc => {
        //     //     docKey = doc.get('key'); // like "admission:user_2"
        //     //     patientID = extractPatientIDfromDocKey(docKey);
        //     //     return matchedPatientIDs.includes(patientID);
        //     // });
        // }
    };

    loadTableData = () => {
        const { isFilterOn, filters, patients, filteredPatientDocs } = this.state;
        let patientsData;

        if (!isFilterOn || filters.size === 0 || filters.every(filter => filter.size === 0)) {
            patientsData = patients;
        }
        else {
            const filteredPatientIDs = filteredPatientDocs.keySeq();

            patientsData = patients.filter(patient => filteredPatientIDs.includes(patient.getIn(['data', '病案号'])));
        }

        return patientsData.map((data, index) => data.get('data').set('key', index)).toJS();
    };

    // subformKey is the sub form title
    // key is the changed form field
    onFilterValuesChange = (formName, formPath, key, value, fieldType, subformKey = undefined) => {
        const filterName = (subformKey && subformKey !== key && subformKey !== 'general') ? `${subformKey} - ${key}` : key;

        if (fieldType === 'text' && !value) {
            this.setState(prevState => ({
                filters: prevState.filters.deleteIn([formName, filterName])
            }));
            return;
        }
        if (Array.isArray(value)) {
            value = Immutable.fromJS(value);

            if (fieldType === 'number' || fieldType.includes('date') || fieldType.includes('time')) {
                const isEverySingleValueValid = value.every(singleValue => isFieldValueValid(singleValue));
                // meaningless value
                if (!isEverySingleValueValid) {
                    this.setState(prevState => ({
                        filters: prevState.filters.deleteIn([formName, filterName])
                    }));
                    return;
                }

                // sort min/max
                value = value.sort((a, b) => a - b);
            }
            if (fieldType === 'radio') {
                if (value.every(singleValue => singleValue === '')) {
                    this.setState(prevState => ({
                        filters: prevState.filters.deleteIn([formName, filterName])
                    }));
                    return;
                }
            }
        }

        if (isValueValid(value)) {
            this.setState(prevState => ({
                filters: prevState.filters.setIn([formName, filterName], Immutable.Map({
                    key: key,
                    value: value,
                    type: fieldType,
                    formPath: formPath,
                    subformKey: subformKey,
                }))
            }));
        }
    };

    handleFilterTagClose = (formName, filterName) => {
        let { filters } = this.state;

        filters = filters.deleteIn([formName, filterName]);
        
        if (filters.get(formName, Immutable.List()).size === 0) {
            filters = filters.delete(formName);
        }

        this.setState({
            filters: filters
        });
    };

    generateFilterTags = () => {
        const filtersObj = this.state.filters.toJS();
        let filterValues;
        let filterValue;

        const children = Object.keys(filtersObj).map(formName => {
            filterValues = filtersObj[formName];

            return (
                <div key={formName}>
                    {`${formName} : `}
                    {Object.keys(filterValues).length === 0 
                        ? '---'
                        : Object.keys(filterValues).map(filterName => {
                        filterValue = filterValues[filterName];

                        if (filterValue) {
                            return (
                                <Tag
                                    closable
                                    key={filterName}
                                    onClose={() => this.handleFilterTagClose(formName, filterName)}
                                >
                                    {`${filterName}: ${parseValueToString(filterValue.value, filterValue.type, filterValue.key)}`}
                                </Tag>
                            )
                        }
                        else {
                            return null;
                        }
                    })}
                </div>
            );
        })
        return (
            <div style={{ marginBottom: '10px' }}>
                {children}
            </div>
        );
    };

    initColumns = () => {
        const columns = [
            {
                title: '病案号',
                dataIndex: '病案号',
                key: '病案号',
                width: '20%',
                ...this.getColumnSearchProps('病案号', '病案号'),
                render: (text, record) => (
                  <Link
                      to={`/patients/${record['病案号']}/patient_info`}
                  >
                      {text}
                  </Link>
              )
            },
            {
              title: '患者姓名',
              dataIndex: '患者姓名',
              key: '患者姓名',
              width: '30%',
              ...this.getColumnSearchProps('患者姓名', '患者姓名'),
              render: (text, record) => (
                  <Link
                      to={`/patients/${record['病案号']}/patient_info`}
                  >
                      {text}
                  </Link>
              )
            },
            {
              title: '性别',
              dataIndex: '性别',
              key: '性别',
              filters: [
                {
                  text: '男',
                  value: '男',
                },
                {
                  text: '女',
                  value: '女',
                },
                {
                  text: '保密',
                  value: '',
                },
              ],
              onFilter: (value, record) => record.gender.indexOf(value) === 0,
              render: (text, record) => (
                  text === '' ? '保密' : text
              )
            },
            {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                width: 120,
                render: (text, record) => (
                    <span>
                        <DeleteButtonWithModal
                            iconOnly
                            modalText="该病案所有数据将被删除"
                            handleConfirmClick={() => this.deletePatient(record['病案号'], record['姓名'])}
                        />
                        {this.state.filteredForms.size > 0 &&
                            <span>
                                <Divider type="vertical" />
                                <a onClick={e => this.exportToExcel(record['病案号'])}>
                                    <FaCloudDownloadAlt style={{ fontSize: '32px', verticalAlign: 'middle' }}/>
                                </a>
                            </span>
                        }
                    </span>
                )
            }
        ];

        return columns;
    };

    render() {
        return (
            <Content style={{ padding: '60px 60px', background: '#fff' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>
                        <Link to="/">主页</Link>
                    </Breadcrumb.Item>
                </Breadcrumb>
                
                <div style={{ marginLeft: 'auto', marginRight: 'auto',  }}>
                    <Row gutter={24}>
                        {this.state.isFilterOn &&
                            <Col span={12}>
                                <Filter onFilterValuesChange={this.onFilterValuesChange} />
                            </Col>
                        }
                        <Col span={this.state.isFilterOn ? 12 : 24}>
                            <div style={{ marginBottom: '10px', marginTop: '10px' }}>
                                <label>高级过滤</label>
                                <Switch 
                                    checkedChildren="开"
                                    unCheckedChildren="关"
                                    checked={this.state.isFilterOn}
                                    onChange={checked => this.setState({
                                        isFilterOn: checked,
                                        filters: Immutable.Map()
                                    })}
                                    style={{ marginLeft: '10px'}}
                                />
                            </div>
                            {this.generateFilterTags()}
                            <div className="button-row-space-between">
                                <CreatePatientBtn
                                    history={this.props.history}
                                />
                                {this.state.filteredForms.size > 0 &&
                                    <Button
                                        type="primary"
                                        icon="download"
                                        onClick={e => this.exportAllToExcel()}
                                    >
                                        下载EXCEL
                                    </Button>
                                }
                            </div>
                            <Table
                                columns={this.initColumns()}
                                dataSource={this.loadTableData()}
                                pagination={PAGINATION_SETTINGS}
                                loading={this.state.isLoading}
                            />
                        </Col>
                    </Row>
                </div>
            </Content>
        );
    }
}

export default PatientTable;