import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class EconomyCondition extends React.Component {
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
                    name: '家庭年收入（万元）',
                    type: 'number',
                },
                {
                    name: '父亲受教育水平',
                    type: 'select',
                    options: ['本科及以上', '大专/职专', '高中/职高', '初中', '小学及以下'],
                },
                {
                    name: '母亲受教育水平',
                    type: 'select',
                    options: ['本科及以上', '大专/职专', '高中/职高', '初中', '小学及以下'],
                },
            ],
            [
                {
                    name: '父亲职业',
                    type: 'select',
                    options: ['专业技术人员，管理人员，或公务员', '商人或公司职员', '体力劳动者，农民，或无业人员'],
                },
                {
                    name: '母亲职业',
                    type: 'select',
                    options: ['专业技术人员，管理人员，或公务员', '商人或公司职员', '体力劳动者，农民，或无业人员'],
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

EconomyCondition.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

EconomyCondition.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default EconomyCondition;