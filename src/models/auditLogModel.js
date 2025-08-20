const db = require('../config/db');

class AuditLogModel {
    static async create(auditData) {
        try {
            const query = `
                INSERT INTO audit_log (
                    app_user_id,
                    performed_by_id,
                    event_date_id,
                    event_type_id,
                    table_name,
                    record_id,
                    event_details
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            
            const values = [
                auditData.app_user_id,
                auditData.performed_by_id,
                auditData.event_date_id,
                auditData.event_type_id,
                auditData.table_name,
                auditData.record_id,
                auditData.event_details
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en AuditLogModel.create:', error);
            throw error;
        }
    }

    // Obtener audit logs por ID de persona
    static async getById(personId) {
        try {
            console.log('🔍 Debug - Modelo recibió personId:', personId);
            
            const query = `
                SELECT 
                    al.*,
                    et.name as event_type_name,
                    p_affected.first_name as affected_first_name,
                    p_affected.last_name as affected_last_name,
                    p_affected.email as affected_email,
                    p_performer.first_name as performer_first_name,
                    p_performer.last_name as performer_last_name,
                    p_performer.email as performer_email,
                    CASE 
                        WHEN al.app_user_id = $1 THEN 'afectado'
                        WHEN al.performed_by_id = $1 THEN 'ejecutor'
                    END as user_role
                FROM audit_log al
                LEFT JOIN event_type et ON al.event_type_id = et.id
                LEFT JOIN app_user u_affected ON al.app_user_id = u_affected.id
                LEFT JOIN person p_affected ON u_affected.person_id = p_affected.id
                LEFT JOIN app_user u_performer ON al.performed_by_id = u_performer.id
                LEFT JOIN person p_performer ON u_performer.person_id = p_performer.id
                WHERE al.app_user_id = $1 OR al.performed_by_id = $1
                ORDER BY al.event_date_id DESC
            `;
        
            
            const result = await db.query(query, [personId]);
            
            
            return result.rows;
        } catch (error) {
            console.error('❌ Error en AuditLogModel.getById:', error);
            throw error;
        }
    }
}

module.exports = AuditLogModel;
