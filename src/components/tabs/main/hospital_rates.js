import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class HospitalRates extends React.Component {
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
                    name: '总费用',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '自付金额',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '一般医疗服务费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '一般治疗操作费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '护理费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '其他费用',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '病理诊断费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '实验室诊断费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '影像学诊断费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '临床诊断项目费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '非手术治疗项目费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '临床物理治疗费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '手术治疗费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '麻醉费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '手术费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '康复费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '中医治疗费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '西药费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '抗菌药物费用',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '中成药费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '中草药费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '血费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '白蛋白类制品费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '球蛋白类制品费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '凝血因子类制品费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '细胞因子类制品费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '检查用一次性医用材料费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '治疗用一次性医用材料费',
                    type: 'number',
                    suffix: "元",
                },
            ],
            [
                {
                    name: '手术用一次性医用材料费',
                    type: 'number',
                    suffix: "元",
                },
                {
                    name: '其他费用',
                    type: 'number',
                    suffix: "元",
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
                    columns={2}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

HospitalRates.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

HospitalRates.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default HospitalRates;