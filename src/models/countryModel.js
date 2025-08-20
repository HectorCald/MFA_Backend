const db = require('../config/db');

class CountryModel {
    /**
     * Obtener todos los países
     * @returns {Promise<Array>} Array con los países
     */
    static async getAllCountries() {
        try {
            console.log('🔍 Ejecutando query: SELECT id, name, code FROM countries ORDER BY name ASC');
            const query = 'SELECT id, name, iso_alpha2, iso_alpha3, phone_code FROM country ORDER BY name ASC';
            const result = await db.query(query);
            console.log('✅ Query ejecutada exitosamente, filas encontradas:', result.rows.length);
            return result.rows;
        } catch (error) {
            console.error('❌ Error detallado en CountryModel.getAllCountries:', error);
            console.error('❌ Stack trace:', error.stack);
            throw new Error(`Error al obtener los países: ${error.message}`);
        }
    }

    /**
     * Obtener un país por ID
     * @param {number} id - ID del país
     * @returns {Promise<Object|null>} País o null si no existe
     */
    static async getCountryById(id) {
        try {
            const query = 'SELECT id, name, code FROM country WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en CountryModel.getCountryById:', error);
            throw new Error('Error al obtener el país');
        }
    }

    /**
     * Buscar un país por nombre
     * @param {string} name - Nombre del país
     * @returns {Promise<Object|null>} País o null si no existe
     */
    static async getCountryByName(name) {
        try {
            const query = 'SELECT id, name, code FROM country WHERE name ILIKE $1';
            const result = await db.query(query, [`%${name}%`]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en CountryModel.getCountryByName:', error);
            throw new Error('Error al buscar el país');
        }
    }

    /**
     * Buscar un país por código
     * @param {string} code - Código del país (ej: BO, US, etc.)
     * @returns {Promise<Object|null>} País o null si no existe
     */
    static async getCountryByCode(code) {
        try {
            const query = 'SELECT id, name, code FROM country WHERE code = $1';
            const result = await db.query(query, [code.toUpperCase()]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en CountryModel.getCountryByCode:', error);
            throw new Error('Error al buscar el país por código');
        }
    }
}

module.exports = CountryModel; 