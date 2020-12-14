import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class MedicalPersonnel extends React.Component {
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
                    name: '科主任',
                    type: 'text'
                },
                {
                    name: '主任（副主任）医师',
                    type: 'text'
                },
                {
                    name: '主治医师',
                    type: 'text'
                },
            ],
            [
                {
                    name: '住院医师',
                    type: 'text'
                },
                {
                    name: '责任护士',
                    type: 'text'
                },
                {
                    name: '进修医师',
                    type: 'text'
                },
            ],
            [
                {
                    name: '实习医师',
                    type: 'text'
                },
                {
                    name: '编码员',
                    type: 'text'
                },
            ],
            [
                {
                    name: '病案质量',
                    type: 'radio',
                    options: ['甲', '乙', '丙', ""],
                },
                {
                    name: '质控医师',
                    type: 'text'
                },
                {
                    name: '质控护士',
                    type: 'text'
                },
            ],
            [
                {
                    name: '质控日期',
                    type: 'date',
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

MedicalPersonnel.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

MedicalPersonnel.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default MedicalPersonnel;