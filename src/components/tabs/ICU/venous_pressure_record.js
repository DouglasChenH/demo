import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm, GeneralForm } from "../../generics";

export class VenousPressureRecord extends React.Component {
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


    createDynamicFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '中心静脉压 （cmH2O）',
                    type: 'number'
                },
                {
                    name: 'ICU时间点',
                    type: 'number'
                },
                {
                    name: '记录时间',
                    type: 'time',
                },
            ]
        ]);

        return fields;
    };

    createGeneralFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '术后中心静脉压是否有持续异常',
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

        return (
            <SharedFrame
                title={title}
                handleSubmit={this.handleSubmit}
                isForFilters={!id}
            >
                <DynamicForm
                    wrappedComponentRef={(form) => this.formRef['中心静脉压 （cmH2O）'] = form}
                    title={'中心静脉压 （cmH2O）'}
                    values={dynamicValues.get('中心静脉压 （cmH2O）', Immutable.List())}
                    fields={this.createDynamicFields()}
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
                <hr />
                <GeneralForm
                    wrappedComponentRef={(form) => this.generalForm = form}
                    values={genaralValues}
                    fields={this.createGeneralFields()}
                    columns={3}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

VenousPressureRecord.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

VenousPressureRecord.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default VenousPressureRecord;