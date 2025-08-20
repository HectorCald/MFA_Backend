const OfficeTypeModel = require('../models/officeTypeModel');

class OfficeTypeController {
    // Obtener todos los tipos de oficina
    static async getAllOfficeTypes(req, res) {
        try {
            const officeTypes = await OfficeTypeModel.getAll();
            
            res.json({
                success: true,
                message: 'Tipos de oficina obtenidos exitosamente',
                data: officeTypes
            });
        } catch (error) {
            console.error('Error en OfficeTypeController.getAllOfficeTypes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener tipo de oficina por ID
    static async getOfficeTypeById(req, res) {
        try {
            const { id } = req.params;
            const officeType = await OfficeTypeModel.getById(id);
            
            if (!officeType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de oficina no encontrado'
                });
            }
            
            res.json({
                success: true,
                message: 'Tipo de oficina obtenido exitosamente',
                data: officeType
            });
        } catch (error) {
            console.error('Error en OfficeTypeController.getOfficeTypeById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = OfficeTypeController;
