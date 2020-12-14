import Immutable from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { SharedFrame } from '../shared_frame';
import { formatRawDocData, fetchDataMixin, submitDataMixin } from '../../utils/mixin';
import { GeneralForm } from "../../generics";

export class SampleTestingResult extends React.Component {
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
                let values = doc.data;

                Object.keys(values).forEach(field => {
                    values[field] = values[field].map((filename, index) => ({
                        uid: index,
                        name: filename,
                        status: 'done',
                        url: `${path}:user_${id}`,
                        fieldName: field,
                    }))
                });
                
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
            let fileListData = {};
            let attachments = {};

            Object.keys(prepData).forEach(field => {
                fileListData[field] = prepData[field].map(file => file.name);

                prepData[field].forEach(file => {
                    const attachmentData = {
                        "content_type": file.type,
                        "data": file,
                    }
                    attachments[file.name] = attachmentData;
                })
            });

            let doc = {
                _id:`${path}:user_${id}`,
                data: fileListData,
                "_attachments": attachments,
                type: 'files',
            }
            
            // if (this.state._rev) {
            //     doc._rev = this.state._rev;
            // }

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
                    console.log(err);
                })
        }
    };

    createFields = () => {
        const fields = Immutable.fromJS([
            [
                {
                    name: '菌群分析结果',
                    type: 'file',
                },
                {
                    name: '代谢物分析结果',
                    type: 'file',
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

SampleTestingResult.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    title: PropTypes.string,
    onValuesChange: PropTypes.func,
};

SampleTestingResult.defaultProps = {
    id: '',
    path: '',
    title: '',
    onValuesChange: () => {},
};

export default SampleTestingResult;