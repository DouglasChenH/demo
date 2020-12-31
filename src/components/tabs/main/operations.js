import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class Operations extends React.Component {
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
                    name: '手术及操作日期',
                    type: 'datetime',
                },
                {
                    name: '手术及操作名称',
                    type: 'text',
                },
                {
                    name: '手术及操作编码',
                    type: 'text',
                },
                {
                    name: '手术级别',
                    type: 'select',
                    options: ["A", "B"],
                },
            ],
            [
                {
                    name: '术者',
                    type: 'text'
                },
                {
                    name: '一助',
                    type: 'text',
                    required: false,
                },
                {
                    name: '二助',
                    type: 'text',
                    required: false,
                },
                {
                    name: '手术类别',
                    type: 'text'
                },
            ],
            [
                {
                    name: '切口/愈合等级',
                    type: 'text'
                },
                {
                    name: '麻醉方式',
                    type: 'text'
                },
                {
                    name: '麻醉医师',
                    type: 'text'
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
                <DynamicForm
                    wrappedComponentRef={(form) => this.form = form}
                    title="手术及操作"
                    values={values}
                    fields={this.createFields()}
                    columns={4}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

Operations.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

Operations.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default Operations;