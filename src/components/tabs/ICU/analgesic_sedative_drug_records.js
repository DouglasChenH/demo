import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class AnalgesicSedativeDrugsRecord extends React.Component {
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

    createSpecialFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '其他',
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
        const { values, isLoading } = this.state;
        const keys = [
            "咪达唑仑 mg/kg",
            "芬太尼 mg/kg",
            "舒芬太尼 ug/kg.h",
            "顺苯 mg/kg.h",
            "硝普纳 （mcg/kg/min）",
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
                        onValuesChange={onValuesChange}
                    />
                )}
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef['其他'] = form}
                    values={values.get('其他', Immutable.List())}
                    title={'其他'}
                    fields={this.createSpecialFields()}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

AnalgesicSedativeDrugsRecord.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

AnalgesicSedativeDrugsRecord.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default AnalgesicSedativeDrugsRecord;