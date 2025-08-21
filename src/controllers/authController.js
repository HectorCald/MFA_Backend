const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');

const authModel = require('../models/authModel');
const AuditLogModel = require('../models/auditLogModel');
const EventTypeModel = require('../models/eventTypeModel');

async function getClientIP(req) {
    // Verificar headers comunes de proxies
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];

    if (cfConnectingIP) {
        // Cloudflare
        return cfConnectingIP.split(',')[0].trim();
    } else if (forwardedFor) {
        // X-Forwarded-For puede contener múltiples IPs
        return forwardedFor.split(',')[0].trim();
    } else if (realIP) {
        // X-Real-IP
        return realIP;
    } else if (req.connection && req.connection.remoteAddress) {
        // IP directa de la conexión
        const ip = req.connection.remoteAddress;
        // Si es localhost, obtener IP pública
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            return await getPublicIP();
        }
        return ip;
    } else if (req.socket && req.socket.remoteAddress) {
        // IP del socket
        const ip = req.socket.remoteAddress;
        // Si es localhost, obtener IP pública
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            return await getPublicIP();
        }
        return ip;
    } else if (req.ip) {
        // IP detectada por Express
        const ip = req.ip;
        // Si es localhost, obtener IP pública
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
            return await getPublicIP();
        }
        return ip;
    }

    // Si no se puede detectar, intentar obtener IP pública
    return await getPublicIP();
}
async function getPublicIP() {
    try {
        // Intentar obtener IP pública del servidor
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
            const data = await response.json();
            return data.ip;
        }
    } catch (error) {
        console.log('⚠️ No se pudo obtener IP pública:', error.message);
    }

    try {
        // Fallback alternativo
        const response = await fetch('https://httpbin.org/ip');
        if (response.ok) {
            const data = await response.json();
            return data.origin;
        }
    } catch (error) {
        console.log('⚠️ Fallback de IP pública falló:', error.message);
    }

    return 'N/A';
}
async function detectCountry(ip) {
    // Filtrar IPs locales y privadas
    if (!ip || ip === 'N/A' || ip === 'localhost' || ip === '127.0.0.1' ||
        ip === '::1' || ip === '::ffff:127.0.0.1' ||
        ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return 'N/A';
    }

    try {
        // Servicio 1: ip-api.com (más confiable, incluye ciudad y región)
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,country,regionName,city`);

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.countryCode) {
                const region = data.regionName || 'N/A';
                const city = data.city || 'N/A';
                return `${data.countryCode} (${data.country}) - ${region}, ${city}`;
            }
        }
    } catch (error) {
        console.log('⚠️ Error con ip-api.com:', error.message);
    }

    try {
        // Servicio 2: ipapi.co (fallback con ciudad y región)
        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        if (response.ok) {
            const data = await response.json();
            if (data.country_code) {
                const region = data.region || 'N/A';
                const city = data.city || 'N/A';
                return `${data.country_code} (${data.country_name}) - ${region}, ${city}`;
            }
        }
    } catch (error) {
        console.log('⚠️ Error con ipapi.co:', error.message);
    }

    try {
        // Servicio 3: ipinfo.io (tercer fallback)
        const response = await fetch(`https://ipinfo.io/${ip}/json`);

        if (response.ok) {
            const data = await response.json();
            if (data.country) {
                const region = data.region || 'N/A';
                const city = data.city || 'N/A';
                return `${data.country} (${data.country_name || 'N/A'}) - ${region}, ${city}`;
            }
        }
    } catch (error) {
        console.log('⚠️ Error con ipinfo.io:', error.message);
    }

    return 'N/A';
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuario con su rol y permisos en la BD
        const user = await authModel.findUserByEmail(email);
        if (!user) {

            // ✅ Registrar intento fallido - usuario no existe
            try {
                // Obtener el UUID del tipo de evento para login fallido
                const eventType = await EventTypeModel.findByCode('email_inexistente');
                if (!eventType) {
                    console.log('⚠️ Tipo de evento "login_fallido" no encontrado');
                }

                // Detectar IP real y país
                const clientIP = await getClientIP(req);
                const country = await detectCountry(clientIP);



                const auditResult = await AuditLogModel.create({
                    app_user_id: null, // Usar null en lugar de 'unknown' para campos UUID
                    performed_by_id: null,
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: null,
                    record_id: null,
                    event_details: {
                        ip: clientIP,
                        country: country,
                        username_attempted: email,
                        user_agent: req.get('User-Agent') || 'N/A'
                    }
                });
            } catch (auditError) {
                console.log('❌ Error al registrar auditoría:', auditError);
                console.log('❌ Detalles del error:', auditError.message);
                console.log('❌ Stack trace:', auditError.stack);
            }

            return res.status(401).json({ message: 'Credenciales inválidas' });
        }


        // 2. Verificar contraseña
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            // Incrementar contador de intentos fallidos
            const currentFailedAttempts = user.failed_login_attempts || 0;
            const newFailedAttempts = currentFailedAttempts + 1;

            // ✅ Actualizar el contador en la base de datos
            try {
                await authModel.updateFailedLoginAttempts(user.id, newFailedAttempts);
            } catch (updateError) {
                console.log('❌ Error al actualizar intentos fallidos:', updateError.message);
            }

            // 3. Verificar si el usuario está bloqueado
            if (user.blocked_until) {
                const now = new Date();
                const blockedUntil = new Date(user.blocked_until);

                // Si el bloqueo ya expiró, resetear el usuario y continuar con login
                if (now >= blockedUntil) {
                    console.log(`⏰ Bloqueo expirado para usuario ${user.id}. Hora actual: ${now}, Bloqueado hasta: ${blockedUntil}`);
                    try {
                        // Resetear bloqueo e intentos fallidos
                        const resetResult = await authModel.resetUserAfterBlock(user.id);
                        
                        // Continuar con el login normal (salir de toda la lógica de contraseña incorrecta)
                        // No hacer nada más aquí, el flujo continúa abajo
                    } catch (resetError) {
                        console.log('❌ Error al resetear usuario después del bloqueo:', resetError.message);
                        console.log('❌ Stack trace:', resetError.stack);
                    }
                } else {
                    // El usuario sigue bloqueado, registrar en audit log y retornar error
                    try {
                        const eventType = await EventTypeModel.findByCode('login_failed');
                        const clientIP = await getClientIP(req);
                        const country = await detectCountry(clientIP);

                        await AuditLogModel.create({
                            app_user_id: user.id,
                            performed_by_id: user.id,
                            event_date_id: new Date(),
                            event_type_id: eventType ? eventType.id : null,
                            table_name: 'app_user',
                            record_id: user.id,
                            event_details: {
                                ip: clientIP,
                                country: country,
                                username_attempted: email,
                                comment: 'Usuario bloqueado'
                            }
                        });
                    } catch (auditError) {
                        console.log('❌ Error al registrar auditoría de usuario bloqueado:', auditError.message);
                    }
                    
                    return res.status(423).json({
                        message: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos',
                        blocked_until: user.blocked_until
                    });
                }
            }

            // Solo continuar con la lógica de bloqueo si NO se reseteó el usuario
            if (newFailedAttempts >= 5 && (!user.blocked_until || new Date() >= new Date(user.blocked_until))) {
                try {
                    // Bloquear usuario por 15 minutos
                    const blockedUser = await authModel.blockUser(user.id);
                    console.log(`🚫 Usuario ${user.id} bloqueado hasta: ${blockedUser.blocked_until}`);

                    // ✅ Registrar bloqueo de usuario
                    try {
                        const eventType = await EventTypeModel.findByCode('login_failed');
                        const clientIP = await getClientIP(req);
                        const country = await detectCountry(clientIP);

                        await AuditLogModel.create({
                            app_user_id: user.id,
                            performed_by_id: user.id,
                            event_date_id: new Date(),
                            event_type_id: eventType ? eventType.id : null,
                            table_name: 'app_user',
                            record_id: user.id,
                            event_details: {
                                ip: clientIP,
                                country: country,
                                username_attempted: email,
                                comment: 'Usuario bloqueado por 5 intentos fallidos'
                            }
                        });
                    } catch (auditError) {
                        console.log('❌ Error al registrar auditoría de bloqueo:', auditError.message);
                    }

                    return res.status(423).json({
                        message: 'Cuenta bloqueada por 15 minutos por múltiples intentos fallidos',
                        blocked_until: blockedUser.blocked_until,
                        failed_login_attempts: newFailedAttempts
                    });
                } catch (blockError) {
                    console.log('❌ Error al bloquear usuario:', blockError.message);
                }
            }

            // ✅ Registrar intento fallido - contraseña incorrecta
            try {
                // Obtener el UUID del tipo de evento para contraseña incorrecta
                const eventType = await EventTypeModel.findByCode('contraseña_incorrecta');

                // Detectar IP real y país
                const clientIP = await getClientIP(req);
                const country = await detectCountry(clientIP);

                const auditResult = await AuditLogModel.create({
                    app_user_id: user.id,
                    performed_by_id: user.id,
                    event_date_id: new Date(),
                    event_type_id: eventType ? eventType.id : null,
                    table_name: 'app_user',
                    record_id: user.id,
                    event_details: {
                        ip: clientIP,
                        country: country,
                        username_attempted: email,
                        comment: 'Contraseña incorrecta ' + newFailedAttempts + ' intentos fallidos'
                    }
                });

            } catch (auditError) {
                console.log('❌ Error al registrar auditoría:', auditError);
                console.log('❌ Detalles del error:', auditError.message);
                console.log('❌ Stack trace:', auditError.stack);
            }

            return res.status(401).json({
                message: 'Credenciales inválidas',
                failed_login_attempts: newFailedAttempts
            });
        }





        // 4. Verificar si el usuario esta activo   
        if (user.status === 'inactivo') {
            // Obtener el UUID del tipo de evento para usuario inactivo
            const eventType = await EventTypeModel.findByCode('login_failed');
            // Detectar IP real y país
            const clientIP = await getClientIP(req);
            const country = await detectCountry(clientIP);


            const auditResult = await AuditLogModel.create({
                app_user_id: user.id,
                performed_by_id: user.id,
                event_date_id: new Date(),
                event_type_id: eventType ? eventType.id : null,
                table_name: null,
                record_id: user.id,
                event_details: {
                    ip: clientIP,
                    country: country,
                    username_attempted: email,
                    comment: 'Usuario inactivo'
                }
            });
            return res.status(423).json({
                message: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos de contraseña',
                is_active: user.is_active
            });
        }

        // 5. Generar token con información del rol y permisos
        const token = jwt.sign(
            {
                id: user.id,
                person_id: user.person_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role_name,
                user_type: user.user_type,
                permissions: user.permissions
            },
            authConfig.JWT_SECRET,
            { expiresIn: authConfig.JWT_EXPIRES_IN }
        );


        // 6. Resetear completamente al usuario y registrar login exitoso
        try {
            // Resetear completamente al usuario (intentos fallidos Y bloqueo) cuando el login es exitoso
            const resetResult = await authModel.resetUserOnSuccessfulLogin(user.id);
            console.log(`✅ Usuario ${user.id} reseteado completamente en login exitoso:`, resetResult);

            // Obtener el UUID del tipo de evento para login exitoso
            const eventType = await EventTypeModel.findByCode('inicio_sesion');
            // Detectar IP real y país
            const clientIP = await getClientIP(req);
            const country = await detectCountry(clientIP);

            await AuditLogModel.create({
                app_user_id: user.id,
                performed_by_id: user.id,
                event_date_id: new Date(),
                event_type_id: eventType ? eventType.id : null,
                table_name: null,
                record_id: user.id,
                event_details: {
                    ip: clientIP,
                    country: country,
                    username_attempted: email,
                    comment: 'Inicio de sesión exitoso'
                }
            });
        } catch (auditError) {
            console.log('⚠️ Error al registrar auditoría:', auditError);
        }

        // 7. Responder con token y información del usuario
        res.json({
            token,
            user: {
                id: user.id,
                person_id: user.person_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role_name,
                user_type: user.user_type,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = { login };