import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class Transfer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: Immutable.List(Immutable.Map()),
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
                type: 'dynamic',
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
                    name: '转科时间',
                    type: 'datetime',
                },
                {
                    name: '转科科室',
                    type: 'text'
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
                <DynamicForm
                    wrappedComponentRef={(form) => this.form = form}
                    values={values}
                    fields={this.createFields()}
                    columns={2}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

Transfer.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

Transfer.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default Transfer;