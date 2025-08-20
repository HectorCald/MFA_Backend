module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'TU_SECRETO_SUPER_SEGURO_CAMBIAR_EN_PRODUCCION',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    
    // Configuración de bloqueo por intentos fallidos
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    BLOCK_DURATION_MINUTES: parseInt(process.env.BLOCK_DURATION_MINUTES) || 15,
    
    // Configuración de contraseñas
    PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    PASSWORD_REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    PASSWORD_REQUIRE_LOWERCASE: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    PASSWORD_REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    PASSWORD_REQUIRE_SPECIAL_CHARS: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS !== 'false'
};
