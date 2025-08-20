const db = require('../config/db');

class RoleModel {

    // Obtener todos los roles (activos e inactivos)
    static async getAll() {
        try {
            const query = 'SELECT * FROM role ORDER BY created_at DESC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en RoleModel.getAll:', error);
            throw error;
        }
    }

    // Crear un nuevo rol
    static async createRole(roleData) {
        try {
            // Usar la conexión existente en lugar de connect()
            const query = `
            INSERT INTO role (name, code, is_active, created_at, created_by) 
            VALUES ($1, $2, $3, NOW(), $4) 
            RETURNING *
        `;
            const values = [
                roleData.name,
                roleData.code,
                roleData.is_active,
                roleData.created_by || null  // ← Agregar created_by
            ];

            const result = await db.query(query, values);
            const newRole = result.rows[0];

            // Insertar permisos asociados
            if (roleData.permissions && roleData.permissions.length > 0) {
                const permissionQuery = `
                    INSERT INTO role_permission (role_id, permission_id, is_active, created_at, updated_at, created_by) 
                    VALUES ($1, $2, $3, NOW(), NOW(), $4)
                `;
                
                for (const permissionId of roleData.permissions) {
                    await db.query(permissionQuery, [
                        newRole.id, 
                        permissionId, 
                        true, // is_active por defecto
                        roleData.created_by
                    ]);
                }
            }

            return newRole;

        } catch (error) {
            console.error('Error en RoleModel.createRole:', error);
            throw error;
        }
    }

    // Verificar si existe un rol con el código
    static async codeExists(code) {
        try {
            const query = 'SELECT EXISTS(SELECT 1 FROM role WHERE code = $1) as exists';
            const result = await db.query(query, [code]);
            return result.rows[0].exists;
        } catch (error) {
            console.error('Error en RoleModel.codeExists:', error);
            throw error;
        }
    }

    // Verificar si existe un rol con el nombre
    static async nameExists(name) {
        try {
            const query = 'SELECT EXISTS(SELECT 1 FROM role WHERE name = $1) as exists';
            const result = await db.query(query, [name]);
            return result.rows[0].exists;
        } catch (error) {
            console.error('Error en RoleModel.nameExists:', error);
            throw error;
        }
    }

    // Eliminar un rol y sus permisos asociados
    static async deleteRole(roleId) {
        try {
            // Primero eliminar permisos asociados
            const deletePermissionsQuery = 'DELETE FROM role_permission WHERE role_id = $1';
            await db.query(deletePermissionsQuery, [roleId]);

            // Luego eliminar el rol
            const deleteRoleQuery = 'DELETE FROM role WHERE id = $1 RETURNING *';
            const result = await db.query(deleteRoleQuery, [roleId]);
            
            if (result.rows.length === 0) {
                throw new Error('Rol no encontrado');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error en RoleModel.deleteRole:', error);
            throw error;
        }
    }

    // Obtener información completa de un rol por ID
    static async getRoleById(roleId) {
        try {
            const query = `
                SELECT 
                    r.id,
                    r.name,
                    r.code,
                    r.is_active,
                    r.created_at,
                    r.updated_at,
                    r.created_by,
                    r.updated_by,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', p.id,
                            'module', p.module,
                            'action', p.action,
                            'scope', p.scope,
                            'code', p.code,
                            'is_active', p.is_active
                        )
                    ) as permissions
                FROM role r
                LEFT JOIN role_permission rp ON r.id = rp.role_id
                LEFT JOIN permission p ON rp.permission_id = p.id
                WHERE r.id = $1
                GROUP BY r.id, r.name, r.code, r.is_active, r.created_at, r.updated_at, r.created_by, r.updated_by
            `;
            
            const result = await db.query(query, [roleId]);
            
            if (result.rows.length === 0) {
                throw new Error('Rol no encontrado');
            }

            const role = result.rows[0];
            
            // Si no hay permisos, establecer como array vacío
            if (role.permissions[0].id === null) {
                role.permissions = [];
            }

            return role;
        } catch (error) {
            console.error('Error en RoleModel.getRoleById:', error);
            throw error;
        }
    }

    // Actualizar un rol existente
    static async updateRole(roleId, roleData) {
        try {
            // Iniciar transacción
            await db.query('BEGIN');

            // Actualizar el rol
            const updateRoleQuery = `
                UPDATE role 
                SET name = $1, code = $2, is_active = $3, updated_at = NOW(), updated_by = $4
                WHERE id = $5
                RETURNING *
            `;
            
            const roleValues = [
                roleData.name,
                roleData.code,
                roleData.is_active,
                roleData.updated_by,
                roleId
            ];

            const roleResult = await db.query(updateRoleQuery, roleValues);
            
            if (roleResult.rows.length === 0) {
                throw new Error('Rol no encontrado');
            }

            const updatedRole = roleResult.rows[0];

            // Eliminar permisos existentes
            const deletePermissionsQuery = 'DELETE FROM role_permission WHERE role_id = $1';
            await db.query(deletePermissionsQuery, [roleId]);

            // Insertar nuevos permisos si los hay
            if (roleData.permissions && roleData.permissions.length > 0) {
                const permissionQuery = `
                    INSERT INTO role_permission (role_id, permission_id, is_active, created_at, updated_at, created_by) 
                    VALUES ($1, $2, $3, NOW(), NOW(), $4)
                `;
                
                for (const permissionId of roleData.permissions) {
                    await db.query(permissionQuery, [
                        roleId, 
                        permissionId, 
                        true, // is_active por defecto
                        roleData.updated_by
                    ]);
                }
            }

            // Confirmar transacción
            await db.query('COMMIT');

            return updatedRole;

        } catch (error) {
            // Revertir transacción en caso de error
            await db.query('ROLLBACK');
            console.error('Error en RoleModel.updateRole:', error);
            throw error;
        }
    }

    // Cambiar estado activo/inactivo de un rol
    static async toggleRoleStatus(roleId, isActive, updatedBy) {
        try {
            const query = `
                UPDATE role 
                SET is_active = $1, updated_at = NOW(), updated_by = $2
                WHERE id = $3
                RETURNING *
            `;
            
            const values = [isActive, updatedBy, roleId];
            const result = await db.query(query, values);
            
            if (result.rows.length === 0) {
                throw new Error('Rol no encontrado');
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error en RoleModel.toggleRoleStatus:', error);
            throw error;
        }
    }

}

module.exports = RoleModel; 