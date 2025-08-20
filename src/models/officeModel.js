const db = require('../config/db');

class OfficeModel {
    // Obtener todas las oficinas
    static async getAll() {
        try {
            const query = `
                SELECT 
                    o.id,
                    o.business_client_id,
                    o.office_type_id,
                    o.name,
                    o.address,
                    o.postal_code,
                    o.country_id,
                    o.email,
                    o.phone,
                    o.cellphone,
                    o.is_active,
                    o.created_at,
                    o.updated_by,
                    o.updated_at,
                    o.city_id
                FROM office o
                LEFT JOIN office_type ot ON o.office_type_id = ot.id
                LEFT JOIN country c ON o.country_id = c.id
                LEFT JOIN city ci ON o.city_id = ci.id
                WHERE o.is_active = true
                ORDER BY o.created_at DESC
            `;
            
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en OfficeModel.getAll:', error);
            throw error;
        }
    }

    // Obtener oficina por ID
    static async getById(id) {
        try {
            const query = `
                SELECT 
                    o.id,
                    o.name,
                    o.address,
                    o.postal_code,
                    o.phone,
                    o.email,
                    o.cellphone,
                    o.is_active,
                    o.created_at,
                    o.updated_at,
                    o.office_type_id,
                    o.country_id,
                    o.city_id,
                    ot.name as office_type_name,
                    c.name as country_name,
                    ci.name as city_name
                FROM office o
                LEFT JOIN office_type ot ON o.office_type_id = ot.id
                LEFT JOIN country c ON o.country_id = c.id
                LEFT JOIN city ci ON o.city_id = ci.id
                WHERE o.id = $1 AND o.is_active = true
            `;
            
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en OfficeModel.getById:', error);
            throw error;
        }
    }

    // Obtener oficinas por cliente empresarial
    static async getByBusinessClientId(businessClientId) {
        try {
            const query = `
                SELECT 
                    o.id,
                    o.name,
                    o.address,
                    o.postal_code,
                    o.phone,
                    o.email,
                    o.cellphone,
                    o.is_active,
                    o.created_at,
                    o.updated_at,
                    o.office_type_id,
                    o.country_id,
                    ot.name as office_type_name,
                    c.name as country_name,
                    ci.name as city_name,
                    CASE 
                        WHEN o.is_active = true THEN 'Activa'
                        ELSE 'Inactiva'
                    END as status
                FROM office o
                LEFT JOIN office_type ot ON o.office_type_id = ot.id
                LEFT JOIN country c ON o.country_id = c.id
                LEFT JOIN city ci ON o.city_id = ci.id
                WHERE o.business_client_id = $1 
                AND o.is_active = true
                ORDER BY o.created_at DESC
            `;
            
            const result = await db.query(query, [businessClientId]);
            return result.rows;
        } catch (error) {
            console.error('Error en OfficeModel.getByBusinessClientId:', error);
            throw error;
        }
    }

    // Obtener roles de una oficina específica
    static async getOfficeRoles(officeId, businessClientId) {
        try {
            // Consulta corregida usando solo las columnas que existen en la tabla person
            const query = `
                SELECT 
                    bpr.id,
                    bpr.role_type_id,
                    bpr.business_client_id,
                    bpr.office_id,
                    bpr.is_active,
                    rt.name as role_type_name,
                    p.id as person_id,
                    p.first_name,
                    p.last_name,
                    p.birthdate,
                    p.gender,
                    p.dni,
                    p.dni_country_id,
                    p.country_id,
                    p.city_id,
                    p.address,
                    p.postal_code,
                    p.email,
                    p.cellphone
                FROM business_person_role bpr
                LEFT JOIN role_type rt ON bpr.role_type_id = rt.id
                LEFT JOIN person p ON bpr.person_id = p.id
                WHERE bpr.business_client_id = $1 
                AND bpr.office_id = $2 
                AND bpr.is_active = true
            `;
            
            const result = await db.query(query, [businessClientId, officeId]);
            console.log('Consulta SQL ejecutada exitosamente');
            console.log('Parámetros:', { businessClientId, officeId });
            console.log('Resultados encontrados:', result.rows.length);
            return result.rows;
        } catch (error) {
            console.error('Error en OfficeModel.getOfficeRoles:', error);
            console.error('Detalles del error:', error.message);
            throw error;
        }
    }

    // Asignar rol de persona en una oficina
    static async assignPersonRole(roleData) {
        try {
            console.log('=== CREANDO RELACIÓN EN BUSINESS_PERSON_ROLE ===');
            console.log('Datos recibidos:', roleData);
            
            const query = `
                INSERT INTO business_person_role (
                    business_client_id,
                    person_id,
                    office_id,
                    role_type_id,
                    is_active,
                    created_by,
                    created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING *
            `;
            
            const values = [
                roleData.business_client_id,
                roleData.person_id,
                roleData.office_id,
                roleData.role_type_id,
                roleData.is_active || true,
                roleData.created_by
            ];
            
            console.log('Query SQL:', query);
            console.log('Valores:', values);
            
            const result = await db.query(query, values);
            
            console.log('✅ Relación creada exitosamente en business_person_role');
            console.log('Resultado:', result.rows[0]);
            
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error en OfficeModel.assignPersonRole:', error);
            console.error('Detalles del error:', error.message);
            throw error;
        }
    }

    // Actualizar oficina
    static async updateOffice(officeId, updateData) {
        try {
            console.log('=== ACTUALIZANDO OFICINA ===');
            console.log('Office ID:', officeId);
            console.log('Datos a actualizar:', updateData);
            
            // Construir la consulta SQL dinámicamente
            const fields = [];
            const values = [];
            let paramIndex = 1;
            
            // Campos que se pueden actualizar
            const allowedFields = [
                'name', 'address', 'postal_code', 'phone', 'email', 
                'cellphone', 'country_id', 'city_id', 'updated_by'
            ];
            
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    fields.push(`${field} = $${paramIndex}`);
                    values.push(updateData[field]);
                    paramIndex++;
                }
            });
            
            if (fields.length === 0) {
                throw new Error('No hay campos válidos para actualizar');
            }
            
            // Agregar updated_at
            fields.push('updated_at = NOW()');
            
            // Agregar el ID de la oficina al final
            values.push(officeId);
            
            const query = `
                UPDATE office 
                SET ${fields.join(', ')}
                WHERE id = $${paramIndex} AND is_active = true
                RETURNING *
            `;
            
            console.log('Query SQL:', query);
            console.log('Valores:', values);
            
            const result = await db.query(query, values);
            
            if (result.rows.length === 0) {
                return null; // Oficina no encontrada
            }
            
            console.log('✅ Oficina actualizada exitosamente');
            console.log('Resultado:', result.rows[0]);
            
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error en OfficeModel.updateOffice:', error);
            console.error('Detalles del error:', error.message);
            throw error;
        }
    }

    // Crear nueva oficina
    static async create(officeData) {
        try {
            const query = `
                INSERT INTO office (
                    business_client_id, office_type_id, name, address, postal_code, 
                    phone, email, cellphone, country_id, city_id, created_by, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
                RETURNING id
            `;
            
            const values = [
                officeData.business_client_id,
                officeData.office_type_id,
                officeData.name,
                officeData.address,
                officeData.postal_code || '0000',
                officeData.phone,
                officeData.email,
                officeData.cellphone,
                officeData.country_id,
                officeData.city_id,
                officeData.created_by
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en OfficeModel.create:', error);
            throw error;
        }
    }

    // Actualizar oficina
    static async update(id, officeData) {
        try {
            const query = `
                UPDATE office SET 
                    name = $1,
                    address = $2,
                    postal_code = $3,
                    phone = $4,
                    email = $5,
                    cellphone = $6,
                    office_type_id = $7,
                    country_id = $8,
                    city_id = $9,
                    updated_at = now(),
                    updated_by = $10
                WHERE id = $11 AND is_active = true
                RETURNING id
            `;
            
            const values = [
                officeData.name,
                officeData.address,
                officeData.postal_code || '0000',
                officeData.phone,
                officeData.email,
                officeData.cellphone,
                officeData.office_type_id,
                officeData.country_id,
                officeData.city_id,
                officeData.updated_by,
                id
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en OfficeModel.update:', error);
            throw error;
        }
    }

    // Desactivar oficina (soft delete)
    static async deactivate(id, updatedBy) {
        try {
            const query = `
                UPDATE office SET 
                    is_active = false,
                    updated_at = now(),
                    updated_by = $1
                WHERE id = $2
                RETURNING id
            `;
            
            const result = await db.query(query, [updatedBy, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en OfficeModel.deactivate:', error);
            throw error;
        }
    }

    // Eliminar oficina de forma segura
    static async deleteOfficeSafely(officeId, updatedBy) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            console.log('=== ELIMINANDO OFICINA DE FORMA SEGURA ===');
            console.log('ID de la oficina:', officeId);
            
            // 1. Obtener información de la oficina
            const officeQuery = `
                SELECT o.id, o.name, o.office_type_id, ot.name as office_type_name
                FROM office o
                LEFT JOIN office_type ot ON o.office_type_id = ot.id
                WHERE o.id = $1
            `;
            const officeResult = await client.query(officeQuery, [officeId]);
            
            if (officeResult.rows.length === 0) {
                throw new Error('Oficina no encontrada');
            }
            
            const office = officeResult.rows[0];
            console.log('Oficina a eliminar:', office.name, 'Tipo:', office.office_type_name);
            
            // 2. Obtener todas las relaciones de personas en esta oficina
            const rolesQuery = `
                SELECT 
                    bpr.id as role_id,
                    bpr.person_id,
                    bpr.role_type_id,
                    rt.name as role_name,
                    p.first_name,
                    p.last_name
                FROM business_person_role bpr
                LEFT JOIN role_type rt ON bpr.role_type_id = rt.id
                LEFT JOIN person p ON bpr.person_id = p.id
                WHERE bpr.office_id = $1
            `;
            const rolesResult = await client.query(rolesQuery, [officeId]);
            console.log(`Encontradas ${rolesResult.rows.length} relaciones de roles`);
            
            // 3. Eliminar las relaciones de roles primero
            if (rolesResult.rows.length > 0) {
                await client.query('DELETE FROM business_person_role WHERE office_id = $1', [officeId]);
                console.log('✅ Relaciones de roles eliminadas');
                
                // Log de las relaciones eliminadas
                rolesResult.rows.forEach(role => {
                    console.log(`   - Eliminado rol: ${role.role_name} para persona: ${role.first_name} ${role.last_name}`);
                });
            }
            
            // 4. Identificar personas que se pueden eliminar (no son gerentes generales)
            const personsToDelete = [];
            for (const role of rolesResult.rows) {
                // Verificar si esta persona es gerente general en este cliente
                const gerenteQuery = `
                    SELECT COUNT(*) as count
                    FROM business_person_role bpr2
                    LEFT JOIN role_type rt2 ON bpr2.role_type_id = rt2.id
                    WHERE bpr2.person_id = $1 
                    AND bpr2.business_client_id = (
                        SELECT business_client_id FROM office WHERE id = $2
                    )
                    AND rt2.name = 'Gerente General'
                    AND bpr2.office_id != $2
                `;
                const gerenteResult = await client.query(gerenteQuery, [role.person_id, officeId]);
                
                if (gerenteResult.rows[0].count === 0) {
                    // Esta persona no es gerente general, se puede eliminar
                    personsToDelete.push(role.person_id);
                } else {
                    console.log(`⚠️ Persona ${role.first_name} ${role.last_name} es gerente general, NO se elimina`);
                }
            }
            
            // 5. Eliminar personas que no son gerentes generales
            if (personsToDelete.length > 0) {
                for (const personId of personsToDelete) {
                    await client.query('DELETE FROM person WHERE id = $1', [personId]);
                    console.log(`✅ Persona eliminada: ${personId}`);
                }
                console.log(`✅ ${personsToDelete.length} personas eliminadas`);
            }
            
            // 6. Finalmente, eliminar la oficina
            await client.query('DELETE FROM office WHERE id = $1', [officeId]);
            console.log('✅ Oficina eliminada');
            
            await client.query('COMMIT');
            
            return {
                office_id: officeId,
                office_name: office.name,
                roles_deleted: rolesResult.rows.length,
                persons_deleted: personsToDelete.length
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en deleteOfficeSafely:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Obtener conteo de oficinas por cliente
    static async getCountByBusinessClientId(businessClientId) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM office o
                INNER JOIN business_person_role bpr ON o.id = bpr.office_id
                WHERE bpr.business_client_id = $1 
                AND o.is_active = true
                AND bpr.is_active = true
            `;
            
            const result = await db.query(query, [businessClientId]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error en OfficeModel.getCountByBusinessClientId:', error);
            throw error;
        }
    }

    // Obtener oficina por teléfono
    static async getByPhone(phone) {
        try {
            const query = `
                SELECT 
                    o.id,
                    o.name,
                    o.address,
                    o.postal_code,
                    o.phone,
                    o.email,
                    o.cellphone,
                    o.is_active,
                    o.created_at,
                    o.updated_at,
                    o.office_type_id,
                    o.country_id,
                    ot.name as office_type_name,
                    c.name as country_name,
                    ci.name as city_name
                FROM office o
                LEFT JOIN office_type ot ON o.office_type_id = ot.id
                LEFT JOIN country c ON o.country_id = c.id
                LEFT JOIN city ci ON o.city_id = ci.id
                WHERE o.phone = $1 AND o.is_active = true
            `;
            
            const result = await db.query(query, [phone]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en OfficeModel.getByPhone:', error);
            throw error;
        }
    }

    // Obtener oficina por email
    static async getByEmail(email) {
        try {
            const query = `
                SELECT 
                    o.id,
                    o.name,
                    o.address,
                    o.postal_code,
                    o.phone,
                    o.email,
                    o.cellphone,
                    o.is_active,
                    o.created_at,
                    o.updated_at,
                    o.office_type_id,
                    o.country_id,
                    ot.name as office_type_name,
                    c.name as country_name,
                    ci.name as city_name
                FROM office o
                LEFT JOIN office_type ot ON o.office_type_id = ot.id
                LEFT JOIN country c ON o.country_id = c.id
                LEFT JOIN city ci ON o.city_id = ci.id
                WHERE o.email = $1 AND o.is_active = true
            `;
            
            const result = await db.query(query, [email]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en OfficeModel.getByEmail:', error);
            throw error;
        }
    }
}

module.exports = OfficeModel; 