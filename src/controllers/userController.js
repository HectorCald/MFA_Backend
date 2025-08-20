const UserModel = require('../models/userModel');
const AuditLogModel = require('../models/auditLogModel');
const EventTypeModel = require('../models/eventTypeModel');

class UserController {

    // Crear usuario
    static async createUser(req, res) {
        try {
            const userData = req.body;

            // Crear el usuario
            const newUser = await UserModel.create(userData);

            // ✅ Registrar en audit log - Usuario creado
            try {
                const eventType = await EventTypeModel.findByCode('creacion');
                await AuditLogModel.create({
                    app_user_id: newUser.createdUser.id,
                    performed_by_id: req.user.id, // Usuario logueado que actualiza
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: newUser.createdUser.id,
                    event_details: {
                        id: newUser.createdUser.id,
                        name: newUser.createdUser.name,
                        email: newUser.createdUser.email,
                        comment: 'Usuario creado exitosamente'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de creación:', auditError.message);
            }

            res.status(201).json({
                success: true,
                data: newUser,
                message: 'Usuario creado exitosamente'
            });
        } catch (error) {
            console.error('❌ Error en UserController.createUser:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    }

    // Obtener todos los usuarios
    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.getAll();
            res.status(200).json(users);
        } catch (error) {
            console.error('❌ Error en UserController.getAllUsers:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                error: error.message
            });
        }
    }

    // Eliminar usuario
    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserModel.deleteById(userId);

            // ✅ Registrar en audit log - Usuario eliminado
            try {
                const eventType = await EventTypeModel.findByCode('eliminacion');
                await AuditLogModel.create({
                    app_user_id: req.params.id,
                    performed_by_id: req.user.id, // Usuario logueado que actualiza
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: req.params.id,
                    event_details: {
                        id: req.params.id,
                        name: user.deletedUser.name,
                        email: user.deletedUser.email,
                        comment: 'Usuario eliminado'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de eliminación:', auditError.message);
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('❌ Error en UserController.deleteUser:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error.message
            });
        }
    }

    // Obtener usuario por id
    static async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserModel.getUserById(userId);
            res.status(200).json(user);
        } catch (error) {
            console.error('❌ Error en UserController.getUserById:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                error: error.message
            });
        }
    }

    // Actualizar usuario
    static async updateUser(req, res) {

        try {
            const userId = req.params.id;
            const userData = req.body;
            const user = await UserModel.updateUser(userId, userData);

            // ✅ Registrar en audit log - Usuario actualizado
            try {
                const eventType = await EventTypeModel.findByCode('actualizacion');
                await AuditLogModel.create({
                    app_user_id: req.params.id,
                    performed_by_id: req.user.id, // Usuario logueado que actualiza
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: req.params.id,
                    event_details: {
                        id: req.params.id,
                        name: user.updatedUser.name,
                        email: user.updatedUser.email,
                        comment: 'Usuario actualizado'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de actualización:', auditError.message);
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('❌ Error en UserController.updateUser:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    }

    // Actualizar contraseña de usuario
    static async updateUserPassword(req, res) {
        try {
            const userId = req.params.id;
            const password = req.body.password;
            const user = await UserModel.updateUserPassword(userId, password);

            // ✅ Registrar en audit log - Usuario actualizado
            try {
                const eventType = await EventTypeModel.findByCode('cambio_password');
                await AuditLogModel.create({
                    app_user_id: req.params.id,
                    performed_by_id: req.user.id, // Usuario logueado que actualiza
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: req.params.id,
                    event_details: {
                        id: req.params.id,
                        name: user.updatedUser.name,
                        email: user.updatedUser.email,
                        comment: 'Contraseña actualizada'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de actualización:', auditError.message);
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('❌ Error en UserController.updateUserPassword:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar contraseña',
                error: error.message
            });
        }
    }

    // Desactivar usuario
    static async deactivateUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserModel.deactivateUser(userId);
            // ✅ Registrar en audit log - Usuario actualizado
            try {
                const eventType = await EventTypeModel.findByCode('desactivacion_cuenta');
                await AuditLogModel.create({
                    app_user_id: req.params.id,
                    performed_by_id: req.user.id, // Usuario logueado que actualiza
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: req.params.id,
                    event_details: {
                        id: req.params.id,
                        name: user.updatedUser.name,
                        email: user.updatedUser.email,
                        comment: 'Cuenta desactivada'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de actualización:', auditError.message);
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.error('❌ Error en UserController.deactivateUser:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desactivar usuario',
                error: error.message
            });
        }
    }

    // Activar usuario
    static async activateUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserModel.activateUser(userId);

            // ✅ Registrar en audit log - Usuario activado
            try {
                const eventType = await EventTypeModel.findByCode('activacion_cuenta');
                await AuditLogModel.create({
                    app_user_id: req.params.id,
                    performed_by_id: req.user.id, // Usuario logueado que activa
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: req.params.id,
                    event_details: {
                        id: req.params.id,
                        name: user.updatedUser.name,
                        email: user.updatedUser.email,
                        comment: 'Cuenta activada'
                    }
                });
            } catch (auditError) {
                console.log('⚠️ Error al registrar auditoría de activación:', auditError.message);
            }

            res.status(200).json(user);
        }
        catch (error) {
            console.error('❌ Error en UserController.activateUser:', error);
            res.status(500).json({
                success: false,
                message: 'Error al activar usuario',
                error: error.message
            });
        }
    }
}

module.exports = UserController;