import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class AntibioticsRecord extends React.Component {
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
            "头孢唑林钠 （g）",
            "头孢他啶 （g）",
            "盐酸克林霉素 （g）",
            "美罗培南 （g）",
            "亚胺培南西司他丁钠 （g）",
            "盐酸万古霉素 （g）"
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
            </SharedFrame>
        );
    }
}

AntibioticsRecord.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

AntibioticsRecord.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default AntibioticsRecord;