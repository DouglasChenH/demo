import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class AllergyBloodDeath extends React.Component {
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
                    name: '药物过敏',
                    type: 'radio',
                    options: ['有', '无', ""],
                },
                {
                    name: '过敏药物',
                    type: 'text'
                },
                {
                    name: 'ABO血型',
                    type: 'radio',
                    options: ['A', 'B', 'O', 'AB', '不详', '未查', ""],
                },
            ],
            [
                {
                    name: 'RH血型',
                    type: 'radio',
                    options: ['阴', '阳', '不详', '未查', ""],
                },
                {
                    name: '死亡者尸检',
                    type: 'radio',
                    options: ['是', '否', ""],
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

AllergyBloodDeath.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

AllergyBloodDeath.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default AllergyBloodDeath;