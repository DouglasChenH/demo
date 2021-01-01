import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm, NestedForm } from "../../generics";
import { NestedOuterForm, NestedInnerForm } from '../../generics/nested_form/index';

export class NewbornEEG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.List([Immutable.Map()]),
            isLoading: true,
            _rev: undefined,
        };
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        fetchDataMixin(id, path, title)
            .then(doc => {
                const values = Immutable.fromJS(doc.data)
                        .map((outerFormValue, key) => {
                            let value = outerFormValue
                                .set('general', formatRawDocData(
                                    outerFormValue.get('general', Immutable.Map())
                                ));

                            if (value.get('dynamic')) {
                                value.get('dynamic').forEach((firstDynamicValue, firstKey) => {
                                    if (firstDynamicValue.get('dynamic')) {
                                        firstDynamicValue.get('dynamic').forEach((secondDynamicValue, secondKey) => {
                                            value = value.setIn(['dynamic', firstKey, 'dynamic', secondKey, 'general'], formatRawDocData(
                                                secondDynamicValue.get('general', Immutable.Map())
                                            ));
                                        })
                                    }
                                })
                            }
                            
                            return value;
                        });
                this.setState({
                    values: values,
                    _rev: doc._rev,
                });
            })
            .catch(err => {
                console.log(err);
            })
    }

    handleSubmit = e => {
        e.preventDefault();
        const { id, path, title } = this.props;
        let prepData = this.form.prepSubmit();

        if (prepData) {
            let doc = {
                _id:`${path}:user_${id}`,
                data: prepData,
                type: 'nested',
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

    createEEGFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '胎龄（GA）',
                    type: 'text',
                },
                {
                    name: '矫正胎龄（PMA）',
                    type: 'text',
                },
                {
                    name: '检查日期',
                    type: 'date',
                },
                {
                    name: '术前/术后',
                    type: 'radio',
                    options: [
                        "术前",
                        "术后",
                    ],
                },
                {
                    name: '开始时间',
                    type: 'time'
                }
            ]
        ]);

        return fields;
    };

    createResultFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '脑电图时间段',
                    type: 'text',
                },
                {
                    name: 'EEG背景连续性',
                    type: 'radio',
                    options: [
                        "正常连续",
                        "正常不连续",
                        "不连续",
                        "过度不连续",
                        "爆发抑制",
                        ""
                    ],
                },
                {
                    name: '背景波左右对称性',
                    type: 'radio',
                    options: [
                        "对称",
                        "不对称",
                        ""
                    ],
                },
            ],
            [
                {
                    name: '背景波左右同步性',
                    type: 'radio',
                    options: [
                        "同步",
                        "不同步",
                        ""
                    ],
                },
                {
                    name: '背景波电压',
                    type: 'radio',
                    options: [
                        "正常",
                        "边缘",
                        "异常（低电压）",
                        "异常（无脑电活动）",
                        ""
                    ],
                },
                {
                    name: '背景波变化性',
                    type: 'radio',
                    options: [
                        "是",
                        "否",
                        ""
                    ],
                },
            ],
            [
                {
                    name: '背景波反应性',
                    type: 'radio',
                    options: [
                        "是",
                        "否",
                        ""
                    ],
                },
                {
                    name: '背景波不成熟',
                    type: 'radio',
                    options: [
                        "是",
                        "否",
                        ""
                    ],
                },
                {
                    name: '清醒阶段波形',
                    type: 'radio',
                    options: [
                        "连续",
                        "交替",
                        "非连续",
                        "过度非连续",
                        ""
                    ],
                },
            ],
            [
                {
                    name: '睡眠阶段波形',
                    type: 'radio',
                    options: [
                        "连续",
                        "交替",
                        "非连续",
                        "过度非连续",
                        ""
                    ],
                },
                {
                    name: '仅有清醒阶段',
                    type: 'radio',
                    options: [
                        "是",
                        "否",
                        ""
                    ],
                },
                {
                    name: '无清醒-睡眠周期',
                    type: 'radio',
                    options: [
                        "是",
                        "否",
                        ""
                    ],
                },
            ],
            [
                {
                    name: '暴发间隔时间（秒）',
                    type: 'number',
                },
                {
                    name: '爆发时间（秒）',
                    type: 'number',
                },
                {
                    name: '脑电图癫痫',
                    type: 'radio',
                    options: [
                        "无",
                        "癫痫发作",
                        "持续性癫痫",
                        ""
                    ],
                },
            ],
            [
                {
                    name: 'aEEG（C3-C4）（㎶）',
                    type: 'number',
                },
                {
                    name: '尖波数量',
                    type: 'radio',
                    options: [
                        "1",
                        "2",
                        "3",
                        "4",
                        ""
                    ],
                },
                {
                    name: '尖波出现位置',
                    type: 'text',
                },
            ],
            [
                {
                    name: 'Delta刷',
                    type: 'radio',
                    options: [
                        "1",
                        "2",
                        "3",
                        "4",
                        ""
                    ],
                },
                {
                    name: 'Delta刷出现位置',
                    type: 'text',
                },
            ],
            [
                {
                    name: '备注',
                    type: 'text',
                },
            ],
        ]);

        return fields;
    };

    createFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '癫痫发作形式',
                    type: 'radio',
                    options: [
                        "临床发作",
                        "临床下发作",
                    ],
                },
                {
                    name: '总次数',
                    type: 'number',
                },
                {
                    name: '第几次发作',
                    type: 'number',
                },
            ],
            [
                {
                    name: '时间点',
                    type: 'time',
                },
                {
                    name: '持续时间（秒）',
                    type: 'number',
                },
                {
                    name: '类型',
                    type: 'radio',
                    options: [
                        "周期性",
                        "持续性",
                    ],
                },
            ],
            [
                {
                    name: '次数（一个周期）',
                    type: 'number',
                },
                {
                    name: '间隔时间（秒）',
                    type: 'number',
                },
                {
                    name: '起源区',
                    type: 'text',
                },
            ],
            [
                {
                    name: '泛化',
                    type: 'text',
                },
                {
                    name: '用药 ',
                    type: 'radio',
                    options: [
                        "是",
                        "否",
                    ],
                },
                {
                    name: '用药后是否抑制',
                    type: 'radio',
                    options: [
                        "是",
                        "否"
                    ],
                },
            ],
            [
                {
                    name: '抑制所用时间（秒）',
                    type: 'number',
                },
            ],
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
                <NestedOuterForm
                    wrappedComponentRef={(form) => this.form = form}
                    values={values}
                    fields={this.createEEGFields()}
                    firstLayerFields={this.createResultFields()}
                    secondLayerFields={this.createFields()}
                    columns={5}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                    title="新生儿脑电图检查基本信息"
                >   
                    <NestedInnerForm
                        fields={this.createResultFields()}
                        columns={3}
                        isForFilters={!id}
                        onValuesChange={onValuesChange}
                        title="脑电图检查结果"
                        renderChildren={'conditional'}
                    >   
                        <NestedInnerForm
                            layer={2}
                            fields={this.createFields()}
                            columns={3}
                            isForFilters={!id}
                            onValuesChange={onValuesChange}
                            title="癫痫发作"
                            renderChildren={'none'}
                        /> 
                    </NestedInnerForm>  
                
                </NestedOuterForm>
            </SharedFrame>
        );
    }
}

NewbornEEG.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

NewbornEEG.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default NewbornEEG;