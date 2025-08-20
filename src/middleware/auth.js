const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

const requireAuth = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Token de autorización requerido',
                error: 'MISSING_TOKEN'
            });
        }

        // Extraer el token (remover "Bearer " del inicio)
        const token = authHeader.substring(7);
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Token inválido',
                error: 'INVALID_TOKEN'
            });
        }

        try {
            // Verificar el token
            const decoded = jwt.verify(token, authConfig.JWT_SECRET);
            
            // Agregar la información del usuario decodificada a req.user
            req.user = decoded;
            
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token expirado',
                    error: 'TOKEN_EXPIRED'
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Token inválido',
                    error: 'INVALID_TOKEN'
                });
            } else {
                return res.status(401).json({ 
                    message: 'Error de autenticación',
                    error: 'AUTH_ERROR'
                });
            }
        }
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor',
            error: 'INTERNAL_ERROR'
        });
    }
};

// Middleware opcional para rutas que pueden ser accedidas con o sin autenticación
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const decoded = jwt.verify(token, authConfig.JWT_SECRET);
                req.user = decoded;
            } catch (jwtError) {
                // Si el token es inválido, continuar sin usuario autenticado
                req.user = null;
            }
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = { requireAuth, optionalAuth };
