const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
    // Crear usuario
    static async create(personData) {
        try {
            // Insertar en person
            const query = `
                INSERT INTO person (
                    first_name, last_name, dni, dni_country_id, gender, 
                    birthdate, email, cellphone, address, 
                    postal_code, country_id, city_id, is_active, created_by, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                RETURNING *
            `;

            // Mapear género a valores permitidos por la base de datos
            const genderMapping = {
                'masculino': 'M',
                'femenino': 'F'
            };

            const values = [
                personData.nombreUsuario,           // first_name
                personData.apellidoUsuario,         // last_name
                personData.dniCiUsuario,            // dni
                personData.paisEmisionUsuario,      // dni_country_id
                genderMapping[personData.generoUsuario] || personData.generoUsuario, // gender (mapeado)
                personData.fechaNacimientoUsuario,  // birthdate
                personData.correoElectronicoUsuario, // email
                personData.telefonoUsuario,         // cellphone
                personData.direccionUsuario,        // address
                personData.codigoPostalUsuario || '0000', // postal_code
                personData.paisResidenciaUsuario,   // country_id
                personData.ciudadUsuario,           // city_id
                true,                               // is_active
                personData.created_by                // created_by (ID del usuario que crea)
            ];


            const result = await db.query(query, values);
            const personId = result.rows[0].id; // La columna se llama 'id', no 'person_id'



            // Encriptar la contraseña con bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(personData.password || '123456', saltRounds);

            // Insertar en app_user
            const query2 = `
                INSERT INTO app_user (
                    person_id, password_hash, user_type, is_active, created_by, created_at
                ) VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;

            const values2 = [
                personId,                                                           // person_id
                hashedPassword,                                                    // password_hash (encriptado)
                'interno',                                                        // user_type
                true,                                                             // is_active
                personData.created_by                                              // created_by
            ];

            const result2 = await db.query(query2, values2);

            // Insertar roles del usuario en app_user_role
            // Obtener los roles seleccionados del formulario
            const selectedRoles = [];
            for (const [key, value] of Object.entries(personData)) {
                if (key.startsWith('role_') && value === true) {
                    // Extraer el código del rol (ej: role_administrador -> administrador)
                    const roleCode = key.replace('role_', '');
                    selectedRoles.push(roleCode);
                }
            }

            console.log('🎭 Roles seleccionados:', selectedRoles);

            // Si hay roles seleccionados, insertarlos
            if (selectedRoles.length > 0) {
                // Obtener los IDs de los roles por código
                const roleQuery = `
                    SELECT id FROM role WHERE code IN (${selectedRoles.map((_, i) => `$${i + 1}`).join(',')})
                `;
                const roleResult = await db.query(roleQuery, selectedRoles);

                console.log('🔍 Roles encontrados:', roleResult.rows);

                // Insertar cada rol en app_user_role
                for (const role of roleResult.rows) {
                    const query3 = `
                        INSERT INTO app_user_role (
                            app_user_id, role_id, is_active, created_at, created_by
                        ) VALUES ($1, $2, $3, NOW(), $4)
                        RETURNING *
                    `;

                    const values3 = [
                        result2.rows[0].id,    // app_user_id
                        role.id,                // role_id
                        true,                   // is_active
                        personData.created_by   // created_by
                    ];

                    const result3 = await db.query(query3, values3);
                    console.log('✅ Rol asignado:', result3.rows[0]);
                }
            }

            return {
                success: true,
                message: 'Usuario creado correctamente',
                createdUser: {
                    id: result2.rows[0].id,  // ✅ Correcto
                    name: `${values[0]} ${values[1]}`,  // ✅ first_name + last_name
                    email: values[6]                    // ✅ email
                }
            };


        } catch (error) {
            console.error('❌ Error en UserModel.create:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios
    static async getAll() {
        try {
            const query = `
                SELECT 
                    au.id as user_id,
                    au.password_hash,
                    au.user_type,
                    au.is_active as user_is_active,
                    au.last_login_at,
                    au.failed_login_attempts,
                    au.last_failed_login_at,
                    au.blocked_until,
                    au.must_change_password,
                    au.password_updated_at,
                    au.legacy_username,
                    au.created_at as user_created_at,
                    au.updated_at as user_updated_at,
                    
                    p.id as person_id,
                    p.first_name,
                    p.last_name,
                    p.dni,
                    p.dni_country_id,
                    p.gender,
                    p.birthdate,
                    p.email,
                    p.cellphone,
                    p.address,
                    p.postal_code,
                    p.country_id,
                    p.city_id,
                    p.is_active as person_is_active,
                    p.created_at as person_created_at,
                    p.updated_at as person_updated_at,
                    
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'role_id', r.id,
                                'role_name', r.name,
                                'role_code', r.code,
                                'role_is_active', r.is_active
                            )
                        ) FILTER (WHERE r.id IS NOT NULL),
                        '[]'::json
                    ) as roles
                    
                FROM app_user au
                INNER JOIN person p ON au.person_id = p.id
                LEFT JOIN app_user_role aur ON au.id = aur.app_user_id
                LEFT JOIN role r ON aur.role_id = r.id
                GROUP BY au.id, p.id
                ORDER BY au.id
            `;

            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en UserModel.getAll:', error);
            throw error;
        }
    }

    // Obtener usuario por id
    static async getUser(userId) {
        try {
            const query = `
                SELECT 
                    au.id as user_id,
                    au.password_hash,
                    au.user_type,
                    au.is_active as user_is_active,
                    au.last_login_at,
                    au.failed_login_attempts,
                    au.last_failed_login_at,
                    au.blocked_until,
                    au.must_change_password,
                    au.password_updated_at,
                    au.legacy_username,
                    au.created_at as user_created_at,
                    au.updated_at as user_updated_at,
                    
                    p.id as person_id,
                    p.first_name,
                    p.last_name,
                    p.dni,
                    p.dni_country_id,
                    p.gender,
                    p.birthdate,
                    p.email,
                    p.cellphone,
                    p.address,
                    p.postal_code,
                    p.country_id,
                    p.city_id,
                    p.is_active as person_is_active,
                    p.created_at as person_created_at,
                    p.updated_at as person_updated_at,
                    
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'role_id', r.id,
                                'role_name', r.name,
                                'role_code', r.code,
                                'role_is_active', r.is_active
                            )
                        ) FILTER (WHERE r.id IS NOT NULL),
                        '[]'::json
                    ) as roles
                    
                FROM app_user au
                INNER JOIN person p ON au.person_id = p.id
                LEFT JOIN app_user_role aur ON au.id = aur.app_user_id
                LEFT JOIN role r ON aur.role_id = r.id
                WHERE au.id = $1
                GROUP BY au.id, p.id
            `;

            const result = await db.query(query, [userId]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error en UserModel.getUser:', error);
            throw error;
        }
    }

    // Eliminar usuario
    static async deleteById(userId) {
        try {
            // Primero verificar si el usuario existe
            const user = await this.getUser(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Iniciar transacción
            await db.query('BEGIN');

            try {
                // 1. Eliminar roles del usuario (app_user_role)
                const deleteRolesQuery = `
                    DELETE FROM app_user_role 
                    WHERE app_user_id = $1
                `;
                await db.query(deleteRolesQuery, [userId]);

                // 2. Eliminar el usuario (app_user)
                const deleteUserQuery = `
                    DELETE FROM app_user 
                    WHERE id = $1
                `;
                await db.query(deleteUserQuery, [userId]);

                // 3. Eliminar la persona asociada
                const deletePersonQuery = `
                    DELETE FROM person 
                    WHERE id = $1
                `;
                await db.query(deletePersonQuery, [user.person_id]);

                // Confirmar transacción
                await db.query('COMMIT');

                return {
                    success: true,
                    message: 'Usuario eliminado correctamente',
                    deletedUser: {
                        id: userId,
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email
                    }
                };

            } catch (error) {
                // Revertir transacción en caso de error
                await db.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('❌ Error en UserModel.deleteById:', error);
            throw error;
        }
    }

    // Obtener usuario por id
    static async getUserById(userId) {
        try {
            const query = `
                SELECT 
                    au.id as user_id,
                    au.password_hash,
                    au.user_type,
                    au.is_active as user_is_active,
                    au.last_login_at,
                    au.failed_login_attempts,
                    au.last_failed_login_at,
                    au.blocked_until,
                    au.must_change_password,
                    au.password_updated_at,
                    au.legacy_username,
                    au.created_at as user_created_at,
                    au.updated_at as user_updated_at,
                    
                    p.id as person_id,
                    p.first_name,
                    p.last_name,
                    p.dni,
                    p.dni_country_id,
                    p.gender,
                    p.birthdate,
                    p.email,
                    p.cellphone,
                    p.address,
                    p.postal_code,
                    p.country_id,
                    p.city_id,
                    p.is_active as person_is_active,
                    p.created_at as person_created_at,
                    p.updated_at as person_updated_at,
                    
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'role_id', r.id,
                                'role_name', r.name,
                                'role_code', r.code,
                                'role_is_active', r.is_active
                            )
                        ) FILTER (WHERE r.id IS NOT NULL),
                        '[]'::json
                    ) as roles
                    
                FROM app_user au
                INNER JOIN person p ON au.person_id = p.id
                LEFT JOIN app_user_role aur ON au.id = aur.app_user_id
                LEFT JOIN role r ON aur.role_id = r.id
                WHERE au.id = $1
                GROUP BY au.id, p.id
            `;

            const result = await db.query(query, [userId]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error en UserModel.getUserById:', error);
            throw error;
        }
    }

    // Actualizar usuario
    static async updateUser(userId, userData) {
        try {
            console.log('🔄 Iniciando actualización de usuario:', { userId, userData });

            // Primero verificar si el usuario existe
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            console.log('✅ Usuario encontrado:', user);

            // Iniciar transacción
            await db.query('BEGIN');
            console.log('🚀 Transacción iniciada');

            try {
                // Mapear género a valores permitidos por la base de datos
                const genderMapping = {
                    'masculino': 'M',
                    'femenino': 'F'
                };

                // 1. Actualizar tabla person
                const updatePersonQuery = `
                    UPDATE person SET 
                        first_name = $1,
                        last_name = $2,
                        dni = $3,
                        dni_country_id = $4,
                        gender = $5,
                        birthdate = $6,
                        email = $7,
                        cellphone = $8,
                        address = $9,
                        postal_code = $10,
                        country_id = $11,
                        city_id = $12,
                        updated_at = NOW()
                    WHERE id = $13
                    RETURNING *
                `;

                const personValues = [
                    userData.nombreUsuario,           // first_name
                    userData.apellidoUsuario,         // last_name
                    userData.dniCiUsuario,            // dni
                    userData.paisEmisionUsuario,      // dni_country_id
                    genderMapping[userData.generoUsuario] || userData.generoUsuario, // gender (mapeado)
                    userData.fechaNacimientoUsuario,  // birthdate
                    userData.correoElectronicoUsuario, // email
                    userData.telefonoUsuario,         // cellphone
                    userData.direccionUsuario,        // address
                    userData.codigoPostalUsuario || '0000', // postal_code
                    userData.paisResidenciaUsuario,   // country_id
                    userData.ciudadUsuario,           // city_id
                    user.person_id                    // person_id
                ];

                console.log('📝 Ejecutando actualización de persona con valores:', personValues);
                const personResult = await db.query(updatePersonQuery, personValues);
                console.log('✅ Persona actualizada:', personResult.rows[0]);

                // 2. Actualizar tabla app_user (solo campos básicos, no password)
                const updateUserQuery = `
                    UPDATE app_user SET 
                        user_type = $1,
                        is_active = $2,
                        updated_at = NOW()
                    WHERE id = $3
                    RETURNING *
                `;

                const userValues = [
                    userData.user_type || 'interno',  // user_type
                    true,                             // is_active
                    userId                            // user_id
                ];

                console.log('📝 Ejecutando actualización de usuario con valores:', userValues);
                const userResult = await db.query(updateUserQuery, userValues);
                console.log('✅ Usuario actualizado:', userResult.rows[0]);

                // 3. Actualizar roles del usuario
                // Primero eliminar todos los roles existentes
                const deleteRolesQuery = `
                    DELETE FROM app_user_role 
                    WHERE app_user_id = $1
                `;
                await db.query(deleteRolesQuery, [userId]);
                console.log('🗑️ Roles existentes eliminados');

                // Obtener los roles seleccionados del formulario
                const selectedRoles = [];
                for (const [key, value] of Object.entries(userData)) {
                    if (key.startsWith('role_') && value === true) {
                        // Extraer el código del rol (ej: role_administrador -> administrador)
                        const roleCode = key.replace('role_', '');
                        selectedRoles.push(roleCode);
                    }
                }

                console.log('🎭 Roles seleccionados para actualizar:', selectedRoles);

                // Si hay roles seleccionados, insertarlos
                if (selectedRoles.length > 0) {
                    // Obtener los IDs de los roles por código
                    const roleQuery = `
                        SELECT id FROM role WHERE code IN (${selectedRoles.map((_, i) => `$${i + 1}`).join(',')})
                    `;
                    const roleResult = await db.query(roleQuery, selectedRoles);

                    console.log('🔍 Roles encontrados para asignar:', roleResult.rows);

                    // Insertar cada rol en app_user_role
                    for (const role of roleResult.rows) {
                        const insertRoleQuery = `
                            INSERT INTO app_user_role (
                                app_user_id, role_id, is_active, created_at, created_by
                            ) VALUES ($1, $2, $3, NOW(), $4)
                            RETURNING *
                        `;

                        const roleValues = [
                            userId,                    // app_user_id
                            role.id,                   // role_id
                            true,                      // is_active
                            userData.updated_by || userData.created_by // created_by
                        ];

                        const roleInsertResult = await db.query(insertRoleQuery, roleValues);
                        console.log('✅ Rol asignado:', roleInsertResult.rows[0]);
                    }
                }

                // Confirmar transacción
                await db.query('COMMIT');

                return {
                    success: true,
                    message: 'Usuario actualizado correctamente',
                    updatedUser: {
                        id: userId,
                        name: `${userData.nombreUsuario} ${userData.apellidoUsuario}`,
                        email: userData.correoElectronicoUsuario,
                        roles: selectedRoles
                    }
                };

            } catch (error) {
                console.error('❌ Error durante la transacción:', error);
                // Revertir transacción en caso de error
                await db.query('ROLLBACK');
                console.log('🔄 Transacción revertida');
                throw error;
            }

        } catch (error) {
            console.error('❌ Error en UserModel.updateUser:', error);
            throw error;
        }
    }

    // Actualizar contraseña de usuario
    static async updateUserPassword(userId, password) {
        try {
            // Primero obtener los datos del usuario
            const user = await this.getUser(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
    
            // Encriptar la contraseña con bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            const query = `
                UPDATE app_user SET 
                    password_hash = $1, 
                    password_updated_at = NOW(),
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            const result = await db.query(query, [hashedPassword, userId]);
            
            return {
                success: true,
                message: 'Contraseña actualizada correctamente',
                updatedUser: {
                    id: userId,
                    name: `${user.first_name} ${user.last_name}`,  // ✅ Usar datos del usuario
                    email: user.email                               // ✅ Usar datos del usuario
                }
            };
        }
        catch (error) {
            console.error('❌ Error en UserModel.updateUserPassword:', error);
            throw error;
        }
    }

    // Desactivar usuario
    static async deactivateUser(userId) {
        try {
            // Primero obtener los datos del usuario
            const user = await this.getUser(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
    
            const query = `
                UPDATE app_user SET is_active = false WHERE id = $1
                RETURNING *
            `;
            const result = await db.query(query, [userId]);
            
            return {
                success: true,
                message: 'Usuario desactivado correctamente',
                updatedUser: {
                    id: userId,
                    name: `${user.first_name} ${user.last_name}`,  // ✅ Usar datos del usuario
                    email: user.email                               // ✅ Usar datos del usuario
                }
            };
        }
        catch (error) {
            console.error('❌ Error en UserModel.deactivateUser:', error);
            throw error;
        }
    }

    // Activar usuario
    static async activateUser(userId) {
        try {
            // Primero obtener los datos del usuario
            const user = await this.getUser(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
    
            const query = `
                UPDATE app_user SET is_active = true WHERE id = $1
                RETURNING *
            `;
            const result = await db.query(query, [userId]);
            
            return {
                success: true,
                message: 'Usuario activado correctamente',
                updatedUser: {
                    id: userId,
                    name: `${user.first_name} ${user.last_name}`,  // ✅ Usar datos del usuario
                    email: user.email                               // ✅ Usar datos del usuario
                }
            };
        }
        catch (error) {
            console.error('❌ Error en UserModel.activateUser:', error);
            throw error;
        }
    }
}

module.exports = UserModel;