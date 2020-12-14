import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm, GeneralForm } from "../../generics";

export class BloodAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            genaralValues: Immutable.Map(),
            dynamicValues: Immutable.List(Immutable.Map()),
            isLoading: true,
            _rev: undefined,
        };
        this.formRef = {};
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        if (id) {
            fetchDataMixin(id, path, title)
                .then(doc => {
                    const dynamicValues = Immutable.fromJS(doc.data.dynamic)
                        .map((value, key) => formatRawDocData(value));
                        
                    this.setState({
                        genaralValues: formatRawDocData(Immutable.fromJS(doc.data.general)),
                        dynamicValues: dynamicValues,
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
        const generalValues = this.generalForm.prepSubmit();
        let dynamicValues = Immutable.OrderedMap();

        Object.keys(this.formRef).forEach(form => 
            dynamicValues = dynamicValues.set(form, this.formRef[form].prepSubmit())
        );

        if (dynamicValues && generalValues) {
            let doc = {
                _id:`${path}:user_${id}`,
                data: {
                    dynamic: dynamicValues,
                    general: generalValues,
                },
                type: 'mixed-multi-dynamic',
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

    createFields = (firstColName) => {
        const fields = Immutable.fromJS([
            [
                {
                    name: firstColName,
                    type: 'number',
                },
                {
                    name: 'ICU时间点',
                    type: 'number',
                },
                {
                    name: '记录时间',
                    type: 'time'
                },
            ]
        ]);

        return fields;
    };

    createSpecialFields = (firstColName, secondColName) => {
        const fields = Immutable.fromJS([
            [
                {
                    name: firstColName,
                    type: 'number',
                    bindings: [
                        {// result = coeff * former + const
                            type: 'formula',
                            coeff: 7.5,
                            const: 0,
                            former: firstColName,
                            result: secondColName,
                        },
                    ],
                },
                {
                    name: secondColName,
                    type: 'number',
                    disabled: true,
                },
                {
                    name: 'ICU时间点',
                    type: 'number',
                },
                {
                    name: '记录时间',
                    type: 'time'
                },
            ]
        ]);

        return fields;
    };

    createGeneralFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '术后血气电解质分析是否有持续异常',
                    type: 'radio',
                    options: ['否', '是', ""],
                },
                {
                    name: '备注',
                    type: 'text'
                },
            ]
        ]);

        return fields;
    };

    render() {
        const { id, title, onValuesChange } = this.props;
        const { genaralValues, dynamicValues, isLoading } = this.state;
        const keys = [
            "血氧饱和度SO2 （%）",
            "红细胞压积Hct（%）",
            "血红蛋白Hb（g/L）",
            "碱剩余BE （mmol/L）",
            "钠Na+（mmol/L）",
            "钾K+（mmol/L）",
            "钙Ca（mmol/L）",
            "乳酸Lac（mmol/L）",
            "中心静脉血氧饱和度SvO2（%）",
        ];

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef["酸碱度pH"] = form}
                    title={"酸碱度pH"}
                    values={dynamicValues.get("酸碱度pH", Immutable.List())}
                    fields={this.createFields("酸碱度pH")}
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef['二氧化碳分压PCO2（Kpa）'] = form}
                    values={dynamicValues.get('二氧化碳分压PCO2（Kpa）', Immutable.List())}
                    title={'二氧化碳分压PCO2（Kpa）'}
                    fields={this.createSpecialFields("二氧化碳分压PCO2（Kpa）", "二氧化碳分压PCO2 （mmHg）")}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef['氧分压PO2 （Kpa）'] = form}
                    values={dynamicValues.get('氧分压PO2 （Kpa）', Immutable.List())}
                    title={'氧分压PO2 （Kpa）'}
                    fields={this.createSpecialFields("氧分压PO2 （Kpa）", "氧分压PO2 （mmHg）")}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
                {keys.map((key, index) => 
                    <DynamicForm
                        key={index}
                        wrappedComponentRef={(form) => this.formRef[key] = form}
                        title={key}
                        values={dynamicValues.get(key, Immutable.List())}
                        fields={this.createFields(key)}
                        columns={3}
                        isForFilters={!id}
                        onValuesChange={onValuesChange}
                    />
                )}
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef['静脉血氧分压PvO2（Kpa）'] = form}
                    values={dynamicValues.get('静脉血氧分压PvO2（Kpa）', Immutable.List())}
                    title={'静脉血氧分压PvO2（Kpa）'}
                    fields={this.createSpecialFields("静脉血氧分压PvO2（Kpa）", "静脉血氧分压PvO2 （mmHg）")}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
                <hr />
                <GeneralForm
                    wrappedComponentRef={(form) => this.generalForm = form}
                    values={genaralValues}
                    fields={this.createGeneralFields()}
                    columns={2}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

BloodAnalysis.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

BloodAnalysis.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default BloodAnalysis;