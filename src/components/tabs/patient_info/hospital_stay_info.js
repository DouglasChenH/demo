import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class HospitalStayInfo extends React.Component {
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
                    name: '入院时间',
                    type: 'date',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '出院时间',
                        former: '入院时间',
                        result: '住院时间',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '出院时间',
                    },
                },
                {
                    name: '出院时间',
                    type: 'date',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '出院时间',
                        former: '入院时间',
                        result: '住院时间',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        min: '入院时间',
                    },
                },
                {
                    name: '住院时间',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '入ICU时间',
                    type: 'date',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '出ICU时间',
                        former: '入ICU时间',
                        result: 'ICU停留时间',
                    },
                    validation: {
                        // required: true,
                        type: 'moment',
                        min: '入院时间',
                        max: '出ICU时间',
                    },
                },
                {
                    name: '出ICU时间',
                    type: 'date',
                    bindings: { // result = latter - former
                        type: 'days',
                        latter: '出ICU时间',
                        former: '入ICU时间',
                        result: 'ICU停留时间',
                    },
                    validation: {
                        // required: true,
                        type: 'moment',
                        min: '入ICU时间',
                        max: '出院时间',
                    },
                },
                {
                    name: 'ICU停留时间',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '诊断',
                    type: 'text'
                },
                {
                    name: '病种',
                    type: 'text',
                },
                {
                    name: '是否抢救',
                    type: 'radio',
                    isSpecialOptions: true, // treat it as the special case in the form component
                },
            ],
            [
                {
                    name: '术前呼吸机插管时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '术前呼吸机拔管时间',
                        former: '术前呼吸机插管时间',
                        result: '术前机械通气时间（h）',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '术前呼吸机拔管时间',
                    },
                },
                {
                    name: '术前呼吸机拔管时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '术前呼吸机拔管时间',
                        former: '术前呼吸机插管时间',
                        result: '术前机械通气时间（h）',
                    },
                    validation: {
                        required: true,
                    },
                },
                {
                    name: '术前机械通气时间（h）',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '术后呼吸机插管时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '术后呼吸机拔管时间',
                        former: '术后呼吸机插管时间',
                        result: '术后机械通气时间（h）',
                    },
                    validation: {
                        required: true,
                        type: 'moment',
                        max: '术后呼吸机拔管时间',
                    },
                },
                {
                    name: '术后呼吸机拔管时间',
                    type: 'time',
                    bindings: { // result = latter - former
                        type: 'hours',
                        latter: '术后呼吸机拔管时间',
                        former: '术后呼吸机插管时间',
                        result: '术后机械通气时间（h）',
                    },
                    validation: {
                        required: true,
                    },
                },
                {
                    name: '术后机械通气时间（h）',
                    type: 'number',
                    disabled: true,
                },
            ],
            [
                {
                    name: '是否腹透置管',
                    type: 'radio',
                    isSpecialOptions: true, // treat it as the special case in the form component
                },
                {
                    name: '是否有气胸',
                    type: 'radio',
                    isSpecialOptions: true, // treat it as the special case in the form component
                },
                {
                    name: '是否心率失常',
                    type: 'radio',
                    isSpecialOptions: true, // treat it as the special case in the form component
                },
            ],
            [
                {
                    name: '是否院内死亡',
                    type: 'radio',
                    options: ['无', '有', ''],
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

HospitalStayInfo.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

HospitalStayInfo.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default HospitalStayInfo;