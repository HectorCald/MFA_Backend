const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Errores de autenticación
    if (err.name === 'UnauthorizedError' || err.status === 401) {
        return res.status(401).json({
            message: 'No autorizado',
            error: 'UNAUTHORIZED',
            details: err.message
        });
    }

    // Errores de permisos
    if (err.status === 403) {
        return res.status(403).json({
            message: 'Acceso denegado',
            error: 'FORBIDDEN',
            details: err.message
        });
    }

    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Error de validación',
            error: 'VALIDATION_ERROR',
            details: err.message
        });
    }

    // Errores de base de datos
    if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({
            message: 'El recurso ya existe',
            error: 'DUPLICATE_RESOURCE',
            details: err.detail
        });
    }

    if (err.code === '23503') { // Foreign key constraint violation
        return res.status(400).json({
            message: 'Referencia inválida',
            error: 'INVALID_REFERENCE',
            details: err.detail
        });
    }

    // Error por defecto
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
        error: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
