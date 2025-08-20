const db = require('../config/db');

class BusinessClientTypeModel {
    /**
     * Obtener todos los tipos de clientes empresariales
     * @returns {Promise<Array>} Array con los tipos de clientes
     */
    static async getAllTypes() {
        try {
            const query = 'SELECT id, name FROM business_client_type ORDER BY name ASC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en BusinessClientTypeModel.getAllTypes:', error);
            throw new Error('Error al obtener los tipos de clientes empresariales');
        }
    }

    /**
     * Obtener un tipo de cliente por ID
     * @param {number} id - ID del tipo de cliente
     * @returns {Promise<Object|null>} Tipo de cliente o null si no existe
     */
    static async getTypeById(id) {
        try {
            const query = 'SELECT id, name FROM business_client_type WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en BusinessClientTypeModel.getTypeById:', error);
            throw new Error('Error al obtener el tipo de cliente empresarial');
        }
    }

    /**
     * Obtener un tipo de cliente por nombre
     * @param {string} name - Nombre del tipo de cliente
     * @returns {Promise<Object|null>} Tipo de cliente o null si no existe
     */
    static async getTypeByName(name) {
        try {
            const query = 'SELECT id, name FROM business_client_type WHERE name = $1';
            const result = await db.query(query, [name]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en BusinessClientTypeModel.getTypeByName:', error);
            throw new Error('Error al obtener el tipo de cliente empresarial por nombre');
        }
    }
}

module.exports = BusinessClientTypeModel; 