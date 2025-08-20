const RoleModel = require('../models/roleModel');
const AuditLogModel = require('../models/auditLogModel');
const EventTypeModel = require('../models/eventTypeModel');

class RoleController {
    // Obtener todas las personas con información de país y ciudad
    static async getAllRoles(req, res) {
        try {
            const roles = await RoleModel.getAll();
            res.json({
                success: true,
                data: roles,
                message: 'Roles obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en RoleController.getAllRoles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Verificar si existe un rol con el código
    static async codeExists(req, res) {
        try {
            const { code } = req.params;
            const exists = await RoleModel.codeExists(code);
            res.json({
                success: true,
                data: { exists },
                message: exists ? 'El código ya existe' : 'El código está disponible'
            });
        } catch (error) {
            console.error('Error en RoleController.codeExists:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Verificar si existe un rol con el nombre
    static async checkNameExists(req, res) {
        try {
            const { name } = req.params;
            const exists = await RoleModel.nameExists(name);
            res.json({
                success: true,
                data: { exists },
                message: exists ? 'El nombre ya existe' : 'El nombre está disponible'
            });
        } catch (error) {
            console.error('Error en RoleController.checkNameExists:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear un nuevo rol
    static async createRole(req, res) {
        try {
            const { nombreRol, codigoRol, isActiveRol, permisosSeleccionados, created_by } = req.body;


            // Crear el rol
            const roleData = {
                name: nombreRol.trim(),
                code: codigoRol.trim(),
                is_active: isActiveRol !== undefined ? isActiveRol : true,
                permissions: permisosSeleccionados || [],
                created_by: created_by
            };

            const newRole = await RoleModel.createRole(roleData);

            // ✅ Registrar en audit log - Usuario creado
            try {
                const eventType = await EventTypeModel.findByCode('creacion');
                await AuditLogModel.create({
                    app_user_id: newRole.created_by,
                    performed_by_id: req.user.id,
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'role',
                    record_id: newRole.id,
                    event_details: {
                        id: newRole.id,
                        comment: 'Rol creado exitosamente'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de creación:', auditError.message);
            }

            res.status(201).json({
                success: true,
                data: newRole,
                message: 'Rol creado exitosamente'
            });

        } catch (error) {
            console.error('Error en RoleController.createRole:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar un rol
    static async deleteRole(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del rol es requerido'
                });
            }

            const deletedRole = await RoleModel.deleteRole(id);

            // ✅ Registrar en audit log - Rol eliminado
            try {
                const eventType = await EventTypeModel.findByCode('eliminacion');
                await AuditLogModel.create({
                    app_user_id: deletedRole.created_by,
                    performed_by_id: req.user.id,
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'role',
                    record_id: deletedRole.id,
                    event_details: {
                        id: deletedRole.id,
                        comment: 'Rol eliminado exitosamente'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de eliminación:', auditError.message);
            }

            res.json({
                success: true,
                data: deletedRole,
                message: 'Rol eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error en RoleController.deleteRole:', error);

            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener información completa de un rol por ID
    static async getRoleById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del rol es requerido'
                });
            }

            const role = await RoleModel.getRoleById(id);

            res.json({
                success: true,
                data: role,
                message: 'Rol obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error en RoleController.getRoleById:', error);

            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar un rol existente
    static async updateRole(req, res) {
        try {
            console.log('Datos recibidos en updateRole:', req.body);
            const { id } = req.params;
            const { nombreRol, codigoRol, isActiveRol, permisosSeleccionados, updated_by } = req.body;

            // Validaciones básicas
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del rol es requerido'
                });
            }

            if (!nombreRol || !codigoRol) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre y código del rol son requeridos'
                });
            }

            // Verificar que el rol existe
            const existingRole = await RoleModel.getRoleById(id);
            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            // Verificar que no exista el nombre (excluyendo el rol actual)
            const nameExists = await RoleModel.nameExists(nombreRol);
            if (nameExists && nombreRol !== existingRole.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un rol con este nombre'
                });
            }

            // Verificar que no exista el código (excluyendo el rol actual)
            const codeExists = await RoleModel.codeExists(codigoRol);
            if (codeExists && codigoRol !== existingRole.code) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un rol con este código'
                });
            }

            // Preparar datos para actualización
            const roleData = {
                name: nombreRol.trim(),
                code: codigoRol.trim(),
                is_active: isActiveRol !== undefined ? isActiveRol : true,
                permissions: permisosSeleccionados || [],
                updated_by: updated_by
            };

            // Actualizar el rol
            const updatedRole = await RoleModel.updateRole(id, roleData);

            // ✅ Registrar en audit log - Rol actualizado
            try {
                const eventType = await EventTypeModel.findByCode('modificacion');
                await AuditLogModel.create({
                    app_user_id: updatedRole.created_by,
                    performed_by_id: req.user.id,
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'role',
                    record_id: updatedRole.id,
                    event_details: {
                        id: updatedRole.id,
                        name: updatedRole.name,
                        code: updatedRole.code,
                        permissions: updatedRole.permissions,
                        comment: 'Rol actualizado exitosamente'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de actualización:', auditError.message);
            }

            res.json({
                success: true,
                data: updatedRole,
                message: 'Rol actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error en RoleController.updateRole:', error);

            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Cambiar estado activo/inactivo de un rol
    static async toggleRoleStatus(req, res) {
        try {
            console.log('Datos recibidos en toggleRoleStatus:', req.body);
            const { id } = req.params;
            const { isActive, updated_by } = req.body;

            // Validaciones básicas
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del rol es requerido'
                });
            }

            if (isActive === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado del rol es requerido'
                });
            }

            // Verificar que el rol existe
            const existingRole = await RoleModel.getRoleById(id);
            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            // No permitir desactivar el rol super_admin
            if (existingRole.code === 'super_admin' && !isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'No es posible desactivar el rol super_admin'
                });
            }

            // Cambiar el estado del rol
            const updatedRole = await RoleModel.toggleRoleStatus(id, isActive, updated_by);

            // ✅ Registrar en audit log - Estado del rol cambiado
            try {
                const eventType = await EventTypeModel.findByCode('modificacion');
                await AuditLogModel.create({
                    app_user_id: updatedRole.created_by,
                    performed_by_id: req.user.id,
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'role',
                    record_id: updatedRole.id,
                    event_details: {
                        id: updatedRole.id,
                        name: updatedRole.name,
                        code: updatedRole.code,
                        permissions: updatedRole.permissions,
                        comment: `Rol ${isActive ? 'activado' : 'desactivado'} exitosamente`
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de cambio de estado:', auditError.message);
            }

            res.json({
                success: true,
                data: updatedRole,
                message: `Rol ${isActive ? 'activado' : 'desactivado'} exitosamente`
            });

        } catch (error) {
            console.error('Error en RoleController.toggleRoleStatus:', error);

            if (error.message === 'Rol no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}
module.exports = RoleController;