const db = require('../config/db');

async function findUserByEmail(email) {
    console.log('🔍 Buscando persona con email:', email);

    // Primero buscar en la tabla person por email
    const personQuery = `
        SELECT 
            person.id as person_id,
            person.first_name,
            person.last_name,
            person.email,
            person.is_active
        FROM person
        WHERE person.email = $1 AND person.is_active = true
    `;

    const personResult = await db.query(personQuery, [email]);

    if (!personResult.rows[0]) {
        console.log('❌ Persona no encontrada o inactiva');
        return null; // Persona no encontrada o inactiva
    }

    const person = personResult.rows[0];

    // Ahora buscar en app_user usando el person_id
    const userQuery = `
        SELECT 
            app_user.id, 
            app_user.person_id,
            app_user.password_hash,
            app_user.is_active,
            app_user.user_type,
            app_user.failed_login_attempts,
            app_user.blocked_until,
            role.name as role_name,
            role.id as role_id,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', permission.id,
                        'code', permission.code
                    )
                ) FILTER (WHERE permission.id IS NOT NULL),
                '[]'::json
            ) as permissions
        FROM app_user
        JOIN app_user_role ON app_user.id = app_user_role.app_user_id
        JOIN role ON app_user_role.role_id = role.id
        LEFT JOIN role_permission ON role.id = role_permission.role_id
        LEFT JOIN permission ON role_permission.permission_id = permission.id
        WHERE app_user.person_id = $1
        GROUP BY app_user.id, app_user.person_id, app_user.password_hash, app_user.is_active, 
                 app_user.user_type, app_user.failed_login_attempts, app_user.blocked_until, 
                 role.name, role.id
    `;

    const userResult = await db.query(userQuery, [person.person_id]);

    if (!userResult.rows[0]) {
        return null; // Usuario no encontrado o inactivo
    }

    const user = userResult.rows[0];


    // Combinar información de person y app_user
    return {
        id: user.id,
        person_id: user.person_id,
        email: person.email,
        first_name: person.first_name,
        last_name: person.last_name,
        password_hash: user.password_hash,
        user_type: user.user_type,
        is_active: user.is_active,
        role_name: user.role_name,
        role_id: user.role_id,
        permissions: user.permissions,
        failed_login_attempts: user.failed_login_attempts,
        blocked_until: user.blocked_until
    };
}
async function updateFailedLoginAttempts(userId, failedAttempts) {
    const query = `
        UPDATE app_user 
        SET failed_login_attempts = $1, 
            updated_at = NOW()
        WHERE id = $2
        RETURNING id, failed_login_attempts, updated_at
    `;
    
    const result = await db.query(query, [failedAttempts, userId]);
    return result.rows[0];
}

async function blockUser(userId) {
    // Calcular hora actual + 15 minutos
    const now = new Date();
    const blockedUntil = new Date(now.getTime() + (15 * 60 * 1000)); // +15 minutos
    
    const query = `
        UPDATE app_user 
        SET blocked_until = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING id, blocked_until, updated_at
    `;
    
    const result = await db.query(query, [blockedUntil, userId]);
    return result.rows[0];
}
async function resetUserAfterBlock(userId) {
    console.log(`🔄 Intentando resetear usuario ${userId}...`);
    
    const query = `
        UPDATE app_user 
        SET blocked_until = NULL,
            failed_login_attempts = 0,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, failed_login_attempts, blocked_until, updated_at
    `;
    
    try {
        console.log(`🔍 Ejecutando query:`, query);
        console.log(`🔍 Parámetros:`, [userId]);
        
        const result = await db.query(query, [userId]);
        
        if (result.rows.length === 0) {
            console.log(`⚠️ No se encontró usuario ${userId} para resetear`);
            return null;
        }
        
        console.log(`✅ Usuario ${userId} reseteado exitosamente:`, {
            id: result.rows[0].id,
            failed_login_attempts: result.rows[0].failed_login_attempts,
            blocked_until: result.rows[0].blocked_until,
            updated_at: result.rows[0].updated_at
        });
        
        return result.rows[0];
    } catch (error) {
        console.log(`❌ Error al resetear usuario ${userId}:`, error.message);
        console.log(`❌ Stack trace:`, error.stack);
        throw error;
    }
}

async function resetUserOnSuccessfulLogin(userId) {
    console.log(`🔄 Reseteando usuario ${userId} en login exitoso...`);
    
    const query = `
        UPDATE app_user 
        SET blocked_until = NULL,
            failed_login_attempts = 0,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, failed_login_attempts, blocked_until, updated_at
    `;
    
    try {
        console.log(`🔍 Ejecutando query de reset completo:`, query);
        console.log(`🔍 Parámetros:`, [userId]);
        
        const result = await db.query(query, [userId]);
        
        if (result.rows.length === 0) {
            console.log(`⚠️ No se encontró usuario ${userId} para resetear en login exitoso`);
            return null;
        }
        
        console.log(`✅ Usuario ${userId} reseteado completamente en login exitoso:`, {
            id: result.rows[0].id,
            failed_login_attempts: result.rows[0].failed_login_attempts,
            blocked_until: result.rows[0].blocked_until,
            updated_at: result.rows[0].updated_at
        });
        
        return result.rows[0];
    } catch (error) {
        console.log(`❌ Error al resetear usuario ${userId} en login exitoso:`, error.message);
        console.log(`❌ Stack trace:`, error.stack);
        throw error;
    }
}

module.exports = {
    findUserByEmail,
    updateFailedLoginAttempts,
    blockUser,
    resetUserAfterBlock,
    resetUserOnSuccessfulLogin
};
