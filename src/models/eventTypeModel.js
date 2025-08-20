const db = require('../config/db');

class EventTypeModel {
    /**
     * Obtener todos los tipos de eventos activos
     * @returns {Promise<Array>} Lista de tipos de eventos
     */
    static async findAllActive() {
        try {
            const query = `
                SELECT id, code, name, is_active, created_at, created_by
                FROM event_type
                WHERE is_active = true
                ORDER BY name
            `;
            
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en EventTypeModel.findAllActive:', error);
            throw error;
        }
    }

    /**
     * Obtener un tipo de evento por su código
     * @param {string} code - Código del tipo de evento
     * @returns {Promise<Object|null>} Tipo de evento encontrado
     */
    static async findByCode(code) {
        try {
            const query = `
                SELECT id, code, name, is_active, created_at, created_by
                FROM event_type
                WHERE code = $1 AND is_active = true
            `;
            
            const result = await db.query(query, [code]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en EventTypeModel.findByCode:', error);
            throw error;
        }
    }

    /**
     * Obtener un tipo de evento por su ID
     * @param {string} id - ID del tipo de evento
     * @returns {Promise<Object|null>} Tipo de evento encontrado
     */
    static async findById(id) {
        try {
            const query = `
                SELECT id, code, name, is_active, created_at, created_by
                FROM event_type
                WHERE id = $1 AND is_active = true
            `;
            
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en EventTypeModel.findById:', error);
            throw error;
        }
    }

    /**
     * Crear un nuevo tipo de evento
     * @param {Object} eventTypeData - Datos del tipo de evento
     * @returns {Promise<Object>} Tipo de evento creado
     */
    static async create(eventTypeData) {
        try {
            const query = `
                INSERT INTO event_type (code, name, created_by)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            
            const values = [
                eventTypeData.code,
                eventTypeData.name,
                eventTypeData.created_by
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en EventTypeModel.create:', error);
            throw error;
        }
    }

    /**
     * Actualizar un tipo de evento
     * @param {string} id - ID del tipo de evento
     * @param {Object} eventTypeData - Datos a actualizar
     * @returns {Promise<Object>} Tipo de evento actualizado
     */
    static async update(id, eventTypeData) {
        try {
            const query = `
                UPDATE event_type
                SET code = $1, name = $2, is_active = $3
                WHERE id = $4
                RETURNING *
            `;
            
            const values = [
                eventTypeData.code,
                eventTypeData.name,
                eventTypeData.is_active,
                id
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en EventTypeModel.update:', error);
            throw error;
        }
    }

    /**
     * Desactivar un tipo de evento (soft delete)
     * @param {string} id - ID del tipo de evento
     * @returns {Promise<Object>} Tipo de evento desactivado
     */
    static async deactivate(id) {
        try {
            const query = `
                UPDATE event_type
                SET is_active = false
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en EventTypeModel.deactivate:', error);
            throw error;
        }
    }
}

module.exports = EventTypeModel;
