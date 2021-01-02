import XLSX from 'xlsx';
import Immutable from "immutable";
import { FORM_NAME_TRANSLATOR } from '../tabs/form_list';
import { extractFormKeyfromDocKey, formatExcelRowData } from './mixin';

function Workbook() {
    if (!(this instanceof Workbook))
        return new Workbook()

    this.SheetNames = []

    this.Sheets = {}
}

const download = (url, name) => {
    let a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()

    window.URL.revokeObjectURL(url)
}


function s2ab(s) {
    const buf = new ArrayBuffer(s.length)

    const view = new Uint8Array(buf)

    for (let i=0; i !== s.length; ++i)
        view[i] = s.charCodeAt(i) & 0xFF

    return buf
}

export function exportToExcel(rawData) {
    let excelData = Immutable.Map();

    //  data = {
    //     'basic_info': data,
    //     'single': [{
    //         "name": "pikachu",
    //         "category": "pokemon"
    //     }, {
    //         "name": "Arbok",
    //         "category": "pokemon"
    //     }, {
    //         "name": "Eevee",
    //         "category": "pokemon"
    //     }]
    // }

    rawData.forEach((categorizedDocs, patientID) => {
        const patientInfo = categorizedDocs.get('general').find(doc => doc.get("_id") === `patient_info:user_${patientID}`)
        
        // key is the ICU time, value is the list of usage at this time
        let ICUTimeAndUsage = Immutable.Map();
        let rowGeneralData = Immutable.OrderedMap({
            '病案号': patientID
        });
        // each sheet starts with the patient info
        rowGeneralData = rowGeneralData.merge(patientInfo.get('data'));
        const dynamicSheetGeneralData = rowGeneralData;

        categorizedDocs.forEach((docs, type) => {
            if (type === 'general') {
                docs.forEach(doc => {
                    if (doc.get("_id") !== `patient_info:user_${patientID}`) {
                        rowGeneralData = rowGeneralData.merge(doc.get('data'));
                    }
                });
            }
            if (type === 'dynamic') {
                docs.forEach(doc => {
                    const dynamicRows = doc.get('data').map(row => 
                        formatExcelRowData(dynamicSheetGeneralData.merge(row))
                    );
                    const sheetKey = extractFormKeyfromDocKey(doc.get("_id"));
                    // add the dynamic data to the excel
                    let sheetData = excelData.get(sheetKey, Immutable.List());
                    
                    sheetData = sheetData.concat(dynamicRows);
                    excelData = excelData.set(sheetKey, sheetData);
                });
            }
            if (type === 'mixed') {
                docs.forEach(doc => {
                    const generalData = doc.getIn(['data', 'general'], Immutable.Map());
                    const mixedSheetGeneralData =  dynamicSheetGeneralData.merge(generalData);

                    const dynamicRows = doc.getIn(['data', 'dynamic'], Immutable.List()).map(row => 
                        formatExcelRowData(mixedSheetGeneralData.merge(row))
                    );

                    const sheetKey = extractFormKeyfromDocKey(doc.get("_id"));
                    // add the dynamic data to the excel
                    let sheetData = excelData.get(sheetKey, Immutable.List());
                    
                    sheetData = sheetData.concat(dynamicRows);
                    excelData = excelData.set(sheetKey, sheetData);
                });
            }
            if (type === 'multi-dynamic' || type === 'mixed-multi-dynamic') {
                docs.forEach(doc => {
                    let ICUData;
                    let ICUTime;

                    if (type === 'multi-dynamic') {
                        ICUData = doc.get('data', Immutable.Map());
                    }
                    else {
                        ICUData = doc.getIn(['data', 'dynamic'], Immutable.Map());
                    }

                    ICUData.forEach((data, variable) => {
                        data.forEach(variableData => {
                            ICUTime = variableData.get('ICU时间点');
                            
                            if (ICUTime) {
                                ICUTimeAndUsage = ICUTimeAndUsage.setIn([ICUTime, variable], variableData.get(variable));
                            } 
                        })
                    })
                })
            }
            if (type === 'nested') {
                docs.forEach(doc => {
                    let dynamicRows = Immutable.List();
                    
                    doc.get('data').forEach(EEGForm => {
                        // patient info + each EEG basic info
                        let nestedFormRowGeneralData = dynamicSheetGeneralData.merge(EEGForm.get('general', Immutable.Map()));

                        if (!EEGForm.get('dynamic')) {
                            dynamicRows = dynamicRows.push(nestedFormRowGeneralData);
                        }
                        else {
                            EEGForm.get('dynamic', Immutable.List()).forEach(resultForm => {
                                nestedFormRowGeneralData = nestedFormRowGeneralData.merge(resultForm.get('general', Immutable.Map()));
                                
                                if (!resultForm.get('dynamic')) {
                                    dynamicRows = dynamicRows.push(nestedFormRowGeneralData);
                                }
                                else {
                                    resultForm.get('dynamic', Immutable.List()).forEach(innerForm => {
                                        dynamicRows = dynamicRows.push(
                                            nestedFormRowGeneralData.merge(innerForm.get('general', Immutable.Map()))
                                        );
                                    })
                                }
                            })
                        }
                    });

                    const sheetKey = extractFormKeyfromDocKey(doc.get("_id"));
                    // add the dynamic data to the excel
                    let sheetData = excelData.get(sheetKey, Immutable.List());
                    
                    sheetData = sheetData.concat(dynamicRows.map(row => formatExcelRowData(row)));
                    excelData = excelData.set(sheetKey, sheetData);
                });
            }
        })

        // format excel data
        let patientExcelData = Immutable.List();

        if (ICUTimeAndUsage.size > 0) {
            ICUTimeAndUsage.forEach((ICUUsageData, ICUTime) => {
                let patientRowData = Immutable.OrderedMap();
                patientRowData = patientRowData
                    .set('ICU时间点', ICUTime)
                    .merge(rowGeneralData)
                    .merge(ICUUsageData);
                patientExcelData = patientExcelData.push(formatExcelRowData(patientRowData));
            })
        }
        // all general forms
        else {
            patientExcelData = patientExcelData.push(formatExcelRowData(rowGeneralData));
        }

        // add the patient data to the excel
        let sheetData = excelData.get('general', Immutable.List());
        
        sheetData = sheetData.concat(patientExcelData);
        excelData = excelData.set('general', sheetData);
    })

     // A workbook is the name given to an Excel file
    const wb = XLSX.utils.book_new(); // make Workbook of Excel
    let sheetWS;
    let sheetName;

    excelData.forEach((sheet, sheetKey) => {
        sheetName = sheetKey === 'general' ? '静态表单' : FORM_NAME_TRANSLATOR[sheetKey];
        // replace "/" by '、' in the name
        sheetName = sheetName && sheetName.replace(/\//gi, '、');
        sheetWS = XLSX.utils.json_to_sheet(sheet.toJS());
        XLSX.utils.book_append_sheet(wb, sheetWS, sheetName);
    })

    // export Excel file
    XLSX.writeFile(wb, '病案列表.xlsx') // name of the file is 'book.xlsx'
    return;
}

export default exportToExcel;