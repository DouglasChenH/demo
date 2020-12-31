import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class DischargeMethod extends React.Component {
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
                    name: '离院方式',
                    type: 'radio',
                    options: [
                        "医嘱离院",
                        "医嘱转院",
                        "医嘱转社区卫生服务机构/乡镇卫生院",
                        "非医嘱离院",
                        "死亡",
                        "其他",
                        "",
                    ],
                },
            ],
            [
                {
                    name: '拟接收医疗机构名称',
                    type: 'text',
                    required: false,
                },
            ],
            [
                {
                    name: '出院31天内再住院计划',
                    type: 'radio',
                    options: ['有', "无", ""],
                },
            ],
            [
                {
                    name: '再住院目的',
                    type: 'text',
                    required: false,
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
                    title="离院方式"
                    values={values}
                    fields={this.createFields()}
                    columns={1}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

DischargeMethod.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

DischargeMethod.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default DischargeMethod;