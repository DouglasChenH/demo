import Immutable from "immutable";
import moment from 'moment';
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { DynamicForm } from "../../generics";

export class MRIResult extends React.Component {
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
                let values = doc.data;

                values.forEach((row, index) => {
                    Object.keys(row).forEach(field => {
                        let colValue = values[index][field];
                        if (field === '检查日期') {
                            values[index][field] = colValue ? moment(colValue) : colValue;
                        }
                        if (field === 'MRI原始文件' || field === 'MRI报告') {
                            if (colValue === "" || colValue === undefined) {
                                values[index][field] = [];
                            }
                            else {
                                values[index][field] = values[index][field].map((filename, index) => ({
                                    uid: index,
                                    name: filename,
                                    status: 'done',
                                    url: `${path}:user_${id}`,
                                    fieldName: field,
                                }))
                            }
                        }
                    });
                })
                
                this.setState({
                    values: Immutable.fromJS(values),
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
            let attachments = {};

            prepData.forEach((row, index) => {
                Object.keys(row).forEach(field => {
                    if (field === 'MRI原始文件' || field === 'MRI报告') {
                        let files = prepData[index][field];
                        if (files === "" || files === undefined) {
                            prepData[index][field] = [];
                        }
                        else {
                            files.forEach(file => {
                                const attachmentData = {
                                    "content_type": file.type,
                                    "data": file,
                                }
                                attachments[file.name] = attachmentData;
                            })
                            prepData[index][field] = files.map(file => file.name);
                        }   
                    }
                });
            })

            let doc = {
                _id:`${path}:user_${id}`,
                data: prepData,
                "_attachments": attachments,
                type: 'dynamic',
            }

            // file deleting/uploading might override the _rev
            // get the latest _rev 
            fetchDataMixin(id, path, title)
                .then(response => {
                    doc._rev = response._rev;

                    submitDataMixin(doc, id, title)
                        .then(rev => {
                            this.setState({
                                _rev: rev,
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    
                })
                .catch(err => {
                    if (err.error === 'not_found') {
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
                    console.log(err);
                })
        }
    };

    createFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '检查日期',
                    type: 'date',
                },
                {
                    name: '检查日期备注',
                    type: 'text',
                },
                {
                    name: 'MRI诊断',
                    type: 'text',
                },
                {
                    name: 'MRI报告',
                    type: 'file',
                },
            ],
            [
                {
                    name: 'MRI原始文件',
                    type: 'file',
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
                 <DynamicForm
                    wrappedComponentRef={(form) => this.form = form}
                    title="检查结果"
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

MRIResult.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

MRIResult.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default MRIResult;