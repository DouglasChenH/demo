import React from 'react';
import Immutable from 'immutable';
import { Collapse } from 'antd';
import { FORM_NAME_MAP, FORM_GROUP_MAP } from '../tabs/form_list';

const { Panel } = Collapse;

function dynamicallyGeneratePanels(panelObject, onFilterValuesChange) {
    let FormComponent;
    const panels = Object.keys(panelObject).map(key => {
        if (panelObject[key].filter === false) {
            return null;
        }
        
        FormComponent = React.createElement(panelObject[key].component, {
            onValuesChange: (fieldName, fieldValue, fieldType) => onFilterValuesChange(fieldName, fieldValue, fieldType, key),
            path: key,
            title: panelObject[key].name 
        });

        return (
            <Panel header={panelObject[key].name} key={key}>
                {FormComponent}
            </Panel>
        );
    });

    return panels;
}

export function Filter({onFilterValuesChange}) {
    const formKeys = Object.keys(FORM_NAME_MAP);
    let filterPanels = [];

    // skip ICU/EEG in filters for now
    formKeys.forEach(key => 
        key !== 'EEG' && key !== 'ICU' && filterPanels.push(
            <Panel header={FORM_GROUP_MAP[key]} key={key}>
                <Collapse destroyInactivePanel expandIconPosition={"right"}>
                    {dynamicallyGeneratePanels(FORM_NAME_MAP[key], onFilterValuesChange)}
                </Collapse>
            </Panel>
        )
    );

    return (
        <Collapse destroyInactivePanel expandIconPosition={"right"}>
            {filterPanels}
            {/*
            {formKeys.map(key => 
                <Panel header={FORM_GROUP_MAP[key]} key={key}>
                    <Collapse destroyInactivePanel expandIconPosition={"right"}>
                        {dynamicallyGeneratePanels(FORM_NAME_MAP[key], onFilterValuesChange)}
                    </Collapse>
                </Panel>
            )}
            */}
        </Collapse>
    );
}

export default Filter;