export class Crud {
    constructor(dao) {
        this.dao = dao
    }
 
    createTable(sql) {
     // sql = `
     //  CREATE TABLE IF NOT EXISTS Users (
     //    id INTEGER PRIMARY KEY,
     //    name TEXT)`;
        return this.dao.run(sql);
    }
 
    insert(table, valuesObj) {
        const keys = Object.keys(valuesObj);
        const columns = keys.join(", ");
        const questionMarks = keys.map(key => "?");
        const values = Object.values(valuesObj);
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${questionMarks})`;

        return this.dao.run(sql, values);
    }
    
    update(table, valuesObj) {
        // Remove "id" fields from original object:
        const {id, ...partialObject} = valuesObj;
        const keys = Object.keys(partialObject);
        const columns = keys.map(key => `${key} = ?`).join(", ");
        const values = Object.values(partialObject).concat([valuesObj.id]);
        const sql = `UPDATE ${table} SET ${columns} WHERE id = ?`;
        
        return this.dao.run(sql, values);
    }

    delete(id) {
        return this.dao.run(
            `DELETE FROM Users WHERE id = ?`,
            [id]
        );
    }
    
    getById(table, id) {
        return this.dao.get(
          `SELECT * FROM ${table} WHERE id = ?`,
          [id]);
    }

    getAll(table) {
        return this.dao.all(`SELECT * FROM ${table}`);
    }

    dropTable(table) {
        return this.dao.run(
            `DROP TABLE IF EXISTS ${table}`,
        );
    }
}
 
export default Crud;