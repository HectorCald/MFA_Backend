const db = require('../config/db');

class RoleTypeModel {
    static async getAll() {
        try {
            const query = 'SELECT * FROM role_type WHERE is_active = true ORDER BY name';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en RoleTypeModel.getAll:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const query = 'SELECT * FROM role_type WHERE id = $1 AND is_active = true';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en RoleTypeModel.getById:', error);
            throw error;
        }
    }

    static async getByName(name) {
        try {
            const query = 'SELECT * FROM role_type WHERE name = $1 AND is_active = true';
            const result = await db.query(query, [name]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en RoleTypeModel.getByName:', error);
            throw error;
        }
    }
}

module.exports = RoleTypeModel; 