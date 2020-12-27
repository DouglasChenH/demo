import moment from 'moment';
import Immutable from "immutable";
import { db } from '../../db/database';
import { showSuccess, showError } from './notification';
import { SPECIAL_MOMENT_FIELDS_NOT_TIME_FORMATS } from '../tabs/form_list';

// convert time string to moment
// skip other values
export function extractPatientIDfromDocKey(key) {
    return key.slice(key.indexOf(':user_') + 6);
}

// convert time string to moment
// skip other values
export function formatDocValue(value, key) {
    if (key.includes('日期') || key.includes('时间')) {
        // some fields includes '日期','时间', but is a number
        if (!Object.keys(SPECIAL_MOMENT_FIELDS_NOT_TIME_FORMATS).includes(key)) {
            return moment(value);
        }   
    }

    return value;
}

export function formatRawDocData(data) {
    let formattedData = data;
    // dynamic forms
    if (Immutable.List.isList(data)) {
        formattedData = data.map(row => 
            row.map((colValue, key) => formatDocValue(colValue, key))
        );
    }
    if (Immutable.Map.isMap(data)) {
        formattedData = data.map((colValue, key) => 
            formatDocValue(colValue, key));
    }

    return formattedData;
}

export async function fetchDataMixin(id, path, title) {
    if (!id) {
        return;
    }
    
    try {
        const doc = await db.get(`${path}:user_${id}`);
        // console.log(doc);

        return doc;
    } catch (err) {
        // console.log(err);
        if (err.error !== 'not_found') {
            showError(`病案（${id}）${title}载入失败: ${err.message}`);
        }
        
        throw err;
    }
};

export async function submitDataMixin(doc, id, title) {
    try {
        var response = await db.put(doc);

        showSuccess(`病案（${id}）${title}已更新`);
        return response.rev;
    } catch (err) {
        console.log(err);
        
        showError(`病案（${id}）${title}更新失败: ${err.message}`);
        throw err;
    }
};

export async function deleteAttachmentMixin(url, filename, fieldName) {
    try {
        // fetch the doc
        let doc = await db.get(url);

        try {
            // remove the filename
            const filenames = doc.data[fieldName];

            const index = filenames.indexOf(filename);
            const newFileList = filenames.slice();
            newFileList.splice(index, 1);

            doc.data[fieldName] = newFileList;
            var response = await db.put(doc);

            // remove the attachment
            try {
                const result = await db.removeAttachment(url, filename, response.rev);
                return result;
            } catch (err) {
                // console.log(err);
                if (err.error !== 'not_found') {
                    showError(`文件 (${filename}) 删除失败: ${err.message}`);
                }
                
                throw err;
            }
        } catch (err) {
            throw err;
        }

        
    } catch (err) {
       
    }
};