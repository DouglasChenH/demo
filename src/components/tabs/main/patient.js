import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class Patient extends React.Component {
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
                this.setState({
                    values: Immutable.Map({
                        '病案号': id
                    }),
                });
                console.log(err);
            })
    };

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
                    name: '医疗机构',
                    type: 'text'
                },
                {
                    name: '组织机构代码',
                    type: 'text'
                },
                {
                    name: '医疗付费方式',
                    type: 'select',
                    options: ['现金', '医保'],
                },
            ],
            [
                {
                    name: '健康卡号',
                    type: 'text'
                },
                {
                    name: '第几次住院',
                    type: 'number'
                },
                {
                    name: '病案号',
                    type: 'text',
                    disabled: true,
                },
            ],
            [
                {
                    name: '姓名',
                    type: 'text',
                    validation: {
                        required: true,
                    },
                },
                {
                    name: '性别',
                    type: 'radio',
                    options: ['男', '女', ""],
                },
                {
                    name: '出生日期',
                    type: 'date',
                    validation: {
                        required: true,
                    },
                },
            ],
            [
                {
                    name: '国籍',
                    type: 'text'
                },
                {
                    name: '民族',
                    type: 'text',
                },
                {
                    name: '身份证号',
                    type: 'text',
                },
            ],
            [
                {
                    name: '新生儿出生体重（g）',
                    type: 'number',
                },
                {
                    name: '新生儿入院体重（g）',
                    type: 'number',
                },
                {
                    name: '年龄',
                    type: 'number',
                },
            ],
            [
                {
                    name: '出生地',
                    type: 'text'
                },
                {
                    name: '籍贯',
                    type: 'text',
                },
                {
                    name: '职业',
                    type: 'text',
                },
            ],
            [
                {
                    name: '现住址',
                    type: 'text'
                },
                {
                    name: '电话',
                    type: 'text',
                },
                {
                    name: '现住址邮编',
                    type: 'text',
                },
            ],
            [
                {
                    name: '户口地址',
                    type: 'text'
                },
                {
                    name: '户口邮编',
                    type: 'text',
                },
                {
                    name: '婚姻',
                    type: 'select',
                    options: ['未婚', '已婚', '丧偶'],
                },
            ],
            [
                {
                    name: '工作单位与地址',
                    type: 'text',
                },
                {
                    name: '单位电话',
                    type: 'text'
                },
                {
                    name: '单位邮编',
                    type: 'text',
                },
            ],
            [
                {
                    name: '联系人姓名',
                    type: 'text',
                },
                {
                    name: '联系人关系',
                    type: 'select',
                    options: ['直系亲属', '非直系亲属', '朋友'],
                },
                {
                    name: '联系人电话',
                    type: 'text',
                },
            ],
            [
                {
                    name: '联系人地址',
                    type: 'text',
                },
            ],
        ]);

        return fields;
    };

    render() {
        const { id, title, onValuesChange } = this.props;
        let { values, isLoading } = this.state;

        if (values) {
            values = values.set('病案号', id);
        }
        

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

Patient.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

Patient.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default Patient;