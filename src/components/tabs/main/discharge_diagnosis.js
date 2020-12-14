import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm, GeneralForm } from "../../generics";

export class DischargeDiagnosis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            genaralValues: Immutable.Map(),
            dynamicValues: Immutable.List(Immutable.Map()),
            isLoading: true,
            _rev: undefined,
        };
    }

    componentDidMount() {
        const { id, path, title } = this.props;
        if (id) {
            fetchDataMixin(id, path, title)
                .then(doc => {
                    this.setState({
                        genaralValues: formatRawDocData(Immutable.fromJS(doc.data.general)),
                        dynamicValues: formatRawDocData(Immutable.fromJS(doc.data.dynamic)),
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
        const dynamicValues = this.dynamicForm.prepSubmit();
        const generalValues = this.generalForm.prepSubmit();

        if (dynamicValues && generalValues) {
            let doc = {
                id: this.props.id,
                _id:`discharge_diagnosis:user_${this.props.id}`,
                data: {
                    dynamic: dynamicValues,
                    general: generalValues,
                },
                type: 'mixed',
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
                    name: '疾病名称',
                    type: 'text'
                },
                {
                    name: '疾病编码',
                    type: 'text'
                },
                {
                    name: '入院病情',
                    type: 'radio',
                    options: ['有', '临床未确定', "情况不明", "无", ""],
                },
            ]
        ]);

        return fields;
    };

    render() {
        const { id, title, onValuesChange } = this.props;
        const { genaralValues, dynamicValues, isLoading } = this.state;
        const fields = this.createFields();

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >
                <h3>{"主要诊断"}</h3>
                <hr />
                <GeneralForm
                    wrappedComponentRef={(form) => this.generalForm = form}
                    values={genaralValues}
                    fields={fields}
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
                <h3>{"其他诊断"}</h3>
                <hr />
                <DynamicForm
                    wrappedComponentRef={(form) => this.dynamicForm = form}
                    values={dynamicValues}
                    fields={fields}
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

DischargeDiagnosis.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

DischargeDiagnosis.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default DischargeDiagnosis;