const RoleTypeModel = require('../models/roleTypeModel');

class RoleTypeController {
    static async getAllTypes(req, res) {
        try {
            console.log('🔍 Obteniendo todos los tipos de roles');
            
            const roleTypes = await RoleTypeModel.getAll();
            
            console.log(`✅ Se encontraron ${roleTypes.length} tipos de roles`);
            
            res.status(200).json({
                success: true,
                message: 'Tipos de roles obtenidos exitosamente',
                data: roleTypes,
                count: roleTypes.length
            });
        } catch (error) {
            console.error('❌ Error en RoleTypeController.getAllTypes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener los tipos de roles',
                error: error.message
            });
        }
    }

    static async getTypeById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del tipo de rol es requerido'
                });
            }

            console.log(`🔍 Buscando tipo de rol con ID: ${id}`);
            
            const roleType = await RoleTypeModel.getById(id);
            
            if (!roleType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de rol no encontrado'
                });
            }

            console.log(`✅ Tipo de rol encontrado: ${roleType.name}`);
            
            res.status(200).json({
                success: true,
                message: 'Tipo de rol obtenido exitosamente',
                data: roleType
            });
        } catch (error) {
            console.error('❌ Error en RoleTypeController.getTypeById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener el tipo de rol',
                error: error.message
            });
        }
    }

    static async getTypeByName(req, res) {
        try {
            const { name } = req.query;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del tipo de rol es requerido'
                });
            }

            console.log(`🔍 Buscando tipo de rol con nombre: ${name}`);
            
            const roleType = await RoleTypeModel.getByName(name);
            
            if (!roleType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de rol no encontrado'
                });
            }

            console.log(`✅ Tipo de rol encontrado: ${roleType.name}`);
            
            res.status(200).json({
                success: true,
                message: 'Tipo de rol obtenido exitosamente',
                data: roleType
            });
        } catch (error) {
            console.error('❌ Error en RoleTypeController.getTypeByName:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener el tipo de rol',
                error: error.message
            });
        }
    }
}

module.exports = RoleTypeController; 