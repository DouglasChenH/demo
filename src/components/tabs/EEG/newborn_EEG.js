import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm, NestedForm } from "../../generics";
import { Nested1stForm } from '../../generics/nested_form/nested_1st_form';

export class NewbornEEG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.Map(),
            formValues: Immutable.Map(),
            isLoading: true,
            _rev: undefined,
        };
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        fetchDataMixin(id, path, title)
            .then(doc => {
                this.setState({
                    values: Immutable.fromJS(doc.data),
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
                    name: 'EEG背景',
                    type: 'radio',
                    options: [
                        "正常",
                        "缓慢-紊乱",
                        "不连续",
                        "爆发抑制",
                        "持续抑制",
                        ""
                    ],
                },
                {
                    name: '背景频率（Hz）',
                    type: 'text',
                },
            ],
            [
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
                {
                    name: '左右对称性 ',
                    type: 'radio',
                    options: [
                        "对称",
                        "不对称",
                        ""
                    ],
                },
                {
                    name: '波形',
                    type: 'radio',
                    options: [
                        "衰减",
                        "Delta",
                        "Delta + Theta",
                        "Delta+theta+alpha",
                        ""
                    ],
                },
            ],
            [
                {
                    name: '连续性',
                    type: 'radio',
                    options: [
                        "连续",
                        "几乎连续，伴随衰减",
                        "几乎连续，伴随抑制",
                        "不连续，伴随衰减",
                        "不连续，伴随抑制",
                        "爆发衰减",
                        "爆发抑制",
                        "抑制",
                        ""
                    ],
                },
                {
                    name: '电压',
                    type: 'radio',
                    options: [
                        "正常",
                        "低",
                        "抑制",
                        ""
                    ],
                },
                {
                    name: '阶段2脑电变化',
                    type: 'radio',
                    options: [
                        "出现且正常",
                        "出现但异常",
                        "消失",
                        "清醒",
                        ""
                    ],
                },
            ],
            [
                {
                    name: '反应性',
                    type: 'radio',
                    options: [
                        "出现",
                        "未出现",
                        ""
                    ],
                },
                {
                    name: '脑电波变化性',
                    type: 'radio',
                    options: [
                        "出现",
                        "未出现",
                        ""
                    ],
                },
                {
                    name: '出现反应性或变异性',
                    type: 'radio',
                    options: [
                        "出现",
                        "未出现",
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

    onValuesChange = (...args) => {
        if (!this.props.id) {
            this.props.onValuesChange(...args);
        }
        else {
            // const changedValues = args[0];
            // const allValues = args[1];
            // const parentIndexes = args[2];
            // // changedValues, allValues, props.parentIndexes
            // let formValues = this.state.formValues;
            // console.log(parentIndexes.toJS(), allValues)

            // // first layer
            // if (parentIndexes.size === 1) {
            //     formValues = formValues.set(0, allValues)
            // }
            // // first layer
            // if (parentIndexes.size === 2) {
            //     formValues = formValues.set(0, allValues)
            // }
            // parentIndexes.forEach(formLayerIndex => 
            //     formValues = formValues.set(formLayerIndex, allValues)
            // )

            // this.setState({ formValues });

            // console.log(formValues.toArray())
        }
        // values: Immutable.List(Immutable.Map()),
    };

    render() {
        const { id, title } = this.props;
        const { values, isLoading } = this.state;

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >
                <Nested1stForm
                    wrappedComponentRef={(form) => this.form = form}
                    layer={0}
                    values={values.get('general', Immutable.List())}
                    fields={this.createEEGFields()}
                    firstLayerFields={this.createResultFields()}
                    secondLayerFields={this.createFields()}
                    columns={5}
                    isForFilters={!id}
                    onValuesChange={this.onValuesChange}
                    title="新生儿脑电图检查基本信息"
                >   
                    <Nested1stForm
                        // wrappedComponentRef={(form) => this.form = form}
                        layer={1}
                        values={values}
                        fields={this.createResultFields()}
                        columns={3}
                        isForFilters={!id}
                        // onValuesChange={this.onValuesChange}
                        title="脑电图检查结果"
                        renderChildren={'conditional'}
                    >   
                        <Nested1stForm
                            // wrappedComponentRef={(form) => this.form = form}
                            layer={2}
                            values={values}
                            fields={this.createFields()}
                            columns={3}
                            isForFilters={!id}
                            // onValuesChange={this.onValuesChange}
                            title="癫痫发作"
                            renderChildren={'none'}
                        /> 
                    </Nested1stForm>  
                
                </Nested1stForm>
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