import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class GeneralTable extends React.Component {
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
                    name: '姓名',
                    type: 'text',
                },
                {
                    name: '住院号',
                    type: 'text'
                },
                {
                    name: '电话',
                    type: 'text'
                },
            ],
            [
                {
                    name: '第一诊断',
                    type: 'text',
                },
                {
                    name: '是否双胞胎',
                    type: 'radio',
                    options: ['否', '是', ""],
                },
                {
                    name: '是否G6PD',
                    type: 'radio',
                    options: ['否', '是', ""],
                },
            ],
            [
                {
                    name: '出生日期',
                    type: 'date',
                },
                {
                    name: '备注',
                    type: 'text',
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

GeneralTable.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

GeneralTable.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default GeneralTable;