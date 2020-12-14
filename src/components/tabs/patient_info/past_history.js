import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class PastHistory extends React.Component {
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
                let values = formatRawDocData(Immutable.fromJS(doc.data));

                values = values.set('病案号', id);
                
                this.setState({
                    values: values,
                    _rev: doc._rev,
                });
            })
            .catch(err => {
                this.setState({
                    values: Immutable.Map({
                        '病案号': id
                    }),
                });
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
                    name: '入院前抗生素使用史',
                    type: 'radio',
                    options: ['有', '无', '不确定', ''],
                },
                {
                    name: '既往住院史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
                {
                    name: '既往住院原因',
                    type: 'text',
                },
                {
                    name: '既往手术史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
                {
                    name: '既往手术名称',
                    type: 'text',
                },
            ],
            [
                {
                    name: '分娩方式',
                    type: 'radio',
                    options: ['顺产', '剖腹产', ''],
                },
                {
                    name: '出生体重（kg）',
                    type: 'number',
                },
                {
                    name: '出生窒息史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
                {
                    name: '出生抢救史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
                {
                    name: '生后喂养方式',
                    type: 'radio',
                    options: ['母乳喂养', '混合喂养', '奶粉喂养', ''],
                },
            ],
            [
                {
                    name: '父亲年龄（岁）',
                    type: 'number',
                },
                {
                    name: '父亲吸烟史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
                {
                    name: '父亲饮酒史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
            ],
            [
                {
                    name: '母亲年龄（岁）',
                    type: 'number',
                },
                {
                    name: '母亲吸烟史',
                    type: 'radio',
                    options: ['无', '有', ''],
                },
                {
                    name: '母亲饮酒史',
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
                    columns={5}
                    isForFilters={!id}
                    onValuesChange={onValuesChange}
                />
            </SharedFrame>
        );
    }
}

PastHistory.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

PastHistory.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default PastHistory;