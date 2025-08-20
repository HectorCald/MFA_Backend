const db = require('../config/db');

class CityModel {
    /**
     * Obtener todos los países
     * @returns {Promise<Array>} Array con los países
     */
    static async getAllCities() {
        try {
            console.log('🔍 Ejecutando query: SELECT id, name, code FROM cities ORDER BY name ASC');
            const query = 'SELECT id, country_id, name FROM city ORDER BY name ASC';
            const result = await db.query(query);
            console.log('✅ Query ejecutada exitosamente, filas encontradas:', result.rows.length);
            return result.rows;
        } catch (error) {
            console.error('❌ Error detallado en CityModel.getAllCities:', error);
            console.error('❌ Stack trace:', error.stack);
            throw new Error(`Error al obtener las ciudades: ${error.message}`);
        }
    }

    /**
     * Obtener una ciudad por ID
     * @param {number} id - ID de la ciudad
     * @returns {Promise<Object|null>} Ciudad o null si no existe
     */
    static async getCityById(id) {
        try {
            const query = 'SELECT id, country_id, name FROM city WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en CityModel.getCityById:', error);
            throw new Error('Error al obtener la ciudad');
        }
    }

    /**
     * Buscar una ciudad por nombre
     * @param {string} name - Nombre de la ciudad
     * @returns {Promise<Object|null>} Ciudad o null si no existe
     */
    static async getCityByName(name) {
        try {
            const query = 'SELECT id, country_id, name FROM city WHERE name ILIKE $1';
            const result = await db.query(query, [`%${name}%`]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en CityModel.getCityByName:', error);
            throw new Error('Error al buscar la ciudad');
        }
    }

    /**
     * Buscar una ciudad por código
     * @param {string} code - Código de la ciudad (ej: BO, US, etc.)
     * @returns {Promise<Object|null>} Ciudad o null si no existe
     */
    static async getCityByCode(code) {
        try {
            const query = 'SELECT id, country_id, name FROM city WHERE code = $1';
            const result = await db.query(query, [code.toUpperCase()]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en CityModel.getCityByCode:', error);
            throw new Error('Error al buscar la ciudad por código');
        }
    }

    /**
     * Buscar ciudades por ID de país
     * @param {number} countryId - ID del país
     * @returns {Promise<Array>} Array con las ciudades
     */
    static async getCityByCountryId(countryId) {
        try {
            const query = 'SELECT id, country_id, name FROM city WHERE country_id = $1 ORDER BY name ASC';
            const result = await db.query(query, [countryId]);
            return result.rows;
        } catch (error) {
            console.error('Error en CityModel.getCityByCountryId:', error);
            throw new Error('Error al buscar las ciudades por ID de país');
        }
    }
}

module.exports = CityModel;