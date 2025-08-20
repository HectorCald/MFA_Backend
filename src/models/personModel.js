const db = require('../config/db');

class PersonModel {
    static async create(personData) {
        try {
            const {
                first_name,
                last_name,
                dni,
                dni_country_id,
                gender,
                birthdate,
                email,
                cellphone,
                address,
                postal_code,
                country_id,
                city_id,
                created_by
            } = personData;

            const query = `
                INSERT INTO person (
                    first_name, last_name, dni, dni_country_id, gender,
                    birthdate, email, cellphone, address, postal_code,
                    country_id, city_id, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;

            const values = [
                first_name, last_name, dni, dni_country_id, gender,
                birthdate, email, cellphone, address, postal_code,
                country_id, city_id, created_by
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en PersonModel.create:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const query = 'SELECT * FROM person WHERE id = $1 AND is_active = true';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en PersonModel.getById:', error);
            throw error;
        }
    }

    static async getByIdWithDetails(id) {
        try {
            const query = `
                SELECT 
                    p.*,
                    c1.name as country_name,
                    c2.name as city_name,
                    c3.name as dni_country_name
                FROM person p
                LEFT JOIN country c1 ON p.country_id = c1.id
                LEFT JOIN city c2 ON p.city_id = c2.id
                LEFT JOIN country c3 ON p.dni_country_id = c3.id
                WHERE p.id = $1 AND p.is_active = true
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en PersonModel.getByIdWithDetails:', error);
            throw error;
        }
    }

    static async getByEmail(email) {
        try {
            const query = 'SELECT * FROM person WHERE email = $1 AND is_active = true';
            const result = await db.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en PersonModel.getByEmail:', error);
            throw error;
        }
    }

    static async getByDni(dni, dni_country_id = null) {
        try {
            let query, values;
            
            if (dni_country_id) {
                query = 'SELECT * FROM person WHERE dni = $1 AND dni_country_id = $2 AND is_active = true';
                values = [dni, dni_country_id];
            } else {
                query = 'SELECT * FROM person WHERE dni = $1 AND is_active = true';
                values = [dni];
            }
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error en PersonModel.getByDni:', error);
            throw error;
        }
    }

    static async getByCellphone(cellphone) {
        try {
            const query = 'SELECT * FROM person WHERE cellphone = $1 AND is_active = true';
            const result = await db.query(query, [cellphone]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en PersonModel.getByCellphone:', error);
            throw error;
        }
    }

    // Obtener personas por cliente empresarial
    static async getByBusinessClientId(businessClientId) {
        try {
            const query = `
                SELECT DISTINCT p.*
                FROM person p
                INNER JOIN business_person_role bpr ON p.id = bpr.person_id
                WHERE bpr.business_client_id = $1 
                AND p.is_active = true 
                AND bpr.is_active = true
            `;
            const result = await db.query(query, [businessClientId]);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.getByBusinessClientId:', error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const query = 'SELECT * FROM person WHERE is_active = true ORDER BY created_at DESC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.getAll:', error);
            throw error;
        }
    }

    static async getAllWithDetails(limit = 50, offset = 0) {
        try {
            const query = `
                SELECT DISTINCT ON (p.id)
                    p.*,
                    c1.name as country_name,
                    c2.name as city_name,
                    c3.name as dni_country_name,
                    bc.name as business_client_name
                FROM person p
                LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                LEFT JOIN country c1 ON p.country_id = c1.id
                LEFT JOIN city c2 ON p.city_id = c2.id
                LEFT JOIN country c3 ON p.dni_country_id = c3.id
                WHERE p.is_active = true
                ORDER BY p.id, p.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            const result = await db.query(query, [limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.getAllWithDetails:', error);
            throw error;
        }
    }

    static async searchByTerm(searchTerm, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT DISTINCT ON (p.id)
                    p.*,
                    c1.name as country_name,
                    c2.name as city_name,
                    c3.name as dni_country_name,
                    bc.name as business_client_name
                FROM person p
                LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                LEFT JOIN country c1 ON p.country_id = c1.id
                LEFT JOIN city c2 ON p.city_id = c2.id
                LEFT JOIN country c3 ON p.dni_country_id = c3.id
                WHERE p.is_active = true 
                AND (
                    p.first_name ILIKE $1 
                    OR p.last_name ILIKE $1 
                    OR p.email ILIKE $1 
                    OR p.dni ILIKE $1
                )
                ORDER BY p.id, p.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            const searchPattern = `%${searchTerm}%`;
            const result = await db.query(query, [searchPattern, limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.searchByTerm:', error);
            throw error;
        }
    }

    static async searchByDniAndCountry(dni, dniCountryId, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT DISTINCT ON (p.id)
                    p.*,
                    c1.name as country_name,
                    c2.name as city_name,
                    c3.name as dni_country_name,
                    bc.name as business_client_name
                FROM person p
                LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                LEFT JOIN country c1 ON p.country_id = c1.id
                LEFT JOIN city c2 ON p.city_id = c2.id
                LEFT JOIN country c3 ON p.dni_country_id = c3.id
                WHERE p.is_active = true AND p.dni = $1 AND p.dni_country_id = $2
                ORDER BY p.id, p.created_at DESC
                LIMIT $3 OFFSET $4
            `;
            const result = await db.query(query, [dni, dniCountryId, limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.searchByDniAndCountry:', error);
            throw error;
        }
    }

    static async searchByDni(dni, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT DISTINCT ON (p.id)
                    p.*,
                    c1.name as country_name,
                    c2.name as city_name,
                    c3.name as dni_country_name,
                    bc.name as business_client_name
                FROM person p
                LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                LEFT JOIN country c1 ON p.country_id = c1.id
                LEFT JOIN city c2 ON p.city_id = c2.id
                LEFT JOIN country c3 ON p.dni_country_id = c3.id
                WHERE p.is_active = true AND p.dni ILIKE $1
                ORDER BY p.id, p.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            const searchPattern = `%${dni}%`;
            const result = await db.query(query, [searchPattern, limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.searchByDni:', error);
            throw error;
        }
    }

    static async searchByEmail(email, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT DISTINCT ON (p.id)
                    p.*,
                    c1.name as country_name,
                    c2.name as city_name,
                    c3.name as dni_country_name,
                    bc.name as business_client_name
                FROM person p
                LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                LEFT JOIN country c1 ON p.country_id = c1.id
                LEFT JOIN city c2 ON p.city_id = c2.id
                LEFT JOIN country c3 ON p.dni_country_id = c3.id
                WHERE p.is_active = true AND p.email ILIKE $1
                ORDER BY p.id, p.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            const searchPattern = `%${email}%`;
            const result = await db.query(query, [searchPattern, limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.searchByEmail:', error);
            throw error;
        }
    }

    static async searchByLocation(countryId, cityId, limit = 50, offset = 0) {
        try {
            let query, values;
            
            if (countryId && cityId) {
                query = `
                    SELECT DISTINCT ON (p.id)
                        p.*,
                        c1.name as country_name,
                        c2.name as city_name,
                        c3.name as dni_country_name,
                        bc.name as business_client_name
                    FROM person p
                    LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                    LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                    LEFT JOIN country c1 ON p.country_id = c1.id
                    LEFT JOIN city c2 ON p.city_id = c2.id
                    LEFT JOIN country c3 ON p.dni_country_id = c3.id
                    WHERE p.is_active = true AND p.country_id = $1 AND p.city_id = $2
                    ORDER BY p.id, p.created_at DESC
                    LIMIT $3 OFFSET $4
                `;
                values = [countryId, cityId, limit, offset];
            } else if (countryId) {
                query = `
                    SELECT DISTINCT ON (p.id)
                        p.*,
                        c1.name as country_name,
                        c2.name as city_name,
                        c3.name as dni_country_name,
                        bc.name as business_client_name
                    FROM person p
                    LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                    LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                    LEFT JOIN country c1 ON p.country_id = c1.id
                    LEFT JOIN city c2 ON p.city_id = c2.id
                    LEFT JOIN country c3 ON p.dni_country_id = c3.id
                    WHERE p.is_active = true AND p.country_id = $1
                    ORDER BY p.id, p.created_at DESC
                    LIMIT $2 OFFSET $3
                `;
                values = [countryId, limit, offset];
            } else if (cityId) {
                query = `
                    SELECT DISTINCT ON (p.id)
                        p.*,
                        c1.name as country_name,
                        c2.name as city_name,
                        c3.name as dni_country_name,
                        bc.name as business_client_name
                    FROM person p
                    LEFT JOIN business_person_role bpr ON p.id = bpr.person_id AND bpr.is_active = true
                    LEFT JOIN business_client bc ON bpr.business_client_id = bc.id AND bc.is_active = true
                    LEFT JOIN country c1 ON p.country_id = c1.id
                    LEFT JOIN city c2 ON p.city_id = c2.id
                    LEFT JOIN country c3 ON p.dni_country_id = c3.id
                    WHERE p.is_active = true AND p.city_id = $1
                    ORDER BY p.id, p.created_at DESC
                    LIMIT $2 OFFSET $3
                `;
                values = [cityId, limit, offset];
            } else {
                return [];
            }
            
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error en PersonModel.searchByLocation:', error);
            throw error;
        }
    }
}

module.exports = PersonModel; 