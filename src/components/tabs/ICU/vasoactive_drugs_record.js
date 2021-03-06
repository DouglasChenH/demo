import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class VasoactiveDrugsRecord extends React.Component {
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
            "多巴胺 （mcg/kg/min）",
            "米力农 （mcg/kg/min）",
            "肾上腺素 （mcg/kg/min）",
            "硝酸甘油 （mcg/kg/min）",
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
                        onValuesChange={(...args) => onValuesChange(...args, key)}
                    />
                )}
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef['其他'] = form}
                    values={values.get('其他', Immutable.List())}
                    title={'其他'}
                    fields={this.createSpecialFields()}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={(...args) => onValuesChange(...args, '其他')}
                />
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef["血管活性药评分（VIS）"] = form}
                    title={"血管活性药评分（VIS）"}
                    values={values.get("血管活性药评分（VIS）", Immutable.List())}
                    fields={this.createFields("血管活性药评分（VIS）")}
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

VasoactiveDrugsRecord.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

VasoactiveDrugsRecord.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default VasoactiveDrugsRecord;