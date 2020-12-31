import React, { useState } from "react";
import ReactDOM from "react-dom";
import moment from 'moment';
import Immutable from "immutable";
import PropTypes from "prop-types";
import {
  Input,
  Select,
  DatePicker,
  TimePicker,
  Radio,
  Checkbox,
  InputNumber,
  Button,
  Upload,
  Icon,
} from "antd";
import { deleteAttachmentMixin, downloadAttachmentMixin, downloadBlob } from '../utils/mixin';

const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;

function disabledDate(current) {
  // Can not select days after today
  return current > moment().endOf('day');
}

export class NumberRangeInput extends React.Component {
    triggerChange = changedValue => {
        const { onChange } = this.props;

        if (onChange) {
            onChange(changedValue);
        }
    };

    render() {
        const { value, suffix, min, max } = this.props;
        let rangeValue = value;

        if (!rangeValue) {
            rangeValue = [null, null];
        }

        if (suffix) {
            return (
                <span>
                    <Input
                        value={rangeValue[0]}
                        type="number"
                        onChange={e => this.triggerChange([e.target.value, rangeValue[1]])}
                        addonAfter={suffix}
                        min={min}
                        max={max}
                        style={{ width: '45%'}}
                    />
                    &nbsp; - &nbsp;
                    <Input
                        value={rangeValue[1]}
                        type="number"
                        min={min}
                        max={max}
                        onChange={e => this.triggerChange([rangeValue[0], e.target.value])}
                        addonAfter={suffix}
                        style={{ width: '45%'}}
                    />
                </span>
            );
        }

        return (
            <span>
                <InputNumber
                    min={min}
                    max={max}
                    value={rangeValue[0]}
                    onChange={changedValue => this.triggerChange([changedValue, rangeValue[1]])}
                    style={{ width: '40%', marginRight: '5px'}}
                />
                -
                <InputNumber
                    min={min}
                    max={max}
                    value={rangeValue[1]}
                    onChange={changedValue => this.triggerChange([rangeValue[0], changedValue])}
                    style={{ width: '40%', marginLeft: '5px'}}
                />
            </span>
        );
    }
}

export function TimeRangePicker({value, onChange}) {
  let rangeValue = value;

  if (!rangeValue) {
      rangeValue = [null, null];
  }

  return (
    <div>
      <TimePicker
          value={rangeValue[0]}
          onChange={time => onChange([time, rangeValue[1]])}
          allowClear={false}
          style={{ width: '45%'}}
      />
      &nbsp; - &nbsp;
      <TimePicker
          value={rangeValue[1]}
          onChange={time => onChange([rangeValue[0], time])}
          allowClear={false}
          style={{ width: '45%'}}
      />
    </div>
  );
}

export class InputComponent extends React.Component {
    triggerChange = changedValue => {
        const { onChange, field, isForFilters } = this.props;
        const bindings = field.get('bindings');
        
        if (onChange) {
            onChange(changedValue);
        }

        if (bindings && !isForFilters) {
            this.props.triggerAutoBinding(bindings);
        }
    };

    render() {
        const { field, value, isForFilters } = this.props;
        const type = field.get('type');
        const options = field.get('options');
        const disabled = field.get('disabled', false);
        const isFutureDateAllowed = field.get('isFutureDateAllowed', false);

        if (type === 'file') {
            if (isForFilters) {
                return null;
            }
            else {
                const props = {
                    onRemove: file => {
                        // remove it from the db
                        if (file.status === 'done') {
                            deleteAttachmentMixin(file.url, file.name, file.fieldName);
                        }

                        const index = value.indexOf(file);
                        const newFileList = value.delete(index);

                        this.triggerChange(newFileList);
                    },
                    onPreview: file => {
                        // load it from the db
                        if (file.status === 'done') {
                            downloadAttachmentMixin(file.url, file.name, file.fieldName);
                        }
                        else {
                            downloadBlob(file, file.name);
                        } 
                    },
                    beforeUpload: file => {
                        this.triggerChange(Immutable.List.isList(value) ? value.push(file) : Immutable.List([file]));
                    },
                    customRequest: () => {},
                    fileList: Immutable.List.isList(value) ? value.toJS() : [],
                    // listType: "picture",
                };

                return (
                    <Upload 
                        {...props}
                    >
                        <Button>
                            <Icon type="upload" /> Click to upload
                        </Button>
                    </Upload>
                )
            }
        }
        if (type === 'number') {
            const suffix = field.get('suffix');
            if (isForFilters) {
                return (
                    <NumberRangeInput
                        value={value}
                        suffix={suffix}
                        onChange={this.triggerChange}
                        style={{ width: '100%'}}
                    />
                )
            }
            else {
                if (suffix) {
                    return (
                        <Input
                            disabled={isForFilters ? false: disabled}
                            value={value}
                            type="number"
                            min={0}
                            onChange={this.triggerChange}
                            addonAfter={suffix}
                        />
                    );
                }
                return (
                    <InputNumber
                        disabled={isForFilters ? false: disabled}
                        value={value}
                        onChange={this.triggerChange}
                        style={{ width: '100%'}}
                    />
                )
            }
        }
        else if (type === 'select') {
            let children = [];

            if (Immutable.Map.isMap(options)) {
                options.forEach((optGroup, label) => 
                    children.push(
                        <OptGroup label={label} key={label}>
                            {optGroup.map(opt => <Option key={opt} value={opt}>{opt}</Option>).toArray()}
                        </OptGroup>
                    )
                );
            }
            else {
                children = options.map(opt => <Option key={opt} value={opt}>{opt}</Option>).toArray();
            }

            return (
                <Select
                    placeholder="请选择"
                    showSearch
                    disabled={isForFilters ? false: disabled}
                    value={value}
                    onChange={this.triggerChange}
                >
                    {children}
                </Select>
            )
        }
        else if (type === 'date') {
            if (isForFilters) {
                return (
                    <RangePicker
                        value={value}
                        onChange={this.triggerChange}
                        format="YYYY-MM-DD"
                        allowClear={false}
                        style={{ width: '100%'}}
                    />
                )
            }
            return (
                <DatePicker
                    disabled={disabled}
                    disabledDate={isFutureDateAllowed ? null : disabledDate}
                    value={value}
                    onChange={this.triggerChange}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    style={{ width: '100%'}}
                />
            )
        }
        else if (type === 'datetime') {
            if (isForFilters) {
                return (
                    <RangePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        value={value}
                        onChange={this.triggerChange}
                        allowClear={false}
                        style={{ width: '100%'}}
                    />
                )
            }
            return (
                <DatePicker
                    showTime
                    disabled={disabled}
                    disabledDate={isFutureDateAllowed ? null : disabledDate}
                    value={value}
                    onChange={this.triggerChange}
                    format="YYYY-MM-DD HH:mm"
                    allowClear={false}
                    style={{ width: '100%'}}
                />
            )
        }
        else if (type === 'time') {
            if (isForFilters) {
                return (
                    <TimeRangePicker
                        value={value}
                        onChange={this.triggerChange}
                        allowClear={false}
                        style={{ width: '100%'}}
                    />
                )
            }
            return (
                <TimePicker
                    value={value}
                    onChange={this.triggerChange}
                    allowClear={false}
                    style={{ width: '100%'}}
                />
            )
        }
        else if (type === 'radio') {
            const isSpecialOptions = field.get('isSpecialOptions', false);
            if (isForFilters) {
                if (isSpecialOptions) {
                    return (
                        <Checkbox.Group
                            value={typeof value === 'string' ? [value] : value}
                            onChange={this.triggerChange}
                        >
                            <span>{`是（ `}</span>
                            <Checkbox value={"术前"}>术前</Checkbox>
                            <Checkbox value={"术中"}>术中</Checkbox>
                            <Checkbox value={"术后"}>术后</Checkbox>
                            <span>{`）`}</span>
                            <Checkbox value={"否"}>否</Checkbox>
                            <Checkbox value={""}>{""}</Checkbox>
                        </Checkbox.Group>
                    );
                }
                else {
                    return (
                        <Checkbox.Group
                            value={typeof value === 'string' ? [value] : value}
                            onChange={this.triggerChange}
                        >
                            {options.map(opt => <Checkbox key={opt} value={opt}>{opt}</Checkbox>)}
                        </Checkbox.Group>
                    );
                } 
            }
            else {
                if (isSpecialOptions)
                    return (
                        <Radio.Group
                            disabled={disabled}
                            value={value}
                            onChange={this.triggerChange}
                        >
                            <span>{`是（ `}</span>
                            <Radio value={"术前"}>术前</Radio>
                            <Radio value={"术中"}>术中</Radio>
                            <Radio value={"术后"}>术后</Radio>
                            <span>{`）`}</span>
                            <Radio value={"否"}>否</Radio>
                            <Radio value={""}>{""}</Radio>
                        </Radio.Group>
                    );
                else {
                    return (
                        <Radio.Group
                            disabled={disabled}
                            value={value}
                            onChange={this.triggerChange}
                        >
                            {options.map(opt => <Radio key={opt} value={opt}>{opt}</Radio>)}
                        </Radio.Group>
                    );
                }
            }
            
        }
        else {
            return (
                <Input
                    disabled={isForFilters ? false: disabled}
                    value={value}
                    onChange={this.triggerChange}
                />
            )
        }
    }
}
