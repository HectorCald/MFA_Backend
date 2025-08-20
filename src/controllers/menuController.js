const MenuModel = require('../models/menuModel');

class MenuController {

    static async getUserMenu(req, res) {
        try {
            // req.user viene del middleware de autenticación
            const user = req.user;
            
            if (!user || !user.permissions) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'Usuario sin permisos'
                });
            }

            // Extraer IDs de permisos del usuario
            const userPermissionIds = user.permissions.map(permission => permission.id);
            
            console.log('👤 Usuario:', user.email, 'Permisos:', userPermissionIds);

            // Obtener menú según permisos
            const userMenu = await MenuModel.getUserMenu(userPermissionIds);

            res.status(200).json({
                success: true,
                data: userMenu,
                message: 'Menú obtenido correctamente'
            });

        } catch (error) {
            console.error('❌ Error en MenuController.getUserMenu:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el menú',
                error: error.message
            });
        }
    }
}

module.exports = MenuController;
