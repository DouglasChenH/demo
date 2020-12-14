import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm, GeneralForm } from "../../generics";

export class TCDBeforeOperation extends React.Component {
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
                    //'记录时间' is using time format in other forms
                    // rename it to '记录日期' 
                    name: '记录日期', 
                    type: 'datetime'
                },
            ]
        ]);

        return fields;
    };

    createGeneralFields = () => {
        const fields = Immutable.fromJS([
            [
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
            "平均血流速度Vm （cm/s）",
            "收缩期血流速度Vs（cm/s）",
            "舒张期血流速度Vd（cm/s）",
            "搏动指数PI",
            "阻抗指数RI",
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
                        values={dynamicValues.get(key, Immutable.List())}
                        fields={this.createFields(key)}
                        columns={2}
                        isForFilters={!id}
                        onValuesChange={onValuesChange}
                    />
                )}
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

TCDBeforeOperation.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

TCDBeforeOperation.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default TCDBeforeOperation;