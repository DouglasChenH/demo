import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import moment from 'moment';
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";
import { showError } from '../../utils/notification';

export class AssessmentTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.List(Immutable.Map()),
            operationTime: moment(),
            birthday: moment(),
            isLoading: true,
            _rev: undefined,
        };
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        if (id) {
            fetchDataMixin(id, 'surgery_related_info', '手术相关信息')
                .then(doc => {
                    if (doc.data['手术日期'] === undefined) {
                        showError('请在手术相关信息表中输入手术日期')
                    }
                    else {
                        this.setState({
                            operationTime: moment(doc.data['手术日期']),
                        });
                    }
                })
                .catch(err => {
                    if (err.error === 'not_found') {
                        showError('请在手术相关信息表中输入手术日期')
                    }
                    console.log(err);
                })

            fetchDataMixin(id, 'general_table', '一般表格')
                .then(doc => {
                    if (doc.data['出生日期'] === undefined) {
                        showError('请在一般表格中输入出生日期')
                    }
                    else {
                        this.setState({
                            birthday: moment(doc.data['出生日期']),
                        });
                    }
                })
                .catch(err => {
                    if (err.error === 'not_found') {
                        showError('请在一般表格中输入出生日期')
                    }
                    console.log(err);
                })
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
    }

    handleSubmit = e => {
        e.preventDefault();
        const { id, path, title } = this.props;
        let prepData = this.form.prepSubmit();

        if (prepData) {
            let doc = {
                _id:`${path}:user_${id}`,
                data: prepData,
                type: 'dynamic',
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
                    name: '评估日期',
                    type: 'date',
                    bindings: [
                        { // result = latter - former
                            type: 'months',
                            latter: '评估日期',
                            former: this.state.operationTime,
                            result: '评估间隔（月）',
                        },
                        { // result = latter - former
                            type: 'months',
                            latter: '评估日期',
                            former: this.state.birthday,
                            result: '评估年龄（月）',
                        }
                    ],
                },
                {
                    name: '头围（cm）',
                    type: 'number',
                },
                {
                    name: '评估间隔（月）',
                    type: 'number',
                    // bindings: { // result = latter - former
                    //     type: 'months',
                    //     latter: '评估日期',
                    //     former: this.state.operationTime,
                    //     result: '评估间隔（月）',
                    // },
                    disabled: true,
                },
                {
                    name: '评估年龄（月）',
                    type: 'number',
                    // bindings: { // result = latter - former
                    //     type: 'months',
                    //     latter: '评估日期',
                    //     former: this.state.birthday,
                    //     result: '评估年龄（月）',
                    // },
                    disabled: true,
                },
                {
                    name: '异常',
                    type: 'radio',
                    options: ['是', '否']
                },
            ],
            [
                {
                    name: '大运动（发育年龄）',
                    type: 'number',
                },
                {
                    name: '个人社会（发育年龄）',
                    type: 'number',
                },
                {
                    name: '听力语言（发育年龄）',
                    type: 'number',
                },
                {
                    name: '手眼协调（发育年龄）',
                    type: 'number',
                },
                {
                    name: '操作表现（发育年龄）',
                    type: 'number',
                },
                {
                    name: '实际推理（发育年龄）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '大运动（百分位）',
                    type: 'number',
                },
                {
                    name: '个人社会（百分位）',
                    type: 'number',
                },
                {
                    name: '听力语言（百分位）',
                    type: 'number',
                },
                {
                    name: '手眼协调（百分位）',
                    type: 'number',
                },
                {
                    name: '操作表现（百分位）',
                    type: 'number',
                },
                {
                    name: '实际推理（百分位）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '大运动（GQ）',
                    type: 'number',
                },
                {
                    name: '个人社会（GQ）',
                    type: 'number',
                },
                {
                    name: '听力语言（GQ）',
                    type: 'number',
                },
                {
                    name: '手眼协调（GQ）',
                    type: 'number',
                },
                {
                    name: '操作表现（GQ）',
                    type: 'number',
                },
                {
                    name: '实际推理（GQ）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '备注',
                    type: 'text',
                },
            ]
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
                 <DynamicForm
                    wrappedComponentRef={(form) => this.form = form}
                    values={values}
                    fields={this.createFields()}
                    columns={6}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

AssessmentTable.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

AssessmentTable.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default AssessmentTable;