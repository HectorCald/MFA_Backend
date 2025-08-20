const PermissionModel = require('../models/permissionModel');

class PermissionController {
    // Obtener todos los permisos
    static async getAllPermissions(req, res) {
        try {
            const permissions = await PermissionModel.getAll();
            res.json({
                success: true,
                data: permissions,
                message: 'Permisos obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en PermissionController.getAllPermissions:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}
module.exports = PermissionController;