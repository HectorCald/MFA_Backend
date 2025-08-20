const db = require('../config/db');

class BusinessPersonRoleModel {
    static async create(roleData, client = null) {
        try {
            const {
                business_client_id,
                person_id,
                role_type_id,
                office_id,
                created_by
            } = roleData;

            const query = `
                INSERT INTO business_person_role (
                    business_client_id, person_id, role_type_id, office_id, created_by
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const values = [
                business_client_id, person_id, role_type_id, office_id, created_by
            ];

            const result = client ? await client.query(query, values) : await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en BusinessPersonRoleModel.create:', error);
            throw error;
        }
    }

    static async createMultiple(rolesData, client = null) {
        let shouldCommit = false;
        let shouldRelease = false;
        
        try {
            if (!client) {
                client = await db.getClient();
                await client.query('BEGIN');
                shouldCommit = true;
                shouldRelease = true;
            }

            const createdRoles = [];
            
            for (const roleData of rolesData) {
                const {
                    business_client_id,
                    person_id,
                    role_type_id,
                    office_id,
                    created_by
                } = roleData;

                const query = `
                    INSERT INTO business_person_role (
                        business_client_id, person_id, role_type_id, office_id, created_by
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `;

                const values = [
                    business_client_id, person_id, role_type_id, office_id, created_by
                ];

                const result = await client.query(query, values);
                createdRoles.push(result.rows[0]);
            }

            if (shouldCommit) {
                await client.query('COMMIT');
            }
            return createdRoles;
        } catch (error) {
            if (client && shouldCommit) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Error al hacer rollback:', rollbackError);
                }
            }
            console.error('Error en BusinessPersonRoleModel.createMultiple:', error);
            throw error;
        } finally {
            if (client && shouldRelease) {
                try {
                    client.release();
                } catch (releaseError) {
                    console.error('Error al liberar cliente:', releaseError);
                }
            }
        }
    }

    static async getByBusinessClientId(businessClientId) {
        try {
            const query = `
                SELECT bpr.*, p.first_name, p.last_name, rt.name as role_name
                FROM business_person_role bpr
                JOIN person p ON bpr.person_id = p.id
                JOIN role_type rt ON bpr.role_type_id = rt.id
                WHERE bpr.business_client_id = $1 AND bpr.is_active = true
                ORDER BY p.first_name, p.last_name
            `;
            const result = await db.query(query, [businessClientId]);
            return result.rows;
        } catch (error) {
            console.error('Error en BusinessPersonRoleModel.getByBusinessClientId:', error);
            throw error;
        }
    }

    static async getByPersonId(personId) {
        try {
            const query = `
                SELECT bpr.*, bc.name as business_name, rt.name as role_name
                FROM business_person_role bpr
                JOIN business_client bc ON bpr.business_client_id = bc.id
                JOIN role_type rt ON bpr.role_type_id = rt.id
                WHERE bpr.person_id = $1 AND bpr.is_active = true
                ORDER BY bc.name
            `;
            const result = await db.query(query, [personId]);
            return result.rows;
        } catch (error) {
            console.error('Error en BusinessPersonRoleModel.getByPersonId:', error);
            throw error;
        }
    }

    static async deactivateByPersonId(personId) {
        try {
            const query = `
                UPDATE business_person_role 
                SET is_active = false, updated_at = NOW()
                WHERE person_id = $1 AND is_active = true
            `;
            const result = await db.query(query, [personId]);
            console.log(`Desactivados ${result.rowCount} roles para la persona ${personId}`);
            return result.rowCount;
        } catch (error) {
            console.error('Error en BusinessPersonRoleModel.deactivateByPersonId:', error);
            throw error;
        }
    }
}

module.exports = BusinessPersonRoleModel; 