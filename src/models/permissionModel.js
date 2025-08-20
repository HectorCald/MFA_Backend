const db = require('../config/db');

class PermissionModel {

    // Obtener todos los roles
    static async getAll() {
        try {
            const query = 'SELECT * FROM permission WHERE is_active = true ORDER BY created_at DESC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en PermissionModel.getAll:', error);
            throw error;
        }
    }
}

module.exports = PermissionModel; 