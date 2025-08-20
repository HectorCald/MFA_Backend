const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Usuario no autenticado',
                    error: 'NOT_AUTHENTICATED'
                });
            }

            // Verificar que el usuario tenga permisos
            if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
                return res.status(403).json({ 
                    message: 'Usuario sin permisos',
                    error: 'NO_PERMISSIONS'
                });
            }

            // Verificar si el usuario tiene el permiso requerido
            const hasPermission = req.user.permissions.some(permission => 
                permission.name === requiredPermission || 
                permission.code === requiredPermission
            );

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: 'Permiso insuficiente',
                    error: 'INSUFFICIENT_PERMISSIONS',
                    required: requiredPermission,
                    userPermissions: req.user.permissions
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de permisos:', error);
            return res.status(500).json({ 
                message: 'Error interno del servidor',
                error: 'INTERNAL_ERROR'
            });
        }
    };
};

// Middleware para verificar múltiples permisos (OR lógico)
const checkAnyPermission = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Usuario no autenticado',
                    error: 'NOT_AUTHENTICATED'
                });
            }

            if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
                return res.status(403).json({ 
                    message: 'Usuario sin permisos',
                    error: 'NO_PERMISSIONS'
                });
            }

            const hasAnyPermission = requiredPermissions.some(requiredPermission => 
                req.user.permissions.some(permission => 
                    permission.name === requiredPermission || 
                    permission.code === requiredPermission
                )
            );

            if (!hasAnyPermission) {
                return res.status(403).json({ 
                    message: 'Permiso insuficiente',
                    error: 'INSUFFICIENT_PERMISSIONS',
                    required: requiredPermissions,
                    userPermissions: req.user.permissions
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de permisos:', error);
            return res.status(500).json({ 
                message: 'Error interno del servidor',
                error: 'INTERNAL_ERROR'
            });
        }
    };
};

// Middleware para verificar múltiples permisos (AND lógico)
const checkAllPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Usuario no autenticado',
                    error: 'NOT_AUTHENTICATED'
                });
            }

            if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
                return res.status(403).json({ 
                    message: 'Usuario sin permisos',
                    error: 'NO_PERMISSIONS'
                });
            }

            const hasAllPermissions = requiredPermissions.every(requiredPermission => 
                req.user.permissions.some(permission => 
                    permission.name === requiredPermission || 
                    permission.code === requiredPermission
                )
            );

            if (!hasAllPermissions) {
                return res.status(403).json({ 
                    message: 'Permiso insuficiente',
                    error: 'INSUFFICIENT_PERMISSIONS',
                    required: requiredPermissions,
                    userPermissions: req.user.permissions
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de permisos:', error);
            return res.status(500).json({ 
                message: 'Error interno del servidor',
                error: 'INTERNAL_ERROR'
            });
        }
    };
};

module.exports = { 
    checkPermission, 
    checkAnyPermission, 
    checkAllPermissions 
};
