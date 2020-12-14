// const Database = window.require('better-sqlite3');
// var db = new PouchDB('todos');
// var PouchDB = require('pouchdb');
// let Credentials = require('./db_credential');

export class AppDAO {
    constructor(dbFilePath) {
        // this.db = new Database(dbFilePath);
    }
    
    // info() {
    //     this.db.info().then(function (info) {
    //       console.log(info);
    //     })
    // }
    
    // // Create a new document
    // put() {
    //     try {
    //       var response = await this.db.put({
    //         _id: 'mydoc',
    //         title: 'Heroes'
    //       });
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }
    // // Update a new document
    // update() {
    //     try {
    //       var doc = await db.get('mydoc');
    //       var response = await db.put({
    //         _id: 'mydoc',
    //         _rev: doc._rev,
    //         title: "Let's Dance"
    //       });
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // // Create a new document and let PouchDB auto-generate an _id for it.
    // post() {
    //     try {
    //       var response = await db.post({
    //         title: 'Ziggy Stardust'
    //       });
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // get(docId) {
    //     try {
    //       var doc = await db.get('mydoc');
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // delete() {
    //     try {
    //       var doc = await db.get('mydoc');
    //       var response = await db.remove(doc);
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // // Create, update or delete multiple documents.
    // putBulk() {
    //     try {
    //       var result = await db.bulkDocs([
    //         {title : 'Lisa Says', _id: 'doc1'},
    //         {title : 'Space Oddity', _id: 'doc2'}
    //       ]);
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // postBulk() {
    //     try {
    //       var result = await db.bulkDocs([
    //         {title : 'Lisa Says'},
    //         {title : 'Space Oddity'}
    //       ]);
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // updateBulk() {
    //     try {
    //       var result = await db.bulkDocs([
    //         {
    //           title  : 'Lisa Says',
    //           artist : 'Velvet Underground',
    //           _id    : "doc1",
    //           _rev   : "1-84abc2a942007bee7cf55007cba56198"
    //         },
    //         {
    //           title  : 'Space Oddity',
    //           artist : 'David Bowie',
    //           _id    : "doc2",
    //           _rev   : "1-7b80fc50b6af7a905f368670429a757e"
    //         }
    //       ]);
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // deleteBulk() {
    //     try {
    //       var result = await db.bulkDocs([
    //         {
    //           title    : 'Lisa Says',
    //           _deleted : true,
    //           _id      : "doc1",
    //           _rev     : "1-84abc2a942007bee7cf55007cba56198"
    //         },
    //         {
    //           title    : 'Space Oddity',
    //           _deleted : true,
    //           _id      : "doc2",
    //           _rev     : "1-7b80fc50b6af7a905f368670429a757e"
    //         }
    //       ]);
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // getBulk() {
    //     try {
    //       var result = await db.allDocs({
    //         include_docs: true,
    //         attachments: true
    //       });
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }
    // /*
    //  * You can do prefix search in allDocs() 
    //  * – i.e. “give me all the documents whose _ids start with 'foo'” 
    //  * – by using the special high Unicode character '\ufff0':
    // */
    // prefixSearch() {
    //     try {
    //       var result = await db.allDocs({
    //         include_docs: true,
    //         attachments: true,
    //         startkey: 'foo',
    //         endkey: 'foo\ufff0'
    //       });
    //     } catch (err) {
    //       console.log(err);
    //     }
    // }

    // run(sql, params = []) {
    //     const stmt = this.db.prepare(sql);

    //     return stmt.run(params);
    // }
 
    // get(sql, params = []) {
    //     const stmt = this.db.prepare(sql);

    //     return stmt.get(params);
    // }
 
    // all(sql, params = []) {
    //     const stmt = this.db.prepare(sql);

    //     return stmt.all(params);
    // }

}
 
export default AppDAO