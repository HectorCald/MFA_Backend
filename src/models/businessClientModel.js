const db = require('../config/db');

class BusinessClientModel {
    static async create(businessClientData) {
        try {
            const {
                code,
                name,
                document_number,
                iata_number,
                business_client_type_id,
                centralized_payment,
                created_by,
                country_id
            } = businessClientData;

            const query = `
                INSERT INTO business_client (
                    code, name, document_number, iata_number, 
                    business_client_type_id, centralized_payment, created_by, country_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const values = [
                code, name, document_number, iata_number,
                business_client_type_id, centralized_payment, created_by, country_id
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en BusinessClientModel.create:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const query = 'SELECT * FROM business_client WHERE id = $1 AND is_active = true';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en BusinessClientModel.getById:', error);
            throw error;
        }
    }

    static async getByDocumentNumber(documentNumber, excludeId = null) {
        try {
            let query = 'SELECT * FROM business_client WHERE document_number = $1 AND is_active = true';
            let values = [documentNumber];
            
            // Si se proporciona un ID para excluir, agregarlo a la consulta
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en BusinessClientModel.getByDocumentNumber:', error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const query = 'SELECT * FROM business_client WHERE is_active = true ORDER BY created_at DESC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en BusinessClientModel.getAll:', error);
            throw error;
        }
    }
}

module.exports = BusinessClientModel; 