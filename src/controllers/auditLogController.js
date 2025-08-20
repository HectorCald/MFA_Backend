const AuditLogModel = require('../models/auditLogModel');

class AuditLogController {
    /**
     * Crear un nuevo registro de auditoría
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async create(req, res) {
        try {
            const auditData = req.body;
            
            // Validar datos requeridos
            if (!auditData.app_user_id || !auditData.performed_by_id || !auditData.event_type_id || !auditData.record_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: app_user_id, performed_by_id, event_type_id, record_id'
                });
            }

            // Establecer fecha por defecto si no se proporciona
            if (!auditData.event_date_id) {
                auditData.event_date_id = new Date();
            }

            const newAuditLog = await AuditLogModel.create(auditData);
            
            res.status(201).json({
                success: true,
                message: 'Registro de auditoría creado exitosamente',
                data: newAuditLog
            });
        } catch (error) {
            console.error('Error en AuditLogController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al crear el registro de auditoría'
            });
        }
    }

    // Obtener audit logs por ID de persona
    static async getAuditLogsByPersonId(req, res) {
        try {
            const { personId } = req.params;
            
            console.log('🔍 Debug - Controlador recibió personId:', personId);
            console.log('🔍 Debug - Params completos:', req.params);

            if (!personId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de persona es requerido'
                });
            }

            console.log('🔍 Debug - Llamando al modelo con personId:', personId);
            const auditLogs = await AuditLogModel.getById(personId);
            
            console.log('🔍 Debug - Modelo retornó:', auditLogs);
            console.log('🔍 Debug - Tipo de retorno:', typeof auditLogs);
            console.log('🔍 Debug - Es array:', Array.isArray(auditLogs));

            const response = {
                success: true,
                data: auditLogs,
                message: 'Audit logs obtenidos exitosamente',
                count: auditLogs.length
            };
            
            console.log('🔍 Debug - Respuesta final:', response);

            res.json(response);

        } catch (error) {
            console.error('❌ Error en AuditLogController.getAuditLogsByPersonId:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = AuditLogController;
