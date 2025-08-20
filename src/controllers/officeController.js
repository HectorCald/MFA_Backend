const OfficeModel = require('../models/officeModel');

class OfficeController {
    // Obtener todas las oficinas
    static async getAllOffices(req, res) {
        try {
            console.log('=== OBTENIENDO TODAS LAS OFICINAS ===');
            
            const offices = await OfficeModel.getAll();
            
            console.log(`✅ ${offices.length} oficinas obtenidas exitosamente`);
            
            res.status(200).json({
                success: true,
                message: 'Oficinas obtenidas exitosamente',
                data: offices
            });
            
        } catch (error) {
            console.error('Error en OfficeController.getAllOffices:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener oficinas',
                error: error.message
            });
        }
    }

    // Obtener oficina por ID
    static async getOfficeById(req, res) {
        try {
            console.log('=== OBTENIENDO OFICINA POR ID ===');
            const { id } = req.params;
            console.log('ID recibido:', id);
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de la oficina es requerido'
                });
            }

            const office = await OfficeModel.getById(id);
            
            if (!office) {
                return res.status(404).json({
                    success: false,
                    message: 'Oficina no encontrada'
                });
            }

            console.log('✅ Oficina encontrada:', office.name);
            
            res.status(200).json({
                success: true,
                message: 'Oficina obtenida exitosamente',
                data: office
            });
            
        } catch (error) {
            console.error('Error en OfficeController.getOfficeById:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener oficina',
                error: error.message
            });
        }
    }

    // Obtener oficinas por cliente empresarial
    static async getOfficesByBusinessClientId(req, res) {
        try {
            console.log('=== OBTENIENDO OFICINAS POR CLIENTE EMPRESARIAL ===');
            const { clientId } = req.params;
            console.log('ID del cliente recibido:', clientId);
            
            if (!clientId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial es requerido'
                });
            }

            const offices = await OfficeModel.getByBusinessClientId(clientId);
            
            console.log(`✅ ${offices.length} oficinas encontradas para el cliente ${clientId}`);
            
            res.status(200).json({
                success: true,
                message: 'Oficinas del cliente obtenidas exitosamente',
                data: offices
            });
            
        } catch (error) {
            console.error('Error en OfficeController.getOfficesByBusinessClientId:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener oficinas del cliente',
                error: error.message
            });
        }
    }

    // Crear nueva oficina
    static async createOffice(req, res) {
        try {
            console.log('=== CREANDO NUEVA OFICINA ===');
            const officeData = req.body;
            console.log('Datos de la oficina recibidos:', officeData);
            console.log('Tipo de datos:', typeof officeData);
            console.log('Keys del objeto:', Object.keys(officeData));
            
            // Validaciones básicas
            if (!officeData.name || !officeData.address) {
                console.log('❌ Validación fallida: name o address faltan');
                console.log('name:', officeData.name);
                console.log('address:', officeData.address);
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y dirección de la oficina son requeridos'
                });
            }

            // Validar que business_client_id esté presente
            if (!officeData.business_client_id) {
                console.log('❌ Validación fallida: business_client_id faltante');
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial es requerido'
                });
            }

            // Validar que office_type_id esté presente
            if (!officeData.office_type_id) {
                console.log('❌ Validación fallida: office_type_id faltante');
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de oficina es requerido'
                });
            }

            // TODO: Agregar validaciones adicionales según necesidades
            // Por ejemplo: validar que el tipo de oficina existe, país, ciudad, etc.

            console.log('✅ Validaciones pasadas, creando oficina...');
            const newOffice = await OfficeModel.create(officeData);
            
            console.log('✅ Oficina creada exitosamente:', newOffice.id);
            
            res.status(201).json({
                success: true,
                message: 'Oficina creada exitosamente',
                data: newOffice
            });
            
        } catch (error) {
            console.error('Error en OfficeController.createOffice:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al crear oficina',
                error: error.message
            });
        }
    }

    // Actualizar oficina
    static async updateOffice(req, res) {
        try {
            console.log('=== ACTUALIZANDO OFICINA ===');
            const { officeId } = req.params;
            const updateData = req.body;
            
            console.log('Office ID:', officeId);
            console.log('Datos a actualizar:', updateData);
            
            // Validaciones básicas
            if (!officeId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de la oficina es requerido'
                });
            }

            // Actualizar la oficina
            const updatedOffice = await OfficeModel.updateOffice(officeId, updateData);
            
            if (!updatedOffice) {
                return res.status(404).json({
                    success: false,
                    message: 'Oficina no encontrada'
                });
            }
            
            console.log('✅ Oficina actualizada exitosamente');
            console.log('Oficina actualizada:', updatedOffice);
            
            res.status(200).json({
                success: true,
                message: 'Oficina actualizada exitosamente',
                data: updatedOffice
            });
            
        } catch (error) {
            console.error('Error en OfficeController.updateOffice:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al actualizar la oficina',
                error: error.message
            });
        }
    }

    // Desactivar oficina
    static async deactivateOffice(req, res) {
        try {
            console.log('=== DESACTIVANDO OFICINA ===');
            const { id } = req.params;
            const { updatedBy } = req.body;
            console.log('ID de la oficina:', id);
            console.log('Usuario que desactiva:', updatedBy);
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de la oficina es requerido'
                });
            }

            if (!updatedBy) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario que desactiva es requerido'
                });
            }

            // Verificar que la oficina existe
            const existingOffice = await OfficeModel.getById(id);
            if (!existingOffice) {
                return res.status(404).json({
                    success: false,
                    message: 'Oficina no encontrada'
                });
            }

            // Verificar que no sea la oficina principal
            if (existingOffice.office_type_name === 'Principal') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar la oficina principal'
                });
            }

            // Eliminar la oficina de forma segura
            const result = await OfficeModel.deleteOfficeSafely(id, updatedBy);
            
            console.log('✅ Oficina eliminada exitosamente:', id);
            
            res.status(200).json({
                success: true,
                message: 'Oficina eliminada exitosamente',
                data: result
            });
            
        } catch (error) {
            console.error('Error en OfficeController.deactivateOffice:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al eliminar oficina',
                error: error.message
            });
        }
    }

    // Obtener conteo de oficinas por cliente
    static async getOfficeCountByBusinessClientId(req, res) {
        try {
            console.log('=== OBTENIENDO CONTEO DE OFICINAS POR CLIENTE ===');
            const { clientId } = req.params;
            console.log('ID del cliente recibido:', clientId);
            
            if (!clientId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial es requerido'
                });
            }

            const count = await OfficeModel.getCountByBusinessClientId(clientId);
            
            console.log(`✅ Conteo de oficinas para cliente ${clientId}: ${count}`);
            
            res.status(200).json({
                success: true,
                message: 'Conteo de oficinas obtenido exitosamente',
                data: { count }
            });
            
        } catch (error) {
            console.error('Error en OfficeController.getOfficeCountByBusinessClientId:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener conteo de oficinas',
                error: error.message
            });
        }
    }

    // Obtener roles de una oficina específica
    static async getOfficeRoles(req, res) {
        try {
            const { officeId, businessClientId } = req.params;
            console.log('=== OBTENIENDO ROLES DE LA OFICINA ===');
            console.log('Office ID:', officeId);
            console.log('Business Client ID:', businessClientId);
            
            const roles = await OfficeModel.getOfficeRoles(officeId, businessClientId);
            
            console.log('=== ROLES ENCONTRADOS ===');
            console.log('Cantidad:', roles.length);
            console.log('Roles:', roles);
            
            res.json({
                success: true,
                data: roles,
                message: 'Roles obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en OfficeController.getOfficeRoles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener los roles',
                error: error.message
            });
        }
    }

    // Asignar rol de persona en una oficina
    static async assignPersonRole(req, res) {
        try {
            console.log('=== ASIGNANDO ROL DE PERSONA EN OFICINA ===');
            const roleData = req.body;
            console.log('Datos del rol recibidos:', roleData);
            
            // Validaciones básicas
            if (!roleData.business_client_id || !roleData.person_id || !roleData.office_id || !roleData.role_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'business_client_id, person_id, office_id y role_type_id son requeridos'
                });
            }

            // Crear la relación en la tabla business_person_role
            const newRole = await OfficeModel.assignPersonRole(roleData);
            
            console.log('✅ Rol asignado exitosamente en la base de datos');
            console.log('Nueva relación creada:', newRole);
            
            res.status(201).json({
                success: true,
                message: 'Rol asignado exitosamente',
                data: newRole
            });
            
        } catch (error) {
            console.error('Error en OfficeController.assignPersonRole:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al asignar rol',
                error: error.message
            });
        }
    }
}

module.exports = OfficeController;

