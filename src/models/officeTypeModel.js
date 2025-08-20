const db = require('../config/db');

class OfficeTypeModel {
    static async getAll() {
        const query = 'SELECT * FROM office_type WHERE is_active = true ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    }

    static async getById(id) {
        const query = 'SELECT * FROM office_type WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async getByName(name) {
        const query = 'SELECT * FROM office_type WHERE name = $1 AND is_active = true';
        const result = await db.query(query, [name]);
        return result.rows[0];
    }
}

module.exports = OfficeTypeModel; 