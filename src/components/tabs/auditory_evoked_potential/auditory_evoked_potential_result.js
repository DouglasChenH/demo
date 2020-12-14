import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class AuditoryEvokedPotentialResult extends React.Component {
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
                    name: '检查时间',
                    type: 'datetime',
                },
                {
                    name: '检查时间备注',
                    type: 'text',
                },
                {
                    name: '检查备注',
                    type: 'text',
                },
            ],
            [
                {
                    name: '左耳I波潜伏期（ms）',
                    type: 'number',
                },
                {
                    name: '左耳III波潜伏期（ms）',
                    type: 'number',
                },
                {
                    name: '左耳V波潜伏期（ms）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '左耳I-V波波间期（ms）',
                    type: 'number',
                },
                {
                    name: '左耳I-III波波间期（ms）',
                    type: 'number',
                },
                {
                    name: '左耳III-V波波间期（ms）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '左耳70dB检查结果',
                    type: 'text',
                },
                {
                    name: '左耳听觉阈限（dB）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '右耳I波潜伏期（ms）',
                    type: 'number',
                },
                {
                    name: '右耳III波潜伏期（ms）',
                    type: 'number',
                },
                {
                    name: '右耳V波潜伏期（ms）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '右耳I-V波波间期（ms）',
                    type: 'number',
                },
                {
                    name: '右耳I-III波波间期（ms）',
                    type: 'number',
                },
                {
                    name: '右耳III-V波波间期（ms）',
                    type: 'number',
                },
            ],
            [
                {
                    name: '右耳70dB检查结果',
                    type: 'text',
                },
                {
                    name: '右耳听觉阈限（dB）',
                    type: 'number',
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

AuditoryEvokedPotentialResult.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

AuditoryEvokedPotentialResult.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default AuditoryEvokedPotentialResult;