import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class InspectionResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.List(Immutable.Map()),
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
                    const values = Immutable.fromJS(doc.data)
                        .map((value, key) => formatRawDocData(value));
                        
                    this.setState({
                        values: values,
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
        let prepData = Immutable.OrderedMap();

        Object.keys(this.formRef).forEach(form => 
            prepData = prepData.set(form, this.formRef[form].prepSubmit())
        );

        if (prepData) {
            let doc = {
                _id:`${path}:user_${id}`,
                data: prepData,
                type: 'multi-dynamic',
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

    render() {
        const { id, title, onValuesChange } = this.props;
        const { values, isLoading } = this.state;
        const keys = [
            "前体脑钠肽NT-proBNP （pg/ml）",
            "尿素（mmol/L）",
            "肌酐CRE （umol/L）",
            "丙氨酸氨基转移酶 ALT （U/L）",
            "天门冬氨酸基转移酶AST （U/L）",
            "肌酸激酶CK （U/L）",
            "肌酸激酶同工酶CK-MB （U/L）",

            "葡萄糖Glu （mmol/L）",
            "C反应蛋白CRP （mg/L）",
            "白细胞WBC （10^9/L）",
            "淋巴细胞（%）",
            "中性粒细胞（%）",
            "红细胞（10^12/L）",
            "血小板 （10^9/L）",
            "降钙素原 （ng/ml）",
        ];

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >
                {keys.map((key, index) => 
                    <DynamicForm
                        key={index}
                        wrappedComponentRef={(form) => this.formRef[key] = form}
                        title={key}
                        values={values.get(key, Immutable.List())}
                        fields={this.createFields(key)}
                        columns={3}
                        isForFilters={!id}
                        onValuesChange={(...args) => onValuesChange(...args, key)}
                    />
                )}
            </SharedFrame>
        );
    }
}

InspectionResult.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

InspectionResult.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default InspectionResult;