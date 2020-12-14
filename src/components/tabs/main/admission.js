import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class Admission extends React.Component {
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
                    name: '入院途径',
                    type: 'select',
                    options: ['直接', '转院'],
                },
                {
                    name: '门（急）诊诊断',
                    type: 'text'
                },
                {
                    name: '疾病编码',
                    type: 'text'
                },
            ],
            [
                {
                    name: '入院时间',
                    type: 'datetime',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '出院时间',
                        former: '入院时间',
                        result: '实际入住天数',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '出院时间',
                    },
                },
                {
                    name: '入院科别',
                    type: 'text'
                },
                {
                    name: '入院病房',
                    type: 'text',
                },
            ],
            [
                {
                    name: '出院时间',
                    type: 'datetime',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '出院时间',
                        former: '入院时间',
                        result: '实际入住天数',
                    }
                },
                {
                    name: '出院科别',
                    type: 'text'
                },
                {
                    name: '出院病房',
                    type: 'text',
                },
            ],
            [
                {
                    name: '实际入住天数',
                    type: 'number',
                    disabled: true,
                    // bindings: { // result = latter - former
                    //     type: 'days',
                    //     latter: '出院时间',
                    //     former: '入院时间',
                    //     result: '实际入住天数',
                    // }
                },
                {
                    name: '门（急）诊医生',
                    type: 'text'
                },
                {
                    name: '临床路径病例',
                    type: 'radio',
                    options: ['否', '是', ""],
                },
            ],
            [
                {
                    name: '病例分型',
                    type: 'select',
                    options: ['A', 'B', "C"],
                },
                {
                    name: '抢救（次）',
                    type: 'number',
                },
                {
                    name: '成功（次）',
                    type: 'number',
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

Admission.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

Admission.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default Admission;