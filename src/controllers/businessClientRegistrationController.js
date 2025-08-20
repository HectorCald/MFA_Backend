const BusinessClientModel = require('../models/businessClientModel');
const PersonModel = require('../models/personModel');
const BusinessPersonRoleModel = require('../models/businessPersonRoleModel');
const RoleTypeModel = require('../models/roleTypeModel');
const OfficeModel = require('../models/officeModel');
const OfficeTypeModel = require('../models/officeTypeModel');
const db = require('../config/db');

class BusinessClientRegistrationController {
    static async registerCompleteBusinessClient(req, res) {
        let client = null;
        
        try {
            console.log('=== INICIANDO REGISTRO DE CLIENTE EMPRESARIAL ===');
            console.log('Body recibido:', JSON.stringify(req.body, null, 2));
            
            const {
                clienteEmpresa,
                gerenteGeneral,
                oficina,
                responsable,
                contable
            } = req.body;

            // Obtener el usuario actual (asumiendo que viene del middleware de autenticación)
            // Si no hay usuario en la request, obtener el primer usuario de app_user
            let currentUser = req.user;
            if (!currentUser) {
                const userResult = await db.query('SELECT id FROM app_user WHERE is_active = true LIMIT 1');
                if (userResult.rows.length > 0) {
                    currentUser = { id: userResult.rows[0].id };
                } else {
                    throw new Error('No hay usuarios activos en el sistema');
                }
            }
            
            // 1. Validar CI/NIT del cliente empresarial
            const existingBusinessClient = await BusinessClientModel.getByDocumentNumber(clienteEmpresa.ciNitEmpresa);
            if (existingBusinessClient) {
                throw {
                    code: '23505',
                    constraint: 'business_client_document_number_key',
                    detail: `Ya existe la llave (document_number)=(${clienteEmpresa.ciNitEmpresa})`,
                    message: `El CI/NIT "${clienteEmpresa.ciNitEmpresa}" del Cliente Empresa ya está registrado en el sistema.`
                };
            }

            // 2. Validar DNI/CI del gerente
            const existingGerente = await PersonModel.getByDni(gerenteGeneral.dniCiGerente, gerenteGeneral.paisEmisionGerente);
            let gerentePersonId = null;
            if (existingGerente) {
                gerentePersonId = existingGerente.id;
                
                // Desactivar registro anterior en business_person_role
                await BusinessPersonRoleModel.deactivateByPersonId(existingGerente.id);
            }

            // 3. Validar email del gerente
            const existingGerenteEmail = await PersonModel.getByEmail(gerenteGeneral.correoElectronicoGerente);
            if (existingGerenteEmail && !gerentePersonId) {
                gerentePersonId = existingGerenteEmail.id;
                
                // Desactivar registro anterior en business_person_role
                await BusinessPersonRoleModel.deactivateByPersonId(existingGerenteEmail.id);
            }

            // 4. Validar celular del gerente
            const existingGerenteCellphone = await PersonModel.getByCellphone(gerenteGeneral.telefonoGerente);
            if (existingGerenteCellphone && !gerentePersonId) {
                gerentePersonId = existingGerenteCellphone.id;
                
                // Desactivar registro anterior en business_person_role
                await BusinessPersonRoleModel.deactivateByPersonId(existingGerenteCellphone.id);
            }

            // 5. Validar DNI/CI del responsable (si es diferente al gerente)
            let responsablePersonId = null;
            if (!responsable.esGerenteGeneral && responsable.nombreResponsable && responsable.nombreResponsable.trim() !== '') {
                const existingResponsable = await PersonModel.getByDni(responsable.dniCiResponsable, responsable.paisEmisionResponsable);
                if (existingResponsable) {
                    responsablePersonId = existingResponsable.id;
                    
                    // Desactivar registro anterior en business_person_role
                    await BusinessPersonRoleModel.deactivateByPersonId(existingResponsable.id);
                }

                // Validar email del responsable
                const existingResponsableEmail = await PersonModel.getByEmail(responsable.correoElectronicoResponsable);
                if (existingResponsableEmail && !responsablePersonId) {
                    responsablePersonId = existingResponsableEmail.id;
                    
                    // Desactivar registro anterior en business_person_role
                    await BusinessPersonRoleModel.deactivateByPersonId(existingResponsableEmail.id);
                }

                // Validar celular del responsable
                const existingResponsableCellphone = await PersonModel.getByCellphone(responsable.telefonoResponsable);
                if (existingResponsableCellphone && !responsablePersonId) {
                    responsablePersonId = existingResponsableCellphone.id;
                    
                    // Desactivar registro anterior en business_person_role
                    await BusinessPersonRoleModel.deactivateByPersonId(existingResponsableCellphone.id);
                }
            }

            // 6. Validar DNI/CI del contable (si es diferente al gerente)
            let contablePersonId = null;
            if (!contable.esGerenteGeneral && contable.nombreContable && contable.nombreContable.trim() !== '') {
                const existingContable = await PersonModel.getByDni(contable.dniCiContable, contable.paisEmisionContable);
                if (existingContable) {
                    contablePersonId = existingContable.id;
                    
                    // Desactivar registro anterior en business_person_role
                    await BusinessPersonRoleModel.deactivateByPersonId(existingContable.id);
                }

                // Validar email del contable
                const existingContableEmail = await PersonModel.getByEmail(contable.correoElectronicoContable);
                if (existingContableEmail && !contablePersonId) {
                    contablePersonId = existingContableEmail.id;
                    
                    // Desactivar registro anterior en business_person_role
                    await BusinessPersonRoleModel.deactivateByPersonId(existingContableEmail.id);
                }

                // Validar celular del contable
                const existingContableCellphone = await PersonModel.getByCellphone(contable.telefonoContable);
                if (existingContableCellphone && !contablePersonId) {
                    contablePersonId = existingContableCellphone.id;
                    
                    // Desactivar registro anterior en business_person_role
                    await BusinessPersonRoleModel.deactivateByPersonId(existingContableCellphone.id);
                }
            }

            // Iniciar transacción
            client = await db.getClient();
            await client.query('BEGIN');

            // 1. Crear el cliente empresarial
            const businessClientData = {
                code: BusinessClientRegistrationController.generateClientCode(clienteEmpresa.nombreEmpresa),
                name: clienteEmpresa.nombreEmpresa,
                document_number: clienteEmpresa.ciNitEmpresa,
                iata_number: clienteEmpresa.numeroIataEmpresa,
                business_client_type_id: clienteEmpresa.tipoClienteEmpresa,
                centralized_payment: clienteEmpresa.pagoSeleccionado === 'centralizado',
                created_by: currentUser.id,
                country_id: clienteEmpresa.paisResidenciaEmpresa && clienteEmpresa.paisResidenciaEmpresa.trim() !== '' ? clienteEmpresa.paisResidenciaEmpresa : '8c658ba3-e191-443c-a5c9-50b3f14e912a'
            };

            const createdBusinessClient = await BusinessClientModel.create(businessClientData);

            // 2. Crear la oficina principal PRIMERO para obtener su ID
            const officeType = await OfficeTypeModel.getByName('Principal') || await OfficeTypeModel.getByName('Oficina Principal');
            if (!officeType) {
                throw new Error('No se encontró el tipo de oficina "Principal"');
            }
            
            const officeData = {
                business_client_id: createdBusinessClient.id,
                office_type_id: officeType.id,
                name: oficina.nombreOficina,
                address: oficina.direccionOficina,
                postal_code: oficina.codigoPostalOficina && oficina.codigoPostalOficina.trim() !== '' ? oficina.codigoPostalOficina : '0000',
                country_id: oficina.paisOficina && oficina.paisOficina.trim() !== '' ? oficina.paisOficina : (gerenteGeneral.paisResidenciaGerente && gerenteGeneral.paisResidenciaGerente.trim() !== '' ? gerenteGeneral.paisResidenciaGerente : '8c658ba3-e191-443c-a5c9-50b3f14e912a'),
                email: oficina.correoElectronicoOficina,
                phone: oficina.telefonoOficina,
                cellphone: oficina.celularOficina,
                created_by: currentUser.id,
                city_id: oficina.ciudadOficina && oficina.ciudadOficina.trim() !== '' ? oficina.ciudadOficina : null
            };

            const createdOffice = await OfficeModel.create(officeData);

            // 3. Crear el gerente general
            let createdGerente = null;
            
            if (gerentePersonId) {
                // Usar persona existente
                createdGerente = { id: gerentePersonId };
            } else {
                // Crear nueva persona
                const gerenteData = {
                    first_name: gerenteGeneral.nombreGerente,
                    last_name: gerenteGeneral.apellidoGerente,
                    dni: gerenteGeneral.dniCiGerente,
                    dni_country_id: gerenteGeneral.paisEmisionGerente && gerenteGeneral.paisEmisionGerente.trim() !== '' ? gerenteGeneral.paisEmisionGerente : null,
                    gender: gerenteGeneral.generoGerente === 'masculino' ? 'M' : 'F',
                    birthdate: gerenteGeneral.fechaNacimientoGerente,
                    email: gerenteGeneral.correoElectronicoGerente,
                    cellphone: gerenteGeneral.telefonoGerente,
                    address: gerenteGeneral.direccionGerente,
                    postal_code: gerenteGeneral.codigoPostalGerente && gerenteGeneral.codigoPostalGerente.trim() !== '' ? gerenteGeneral.codigoPostalGerente : '0000',
                    country_id: gerenteGeneral.paisResidenciaGerente && gerenteGeneral.paisResidenciaGerente.trim() !== '' ? gerenteGeneral.paisResidenciaGerente : null,
                    city_id: gerenteGeneral.ciudadGerente && gerenteGeneral.ciudadGerente.trim() !== '' ? gerenteGeneral.ciudadGerente : null,
                    created_by: currentUser.id
                };

                createdGerente = await PersonModel.create(gerenteData);
            }

            // 4. Obtener los tipos de roles
            const roleTypes = await RoleTypeModel.getAll();
            const roleMap = {};
            roleTypes.forEach(role => {
                roleMap[role.name] = role.id;
            });

            // 5. Asignar roles al gerente CON office_id de la oficina creada
            const gerenteRoles = [
                {
                    business_client_id: createdBusinessClient.id,
                    person_id: createdGerente.id,
                    role_type_id: roleMap['Gerente General'],
                    office_id: createdOffice.id, // USAR EL ID DE LA OFICINA CREADA
                    created_by: currentUser.id
                }
            ];

            // Si el responsable es el mismo que el gerente
            if (responsable.esGerenteGeneral) {
                gerenteRoles.push({
                    business_client_id: createdBusinessClient.id,
                    person_id: createdGerente.id,
                    role_type_id: roleMap['Responsable de Oficina'],
                    office_id: createdOffice.id, // USAR EL ID DE LA OFICINA CREADA
                    created_by: currentUser.id
                });
            }

            // Si el contable es el mismo que el gerente
            if (contable.esGerenteGeneral) {
                gerenteRoles.push({
                    business_client_id: createdBusinessClient.id,
                    person_id: createdGerente.id,
                    role_type_id: roleMap['Contacto Contable'],
                    office_id: createdOffice.id, // USAR EL ID DE LA OFICINA CREADA
                    created_by: currentUser.id
                });
            }

            await BusinessPersonRoleModel.createMultiple(gerenteRoles, client);

            // 6. Si el responsable es diferente al gerente, crear persona separada
            let createdResponsable = null;
            if (!responsable.esGerenteGeneral && responsable.nombreResponsable && responsable.nombreResponsable.trim() !== '') {
                if (responsablePersonId) {
                    // Usar persona existente
                    createdResponsable = { id: responsablePersonId };
                } else {
                    // Crear nueva persona
                    const responsableData = {
                        first_name: responsable.nombreResponsable,
                        last_name: responsable.apellidoResponsable,
                        dni: responsable.dniCiResponsable,
                        dni_country_id: responsable.paisEmisionResponsable && responsable.paisEmisionResponsable.trim() !== '' ? responsable.paisEmisionResponsable : gerenteGeneral.paisEmisionGerente,
                        gender: responsable.generoResponsable === 'masculino' ? 'M' : 'F',
                        birthdate: responsable.fechaNacimientoResponsable,
                        email: responsable.correoElectronicoResponsable,
                        cellphone: responsable.telefonoResponsable,
                        address: responsable.direccionResponsable,
                        postal_code: responsable.codigoPostalResponsable && responsable.codigoPostalResponsable.trim() !== '' ? responsable.codigoPostalResponsable : '0000',
                        country_id: responsable.paisResidenciaResponsable && responsable.paisResidenciaResponsable.trim() !== '' ? responsable.paisResidenciaResponsable : gerenteGeneral.paisResidenciaGerente,
                        city_id: responsable.ciudadResponsable && responsable.ciudadResponsable.trim() !== '' ? responsable.ciudadResponsable : gerenteGeneral.ciudadGerente,
                        created_by: currentUser.id
                    };

                    createdResponsable = await PersonModel.create(responsableData);
                }

                // Asignar rol de responsable CON office_id de la oficina creada
                await BusinessPersonRoleModel.create({
                    business_client_id: createdBusinessClient.id,
                    person_id: createdResponsable.id,
                    role_type_id: roleMap['Responsable de Oficina'],
                    office_id: createdOffice.id, // USAR EL ID DE LA OFICINA CREADA
                    created_by: currentUser.id
                }, client);
            }

            // 7. Si el contable es diferente al gerente, crear persona separada
            let createdContable = null;
            
            if (!contable.esGerenteGeneral && contable.nombreContable) {
                if (contablePersonId) {
                    // Usar persona existente
                    createdContable = { id: contablePersonId };
                } else {
                    // Crear nueva persona
                    const contableData = {
                        first_name: contable.nombreContable,
                        last_name: contable.apellidoContable,
                        dni: contable.dniCiContable,
                        dni_country_id: contable.paisEmisionContable && contable.paisEmisionContable.trim() !== '' ? contable.paisEmisionContable : gerenteGeneral.paisEmisionGerente,
                        gender: contable.generoContable === 'masculino' ? 'M' : 'F',
                        birthdate: contable.fechaNacimientoContable,
                        email: contable.correoElectronicoContable,
                        cellphone: contable.telefonoContable,
                        address: contable.direccionContable,
                        postal_code: contable.codigoPostalContable && contable.codigoPostalContable.trim() !== '' ? contable.codigoPostalContable : '0000',
                        country_id: contable.paisResidenciaContable && contable.paisResidenciaContable.trim() !== '' ? contable.paisResidenciaContable : gerenteGeneral.paisResidenciaGerente,
                        city_id: contable.ciudadContable && contable.ciudadContable.trim() !== '' ? contable.ciudadContable : gerenteGeneral.ciudadGerente,
                        created_by: currentUser.id
                    };

                    createdContable = await PersonModel.create(contableData);
                }

                // Asignar rol de contable CON office_id de la oficina creada
                await BusinessPersonRoleModel.create({
                    business_client_id: createdBusinessClient.id,
                    person_id: createdContable.id,
                    role_type_id: roleMap['Contacto Contable'],
                    office_id: createdOffice.id, // USAR EL ID DE LA OFICINA CREADA
                    created_by: currentUser.id
                }, client);
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Cliente Empresa registrado exitosamente',
                data: {
                    businessClient: createdBusinessClient,
                    office: createdOffice,
                    gerente: createdGerente,
                    responsable: createdResponsable,
                    contable: createdContable
                }
            });

        } catch (error) {
            console.error('Error en BusinessClientRegistrationController.registerCompleteBusinessClient:', error);
            
            if (client) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Error al hacer rollback:', rollbackError);
                }
            }
            
            // Manejar errores específicos de la base de datos
            let errorMessage = 'Error interno del servidor al registrar el Cliente Empresa';
            let errorType = 'general';
            
            // Si es un error personalizado de validación
            if (error.message && (error.code === '23505' || error.constraint)) {
                errorMessage = error.message;
                if (error.constraint === 'business_client_document_number_key') {
                    errorType = 'duplicate_document';
                } else if (error.constraint === 'person_dni_key') {
                    errorType = 'duplicate_dni';
                } else if (error.constraint === 'person_email_key') {
                    errorType = 'duplicate_email';
                } else if (error.constraint === 'person_cellphone_key') {
                    errorType = 'duplicate_cellphone';
                } else if (error.constraint === 'business_client_code_key') {
                    errorType = 'duplicate_code';
                } else {
                    errorType = 'duplicate_data';
                }
            } else if (error.code === '23505') { // Error de clave duplicada
                if (error.constraint === 'business_client_document_number_key') {
                    errorMessage = `El CI/NIT "${req.body.clienteEmpresa.ciNitEmpresa}" del Cliente Empresa ya está registrado en el sistema.`;
                    errorType = 'duplicate_document';
                } else if (error.constraint === 'person_dni_key') {
                    const dniValue = error.detail?.match(/\(dni\)=\(([^)]+)\)/)?.[1] || 'N/A';
                    errorMessage = `El DNI/CI "${dniValue}" ya está registrado en el sistema.`;
                    errorType = 'duplicate_dni';
                } else if (error.constraint === 'person_email_key') {
                    const emailValue = error.detail?.match(/\(email\)=\(([^)]+)\)/)?.[1] || 'N/A';
                    errorMessage = `El correo electrónico "${emailValue}" ya está registrado en el sistema.`;
                    errorType = 'duplicate_email';
                } else if (error.constraint === 'person_cellphone_key') {
                    const cellphoneValue = error.detail?.match(/\(cellphone\)=\(([^)]+)\)/)?.[1] || 'N/A';
                    errorMessage = `El número de celular "${cellphoneValue}" ya está registrado en el sistema.`;
                    errorType = 'duplicate_cellphone';
                } else if (error.constraint === 'business_client_code_key') {
                    const codeValue = error.detail?.match(/\(code\)=\(([^)]+)\)/)?.[1] || 'N/A';
                    errorMessage = `El código de cliente "${codeValue}" ya existe en el sistema.`;
                    errorType = 'duplicate_code';
                } else {
                    errorMessage = `Ya existe un registro con los mismos datos: ${error.detail || 'Información duplicada'}`;
                    errorType = 'duplicate_data';
                }
            } else if (error.code === '23502') { // Error de campo requerido
                errorMessage = `Campo requerido faltante: ${error.column || 'Campo obligatorio'}`;
                errorType = 'missing_field';
            } else if (error.code === '23503') { // Error de clave foránea
                errorMessage = `Referencia inválida: ${error.detail || 'Dato referenciado no existe'}`;
                errorType = 'foreign_key';
            } else if (error.code === '23514') { // Error de restricción de verificación
                errorMessage = `Dato inválido: ${error.detail || 'Valor no permitido'}`;
                errorType = 'validation';
            }
            
            res.status(500).json({
                success: false,
                message: errorMessage,
                error: error.message,
                errorType: errorType,
                errorCode: error.code,
                errorDetail: error.detail,
                errorConstraint: error.constraint
            });
        } finally {
            if (client) {
                try {
                    client.release();
                } catch (releaseError) {
                    console.error('Error al liberar cliente:', releaseError);
                }
            }
        }
    }

    static generateClientCode(companyName) {
        const timestamp = Date.now().toString().slice(-6);
        const initials = companyName
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 3);
        return `${initials}${timestamp}`;
    }

    static async getAllBusinessClients(req, res) {
        try {
            
            const query = `
                SELECT 
                    bc.id,
                    bc.code,
                    bc.name,
                    bc.document_number,
                    bc.iata_number,
                    bc.centralized_payment,
                    bc.created_at,
                    bc.country_id,
                    bct.name as business_client_type_name,
                    c.name as country_name,
                    COUNT(DISTINCT o.id) as office_count,
                    STRING_AGG(DISTINCT CONCAT(p.first_name, ' ', p.last_name), ', ') as gerente_general
                FROM business_client bc
                LEFT JOIN business_client_type bct ON bc.business_client_type_id = bct.id
                LEFT JOIN country c ON bc.country_id = c.id
                LEFT JOIN office o ON bc.id = o.business_client_id
                LEFT JOIN business_person_role bpr ON bc.id = bpr.business_client_id
                LEFT JOIN person p ON bpr.person_id = p.id
                LEFT JOIN role_type rt ON bpr.role_type_id = rt.id
                WHERE bc.is_active = true 
                AND (rt.name = 'Gerente General' OR rt.name IS NULL)
                GROUP BY bc.id, bc.code, bc.name, bc.document_number, bc.iata_number, 
                         bc.centralized_payment, bc.created_at, bc.country_id, bct.name, c.name
                ORDER BY bc.created_at DESC
            `;

            const result = await db.query(query);
            
            console.log(`✅ Se encontraron ${result.rows.length} Clientes Empresariales`);
            
            res.status(200).json({
                success: true,
                message: 'Clientes Empresa obtenidos exitosamente',
                data: result.rows
            });

        } catch (error) {
            console.error('Error en BusinessClientRegistrationController.getAllBusinessClients:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener Clientes Empresa',
                error: error.message
            });
        }
    }

    static async deleteBusinessClient(req, res) {
        let client = null;
        
        try {
            console.log('=== ELIMINANDO CLIENTE EMPRESARIAL ===');
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial es requerido'
                });
            }

            // Obtener información del cliente antes de eliminar
            const clientQuery = 'SELECT name, code FROM business_client WHERE id = $1 AND is_active = true';
            const clientResult = await db.query(clientQuery, [id]);
            
            if (clientResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente empresarial no encontrado'
                });
            }

            const clientData = clientResult.rows[0];
            console.log('Cliente a eliminar:', clientData);
            
            // Verificar que el ID sea un UUID válido
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial no es válido'
                });
            }

            // Iniciar transacción
            client = await db.getClient();
            if (!client) {
                throw new Error('No se pudo obtener conexión a la base de datos');
            }
            await client.query('BEGIN');

            try {
                // 1. Obtener todas las oficinas asociadas a este cliente
                const officesQuery = 'SELECT id, name FROM office WHERE business_client_id = $1';
                const officesResult = await client.query(officesQuery, [id]);
                console.log(`✅ Encontradas ${officesResult.rows.length} oficinas asociadas`);

                // 2. Obtener todas las personas asociadas a este cliente
                const personsQuery = `
                    SELECT DISTINCT p.id, p.first_name, p.last_name
                    FROM person p
                    JOIN business_person_role bpr ON p.id = bpr.person_id
                    WHERE bpr.business_client_id = $1
                `;
                const personsResult = await client.query(personsQuery, [id]);
                console.log(`✅ Encontradas ${personsResult.rows.length} personas asociadas`);

                // 3. Eliminar roles de personas (debe ser primero por las foreign keys)
                await client.query('DELETE FROM business_person_role WHERE business_client_id = $1', [id]);
                console.log('✅ Roles de personas eliminados');

                // 4. Eliminar oficinas (debe ser antes de eliminar personas)
                if (officesResult.rows.length > 0) {
                    await client.query('DELETE FROM office WHERE business_client_id = $1', [id]);
                    console.log(`✅ ${officesResult.rows.length} oficinas eliminadas`);
                    
                    // Log de las oficinas eliminadas
                    officesResult.rows.forEach(office => {
                        console.log(`   - Eliminada oficina: ${office.name}`);
                    });
                }

                // 5. Eliminar todas las personas asociadas (solo si no están en otros clientes)
                if (personsResult.rows.length > 0) {
                    const personIds = personsResult.rows.map(p => p.id);
                    
                    // Verificar si las personas están asociadas a otros clientes
                    const otherClientsQuery = `
                        SELECT DISTINCT p.id, p.first_name, p.last_name
                        FROM person p
                        JOIN business_person_role bpr ON p.id = bpr.person_id
                        WHERE p.id = ANY($1) AND bpr.business_client_id != $2
                    `;
                    const otherClientsResult = await client.query(otherClientsQuery, [personIds, id]);
                    
                    // Solo eliminar personas que no estén en otros clientes
                    const personsToDelete = personsResult.rows.filter(person => 
                        !otherClientsResult.rows.some(other => other.id === person.id)
                    );
                    
                    if (personsToDelete.length > 0) {
                        const deletePersonIds = personsToDelete.map(p => p.id);
                        await client.query('DELETE FROM person WHERE id = ANY($1)', [deletePersonIds]);
                        console.log(`✅ ${personsToDelete.length} personas eliminadas (no estaban en otros clientes)`);
                        
                        // Log de las personas eliminadas
                        personsToDelete.forEach(person => {
                            console.log(`   - Eliminada persona: ${person.first_name} ${person.last_name}`);
                        });
                    } else {
                        console.log('✅ No se eliminaron personas (todas están en otros clientes)');
                    }
                }

                // 6. Finalmente, eliminar el cliente empresarial
                await client.query('DELETE FROM business_client WHERE id = $1', [id]);
                console.log('✅ Cliente empresarial eliminado completamente');

                await client.query('COMMIT');

                res.status(200).json({
                    success: true,
                    message: `Cliente empresarial "${clientData.name}" eliminado completamente del sistema`,
                    data: {
                        id: id,
                        name: clientData.name,
                        code: clientData.code,
                        deletedPersons: personsResult.rows.length,
                        deletedOffices: officesResult.rows.length
                    }
                });

            } catch (transactionError) {
                console.error('Error durante la transacción:', transactionError);
                await client.query('ROLLBACK');
                throw transactionError;
            }

        } catch (error) {
            console.error('Error en BusinessClientRegistrationController.deleteBusinessClient:', error);
            
            if (client) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Error al hacer rollback:', rollbackError);
                }
            }
            
            // Determinar el tipo de error para dar una respuesta más específica
            let errorMessage = 'Error interno del servidor al eliminar el Cliente Empresa';
            let statusCode = 500;
            
            if (error.code === '23503') { // Foreign key violation
                errorMessage = 'No se puede eliminar el cliente porque tiene datos asociados que no se pueden eliminar';
                statusCode = 400;
            } else if (error.code === '23505') { // Unique constraint violation
                errorMessage = 'Error de restricción única al eliminar el cliente';
                statusCode = 400;
            }
            
            res.status(statusCode).json({
                success: false,
                message: errorMessage,
                error: error.message
            });
        } finally {
            if (client) {
                try {
                    client.release();
                } catch (releaseError) {
                    console.error('Error al liberar cliente:', releaseError);
                }
            }
        }
    }

    static async validateDuplicate(req, res) {
        try {
            console.log('=== VALIDANDO DUPLICADO ===');
            const { fieldType, value } = req.body;
            
            if (!fieldType || !value) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de campo y valor son requeridos'
                });
            }

            console.log(`Validando ${fieldType} = ${value}`);

            let isDuplicate = false;
            let message = '';
            let duplicateDetails = null;

            switch (fieldType) {
                case 'document_number':
                    // Validar CI/NIT en business_client
                    const existingBusinessClient = await BusinessClientModel.getByDocumentNumber(value);
                    isDuplicate = !!existingBusinessClient;
                    if (isDuplicate) {
                        message = `El CI/NIT "${value}" ya está registrado en el sistema`;
                        duplicateDetails = {
                            type: 'business_client',
                            name: existingBusinessClient.name,
                            code: existingBusinessClient.code
                        };
                    }
                    break;

                case 'dni':
                    // Validar DNI en person y obtener información detallada
                    const existingPerson = await PersonModel.getByDni(value);
                    isDuplicate = !!existingPerson;
                    
                    if (isDuplicate) {
                        // Obtener información detallada de la persona y sus roles
                        const personDetailsQuery = `
                            SELECT 
                                p.first_name,
                                p.last_name,
                                p.dni,
                                bc.name as business_client_name,
                                bc.code as business_client_code,
                                rt.name as role_name,
                                o.name as office_name
                            FROM person p
                            JOIN business_person_role bpr ON p.id = bpr.person_id
                            JOIN business_client bc ON bpr.business_client_id = bc.id
                            JOIN role_type rt ON bpr.role_type_id = rt.id
                            LEFT JOIN office o ON bpr.office_id = o.id
                            WHERE p.dni = $1 AND p.is_active = true AND bc.is_active = true
                            ORDER BY bc.name, rt.name
                        `;
                        
                        const detailsResult = await db.query(personDetailsQuery, [value]);
                        
                        if (detailsResult.rows.length > 0) {
                            const person = detailsResult.rows[0];
                            const roles = detailsResult.rows.map(row => {
                                const roleInfo = `${row.role_name}`;
                                const officeInfo = row.office_name ? ` en oficina "${row.office_name}"` : '';
                                return `${roleInfo}${officeInfo}`;
                            });
                            
                            const uniqueRoles = [...new Set(roles)];
                            const rolesText = uniqueRoles.join(', ');
                            
                            message = `El DNI/CI "${value}" pertenece a ${person.first_name} ${person.last_name}, quien tiene el rol de ${rolesText} en el Cliente Empresa "${person.business_client_name}" (${person.business_client_code})`;
                            
                            duplicateDetails = {
                                type: 'person',
                                personName: `${person.first_name} ${person.last_name}`,
                                businessClientName: person.business_client_name,
                                businessClientCode: person.business_client_code,
                                roles: uniqueRoles
                            };
                        } else {
                            message = `El DNI/CI "${value}" ya está registrado en el sistema`;
                        }
                    }
                    break;

                case 'email':
                    // Validar email en person y obtener información detallada
                    const existingEmail = await PersonModel.getByEmail(value);
                    isDuplicate = !!existingEmail;
                    
                    if (isDuplicate) {
                        // Obtener información detallada de la persona y sus roles
                        const emailDetailsQuery = `
                            SELECT 
                                p.first_name,
                                p.last_name,
                                p.email,
                                bc.name as business_client_name,
                                bc.code as business_client_code,
                                rt.name as role_name,
                                o.name as office_name
                            FROM person p
                            JOIN business_person_role bpr ON p.id = bpr.person_id
                            JOIN business_client bc ON bpr.business_client_id = bc.id
                            JOIN role_type rt ON bpr.role_type_id = rt.id
                            LEFT JOIN office o ON bpr.office_id = o.id
                            WHERE p.email = $1 AND p.is_active = true AND bc.is_active = true
                            ORDER BY bc.name, rt.name
                        `;
                        
                        const emailDetailsResult = await db.query(emailDetailsQuery, [value]);
                        
                        if (emailDetailsResult.rows.length > 0) {
                            const person = emailDetailsResult.rows[0];
                            const roles = emailDetailsResult.rows.map(row => {
                                const roleInfo = `${row.role_name}`;
                                const officeInfo = row.office_name ? ` en oficina "${row.office_name}"` : '';
                                return `${roleInfo}${officeInfo}`;
                            });
                            
                            const uniqueRoles = [...new Set(roles)];
                            const rolesText = uniqueRoles.join(', ');
                            
                            message = `El email "${value}" pertenece a ${person.first_name} ${person.last_name}, quien tiene el rol de ${rolesText} en el cliente empresarial "${person.business_client_name}" (${person.business_client_code})`;
                            
                            duplicateDetails = {
                                type: 'person',
                                personName: `${person.first_name} ${person.last_name}`,
                                businessClientName: person.business_client_name,
                                businessClientCode: person.business_client_code,
                                roles: uniqueRoles
                            };
                        } else {
                            message = `El email "${value}" ya está registrado en el sistema`;
                        }
                    }
                    break;

                case 'cellphone':
                    // Validar celular en person y obtener información detallada
                    const existingCellphone = await PersonModel.getByCellphone(value);
                    isDuplicate = !!existingCellphone;
                    
                    if (isDuplicate) {
                        // Obtener información detallada de la persona y sus roles
                        const cellphoneDetailsQuery = `
                            SELECT 
                                p.first_name,
                                p.last_name,
                                p.cellphone,
                                bc.name as business_client_name,
                                bc.code as business_client_code,
                                rt.name as role_name,
                                o.name as office_name
                            FROM person p
                            JOIN business_person_role bpr ON p.id = bpr.person_id
                            JOIN business_client bc ON bpr.business_client_id = bc.id
                            JOIN role_type rt ON bpr.role_type_id = rt.id
                            LEFT JOIN office o ON bpr.office_id = o.id
                            WHERE p.cellphone = $1 AND p.is_active = true AND bc.is_active = true
                            ORDER BY bc.name, rt.name
                        `;
                        
                        const cellphoneDetailsResult = await db.query(cellphoneDetailsQuery, [value]);
                        
                        if (cellphoneDetailsResult.rows.length > 0) {
                            const person = cellphoneDetailsResult.rows[0];
                            const roles = cellphoneDetailsResult.rows.map(row => {
                                const roleInfo = `${row.role_name}`;
                                const officeInfo = row.office_name ? ` en oficina "${row.office_name}"` : '';
                                return `${roleInfo}${officeInfo}`;
                            });
                            
                            const uniqueRoles = [...new Set(roles)];
                            const rolesText = uniqueRoles.join(', ');
                            
                            message = `El celular "${value}" pertenece a ${person.first_name} ${person.last_name}, quien tiene el rol de ${rolesText} en el Cliente Empresa "${person.business_client_name}" (${person.business_client_code})`;
                            
                            duplicateDetails = {
                                type: 'person',
                                personName: `${person.first_name} ${person.last_name}`,
                                businessClientName: person.business_client_name,
                                businessClientCode: person.business_client_code,
                                roles: uniqueRoles
                            };
                        } else {
                            message = `El celular "${value}" ya está registrado en el sistema`;
                        }
                    }
                    break;

                case 'phone':
                    // Validar teléfono en office
                    const existingPhone = await OfficeModel.getByPhone(value);
                    isDuplicate = !!existingPhone;
                    if (isDuplicate) {
                        // Obtener información de la oficina
                        const officeDetailsQuery = `
                            SELECT 
                                o.name as office_name,
                                bc.name as business_client_name,
                                bc.code as business_client_code
                            FROM office o
                            JOIN business_client bc ON o.business_client_id = bc.id
                            WHERE o.phone = $1 AND o.is_active = true AND bc.is_active = true
                        `;
                        
                        const officeDetailsResult = await db.query(officeDetailsQuery, [value]);
                        
                        if (officeDetailsResult.rows.length > 0) {
                            const office = officeDetailsResult.rows[0];
                            message = `El teléfono "${value}" pertenece a la oficina "${office.office_name}" del Cliente Empresa "${office.business_client_name}" (${office.business_client_code})`;
                            
                            duplicateDetails = {
                                type: 'office',
                                officeName: office.office_name,
                                businessClientName: office.business_client_name,
                                businessClientCode: office.business_client_code
                            };
                        } else {
                            message = `El teléfono "${value}" ya está registrado en el sistema`;
                        }
                    }
                    break;

                case 'office_email':
                    // Validar email en office
                    const existingOfficeEmail = await OfficeModel.getByEmail(value);
                    isDuplicate = !!existingOfficeEmail;
                    if (isDuplicate) {
                        // Obtener información de la oficina
                        const officeEmailDetailsQuery = `
                            SELECT 
                                o.name as office_name,
                                bc.name as business_client_name,
                                bc.code as business_client_code
                            FROM office o
                            JOIN business_client bc ON o.business_client_id = bc.id
                            WHERE o.email = $1 AND o.is_active = true AND bc.is_active = true
                        `;
                        
                        const officeEmailDetailsResult = await db.query(officeEmailDetailsQuery, [value]);
                        
                        if (officeEmailDetailsResult.rows.length > 0) {
                            const office = officeEmailDetailsResult.rows[0];
                            message = `El email "${value}" pertenece a la oficina "${office.office_name}" del Cliente Empresa "${office.business_client_name}" (${office.business_client_code})`;
                            
                            duplicateDetails = {
                                type: 'office',
                                officeName: office.office_name,
                                businessClientName: office.business_client_name,
                                businessClientCode: office.business_client_code
                            };
                        } else {
                            message = `El email "${value}" ya está registrado en el sistema`;
                        }
                    }
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de campo no válido'
                    });
            }

            console.log(`Resultado de validación: ${isDuplicate ? 'DUPLICADO' : 'NO DUPLICADO'}`);
            if (isDuplicate) {
                console.log('Mensaje de error:', message);
            }

            res.status(200).json({
                success: true,
                isDuplicate: isDuplicate,
                message: message,
                fieldType: fieldType,
                value: value,
                duplicateDetails: duplicateDetails
            });

        } catch (error) {
            console.error('Error en BusinessClientRegistrationController.validateDuplicate:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al validar duplicado',
                error: error.message
            });
        }
    }

    static async getBusinessClientById(req, res) {
        try {
            console.log('=== OBTENIENDO CLIENTE EMPRESARIAL POR ID ===');
            const { id } = req.params;
            console.log('ID recibido:', id);
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial es requerido'
                });
            }

            // 1. Obtener datos del cliente empresarial (solo columnas que existen)
            console.log('=== BUSCANDO CLIENTE EN business_client ===');
            const clientQuery = `
                SELECT 
                    bc.id,
                    bc.code,
                    bc.name,
                    bc.document_number,
                    bc.iata_number,
                    bc.business_client_type_id,
                    bc.centralized_payment,
                    bc.country_id,
                    bc.created_at,
                    bc.updated_at,
                    c.name as country_name
                FROM business_client bc
                LEFT JOIN country c ON bc.country_id = c.id
                WHERE bc.id = $1 AND bc.is_active = true
            `;
            
            const clientResult = await db.query(clientQuery, [id]);
            console.log('Resultado de cliente:', clientResult.rows);
            
            if (clientResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente empresarial no encontrado'
                });
            }

            const clientData = clientResult.rows[0];
            console.log('✅ Cliente encontrado:', clientData.name);

            // 2. Obtener datos del gerente general usando business_person_role
            console.log('=== BUSCANDO GERENTE EN business_person_role ===');
            let gerente = null;
            
            try {
                // Primero obtener el ID del rol "Gerente General"
                const roleQuery = `SELECT id FROM role_type WHERE name = 'Gerente General'`;
                const roleResult = await db.query(roleQuery);
                
                if (roleResult.rows.length === 0) {
                    console.log('⚠️ No se encontró el rol "Gerente General"');
                    gerente = null;
                } else {
                    const gerenteRoleId = roleResult.rows[0].id;
                    console.log('✅ ID del rol Gerente General:', gerenteRoleId);
                    
                    // Ahora buscar la persona con ese rol para este cliente
                    const gerenteQuery = `
                        SELECT 
                            p.id,
                            p.first_name,
                            p.last_name,
                            p.dni,
                            p.gender,
                            p.birthdate,
                            p.email,
                            p.cellphone,
                            p.address,
                            p.postal_code,
                            p.country_id,
                            p.city_id,
                            p.dni_country_id
                        FROM business_person_role bpr
                        JOIN person p ON bpr.person_id = p.id
                        WHERE bpr.business_client_id = $1 
                        AND bpr.role_type_id = $2
                        AND bpr.is_active = true
                        AND p.is_active = true
                        LIMIT 1
                    `;
                    
                    const gerenteResult = await db.query(gerenteQuery, [id, gerenteRoleId]);
                    console.log('Resultado de gerente:', gerenteResult.rows);
                    
                    if (gerenteResult.rows.length > 0) {
                        gerente = gerenteResult.rows[0];
                        console.log('✅ Gerente encontrado:', gerente.first_name, gerente.last_name);
                    } else {
                        console.log('⚠️ No se encontró gerente para este cliente');
                    }
                }
            } catch (gerenteError) {
                console.error('Error obteniendo gerente:', gerenteError);
                gerente = null;
            }

            // 3. Combinar datos y enviar respuesta
            const responseData = {
                ...clientData,
                gerente: gerente
            };

            console.log('✅ Cliente empresarial obtenido exitosamente');
            
            res.status(200).json({
                success: true,
                message: 'Cliente empresarial obtenido exitosamente',
                data: responseData
            });

        } catch (error) {
            console.error('Error en BusinessClientRegistrationController.getBusinessClientById:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener cliente empresarial',
                error: error.message
            });
        }
    }

    static async updateBusinessClient(req, res) {
        let client = null;
        
        try {
            console.log('=== ACTUALIZANDO CLIENTE EMPRESARIAL ===');
            const { id } = req.params;
            const { clienteEmpresa, gerenteGeneral } = req.body;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del cliente empresarial es requerido'
                });
            }

            // Verificar que el cliente existe
            const existingClientQuery = 'SELECT id, name FROM business_client WHERE id = $1 AND is_active = true';
            const existingClientResult = await db.query(existingClientQuery, [id]);
            
            if (existingClientResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente empresarial no encontrado'
                });
            }

            // Iniciar transacción
            client = await db.getClient();
            await client.query('BEGIN');

            // 1. Actualizar datos del cliente empresarial
            console.log('=== ACTUALIZANDO DATOS DEL CLIENTE EMPRESARIAL ===');
            const updateClientQuery = `
                UPDATE business_client 
                SET 
                    name = $1,
                    document_number = $2,
                    iata_number = $3,
                    business_client_type_id = $4,
                    centralized_payment = $5,
                    updated_at = NOW()
                WHERE id = $6
            `;
            
            const updateClientValues = [
                clienteEmpresa.nombreEmpresa,
                clienteEmpresa.ciNitEmpresa,
                clienteEmpresa.numeroIataEmpresa,
                clienteEmpresa.tipoClienteEmpresa,
                clienteEmpresa.pagoSeleccionado === 'centralizado',
                id
            ];

            await client.query(updateClientQuery, updateClientValues);
            console.log('✅ Cliente empresarial actualizado');

            // 2. Actualizar datos del gerente general
            if (gerenteGeneral) {
                console.log('=== ACTUALIZANDO DATOS DEL GERENTE GENERAL ===');
                
                // Obtener el ID del gerente
                const gerenteQuery = `
                    SELECT p.id 
                    FROM business_person_role bpr
                    JOIN person p ON bpr.person_id = p.id
                    WHERE bpr.business_client_id = $1 
                    AND bpr.role_type_id = (SELECT id FROM role_type WHERE name = 'Gerente General')
                    AND bpr.is_active = true
                    LIMIT 1
                `;
                
                const gerenteResult = await client.query(gerenteQuery, [id]);
                
                if (gerenteResult.rows.length > 0) {
                    const gerenteId = gerenteResult.rows[0].id;
                    
                    // Actualizar persona
                    const updatePersonQuery = `
                        UPDATE person 
                        SET 
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
                    `;
                    
                    const updatePersonValues = [
                        gerenteGeneral.nombreGerente,
                        gerenteGeneral.apellidoGerente,
                        gerenteGeneral.dniCiGerente,
                        gerenteGeneral.paisEmisionGerente,
                        gerenteGeneral.generoGerente === 'masculino' ? 'M' : 'F',
                        gerenteGeneral.fechaNacimientoGerente,
                        gerenteGeneral.correoElectronicoGerente,
                        gerenteGeneral.telefonoGerente,
                        gerenteGeneral.direccionGerente,
                        gerenteGeneral.codigoPostalGerente,
                        gerenteGeneral.paisResidenciaGerente,
                        gerenteGeneral.ciudadGerente,
                        gerenteId
                    ];

                    await client.query(updatePersonQuery, updatePersonValues);
                    console.log('✅ Gerente general actualizado');
                }
            }

            await client.query('COMMIT');

            console.log('✅ Cliente empresarial actualizado exitosamente');
            
            res.status(200).json({
                success: true,
                message: 'Cliente empresarial actualizado exitosamente',
                data: { id }
            });

        } catch (error) {
            if (client) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Error al hacer rollback:', rollbackError);
                }
            }
            
            console.error('Error en BusinessClientRegistrationController.updateBusinessClient:', error);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al actualizar cliente empresarial',
                error: error.message
            });
        } finally {
            if (client) {
                try {
                    client.release();
                } catch (releaseError) {
                    console.error('Error al liberar cliente:', releaseError);
                }
            }
        }
    }
}

module.exports = BusinessClientRegistrationController; 