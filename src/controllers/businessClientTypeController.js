const BusinessClientTypeModel = require('../models/businessClientTypeModel');

class BusinessClientTypeController {
    /**
     * Obtener todos los tipos de clientes empresariales
     * GET /api/business-client-types
     */
    static async getAllTypes(req, res) {
        try {
            console.log('📋 Obteniendo todos los tipos de clientes empresariales...');
            
            const types = await BusinessClientTypeModel.getAllTypes();
            
            console.log(`✅ Se encontraron ${types.length} tipos de clientes`);
            
            res.status(200).json({
                success: true,
                message: 'Tipos de clientes empresariales obtenidos exitosamente',
                data: types,
                count: types.length
            });
            
        } catch (error) {
            console.error('❌ Error en BusinessClientTypeController.getAllTypes:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener los tipos de clientes',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    }

    /**
     * Obtener un tipo de cliente por ID
     * GET /api/business-client-types/:id
     */
    static async getTypeById(req, res) {
        try {
            const { id } = req.params;
            
            console.log(`📋 Obteniendo tipo de cliente con ID: ${id}`);
            
            // Validar que el ID sea un número
            if (isNaN(id) || parseInt(id) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de tipo de cliente inválido'
                });
            }
            
            const type = await BusinessClientTypeModel.getTypeById(parseInt(id));
            
            if (!type) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de cliente no encontrado'
                });
            }
            
            console.log(`✅ Tipo de cliente encontrado: ${type.name}`);
            
            res.status(200).json({
                success: true,
                message: 'Tipo de cliente obtenido exitosamente',
                data: type
            });
            
        } catch (error) {
            console.error('❌ Error en BusinessClientTypeController.getTypeById:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener el tipo de cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    }

    /**
     * Obtener un tipo de cliente por nombre
     * GET /api/business-client-types/search?name=nombre
     */
    static async getTypeByName(req, res) {
        try {
            const { name } = req.query;
            
            console.log(`📋 Buscando tipo de cliente con nombre: ${name}`);
            
            // Validar que se proporcione el nombre
            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del tipo de cliente es requerido'
                });
            }
            
            const type = await BusinessClientTypeModel.getTypeByName(name.trim());
            
            if (!type) {
                return res.status(404).json({
                    success: false,
                    message: `Tipo de cliente con nombre "${name}" no encontrado`
                });
            }
            
            console.log(`✅ Tipo de cliente encontrado: ${type.name}`);
            
            res.status(200).json({
                success: true,
                message: 'Tipo de cliente obtenido exitosamente',
                data: type
            });
            
        } catch (error) {
            console.error('❌ Error en BusinessClientTypeController.getTypeByName:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar el tipo de cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    }
}

module.exports = BusinessClientTypeController; 