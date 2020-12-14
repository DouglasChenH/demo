import XLSX from 'xlsx';
import Immutable from "immutable";
import { FORM_NAME_TRANSLATOR } from '../tabs/form_list';

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
    // console.log(rawData)
    let defaultMap;
    let docKey;
    let docName;
    let docData;
    let docType
    let excelData = Immutable.Map();
    let listData = Immutable.List();

    rawData.forEach(data => {
        docKey = data.get('key'); // like "admission:user_2"
        docName = docKey.split(":")[0]; // like "admission"
        docData = data.getIn(['doc', 'data']);
        docType = data.getIn(['doc', 'type']);
        defaultMap = Immutable.OrderedMap({
            "病案号": docKey.split("_").pop()
        });

        // not supported yet
        if (docType === 'files' || docType === 'nested' || docType === 'multi-dynamic' || docType === 'mixed-multi-dynamic') {
            return;
        }
        // add 病案号
        if (docType === 'mixed') {
            docData = docData.get('dynamic').unshift(docData.get('general'));
            docData = docData.map(row => defaultMap.merge(row));
        }
        if (docType === 'dynamic') {
            docData = docData.map(row => defaultMap.merge(row));
        }
        else {
            docData = defaultMap.merge(docData);
        }

        // form exists, append new record to the list
        if (excelData.has(docName)) {
            listData = excelData.get(docName);

            // data is a list
            if (Immutable.List.isList(docData)) {
                docData.forEach(row => listData.push(row)); 
            }
            else {
                listData = listData.push(docData);
            }

            excelData = excelData.set(docName, listData);
        }
        // form doesn't exist, add new record
        else {
            // data is a list
            if (Immutable.List.isList(docData)) {
                excelData = excelData.set(docName, docData);
            }
            // data is a map
            else {
                excelData = excelData.set(docName, Immutable.List([docData]));
            }
        }
    })
    console.log(excelData.toJS())
    // data = {
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

    // A workbook is the name given to an Excel file
    const wb = XLSX.utils.book_new(); // make Workbook of Excel
    let sheetWS;
    let sheetName;

    excelData.forEach((sheet, sheetKey) => {
        sheetName = FORM_NAME_TRANSLATOR[sheetKey];
        // replace "/" by '、' in the name
        sheetName = sheetName && sheetName.replace(/\//gi, '、');
        sheetWS = XLSX.utils.json_to_sheet(sheet.toJS());
        XLSX.utils.book_append_sheet(wb, sheetWS, sheetName);
    })

    // var basicInfoWS = XLSX.utils.json_to_sheet(data.basic_info);
    // var admissionWS = XLSX.utils.json_to_sheet(data.admission);


    // // add Worksheet to Workbook
    // // Workbook contains one or more worksheets
    // XLSX.utils.book_append_sheet(wb, basicInfoWS, '基本信息') // sheetAName is name of Worksheet
    // XLSX.utils.book_append_sheet(wb, admissionWS, '入院信息')

    // export Excel file
    XLSX.writeFile(wb, '病案列表.xlsx') // name of the file is 'book.xlsx'
}

export default exportToExcel;

// export default  data => {
//     import('xlsx').then(XLSX => {
//         // const wb = new Workbook()
//         // const ws = XLSX.utils.json_to_sheet(data)

//         // wb.SheetNames.push('')
//         // wb.Sheets[''] = ws


//         // const wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})


//         // let url = window.URL.createObjectURL(new Blob([s2ab(wbout)], {type:'application/octet-stream'}))

//         // download(url, 'import.xlsx')

//          // export json to Worksheet of Excel
//       // only array possible
//       data = {
//          'basic_info': [
//                   {"name": "cat", "category": "animal"}
//                   ,{"name": "dog", "category": "animal"}
//                   ,{"name": "pig", "category": "animal"}
//                 ],
//           'single': [
//                       {"name": "pikachu", "category": "pokemon"}
//                       ,{"name": "Arbok", "category": "pokemon"}
//                       ,{"name": "Eevee", "category": "pokemon"}
//                     ]
//       }

//       var basicInfoWS = XLSX.utils.json_to_sheet(data.basic_info) 
//       var singleWS = XLSX.utils.json_to_sheet(data.single) 

//       // A workbook is the name given to an Excel file
//       var wb = XLSX.utils.book_new() // make Workbook of Excel

//       // add Worksheet to Workbook
//       // Workbook contains one or more worksheets
//       XLSX.utils.book_append_sheet(wb, basicInfoWS, '基本信息') // sheetAName is name of Worksheet
//       XLSX.utils.book_append_sheet(wb, singleWS, '单项记录')   

//       // export Excel file
//       XLSX.writeFile(wb, 'user.xlsx') // name of the file is 'book.xlsx'
//     }

//     })
// }