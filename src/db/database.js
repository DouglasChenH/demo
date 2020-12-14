const PouchDB = require('pouchdb').default;
const Credentials = require('./db_credential').default;
const PouchFind = require('pouchdb-find').default;

PouchDB.plugin(PouchFind);


export const db = new PouchDB(Credentials.cloudant_url, {
  auth: {
    username: Credentials.username,
    password: Credentials.password,
  }
});

