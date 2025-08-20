const PersonModel = require('../models/personModel');
const CountryModel = require('../models/countryModel');
const CityModel = require('../models/cityModel');

class PersonController {
    // Obtener todas las personas con información de país y ciudad
    static async getAllPersons(req, res) {
        try {
            const persons = await PersonModel.getAllWithDetails();
            res.json({
                success: true,
                data: persons,
                message: 'Personas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en PersonController.getAllPersons:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Buscar personas por diferentes criterios
    static async searchPersons(req, res) {
        try {
            const { 
                searchTerm, 
                dni, 
                dniCountryId,
                email, 
                countryId, 
                cityId,
                limit = 50,
                offset = 0 
            } = req.query;

            let persons;
            
            if (searchTerm) {
                // Búsqueda por término general (nombre, apellido, email, dni)
                persons = await PersonModel.searchByTerm(searchTerm, limit, offset);
            } else if (dni && dniCountryId) {
                // Búsqueda específica por DNI y país de emisión
                persons = await PersonModel.searchByDniAndCountry(dni, dniCountryId, limit, offset);
            } else if (dni) {
                // Búsqueda específica por DNI
                persons = await PersonModel.searchByDni(dni, limit, offset);
            } else if (email) {
                // Búsqueda específica por email
                persons = await PersonModel.searchByEmail(email, limit, offset);
            } else if (countryId || cityId) {
                // Búsqueda por país o ciudad
                persons = await PersonModel.searchByLocation(countryId, cityId, limit, offset);
            } else {
                // Si no hay criterios de búsqueda, devolver todas las personas
                persons = await PersonModel.getAllWithDetails(limit, offset);
            }

            res.json({
                success: true,
                data: persons,
                message: 'Búsqueda realizada exitosamente',
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: persons.length
                }
            });
        } catch (error) {
            console.error('Error en PersonController.searchPersons:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener persona por ID con detalles completos
    static async getPersonById(req, res) {
        try {
            const { id } = req.params;
            const person = await PersonModel.getByIdWithDetails(id);
            
            if (!person) {
                return res.status(404).json({
                    success: false,
                    message: 'Persona no encontrada'
                });
            }

            res.json({
                success: true,
                data: person,
                message: 'Persona obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error en PersonController.getPersonById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear una nueva persona
    static async createPerson(req, res) {
        try {
            const personData = req.body;
            
            // Validar datos requeridos
            if (!personData.first_name || !personData.last_name || !personData.dni) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, apellido y DNI son campos requeridos'
                });
            }

            const newPerson = await PersonModel.create(personData);
            
            res.status(201).json({
                success: true,
                data: newPerson,
                message: 'Persona creada exitosamente'
            });
        } catch (error) {
            console.error('Error en PersonController.createPerson:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener personas por cliente empresarial
    static async getPersonsByBusinessClientId(req, res) {
        try {
            const { businessClientId } = req.params;
            
            if (!businessClientId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del cliente empresarial es requerido'
                });
            }

            console.log(`🔍 Buscando personas del cliente empresarial: ${businessClientId}`);
            
            const persons = await PersonModel.getByBusinessClientId(businessClientId);
            
            console.log(`✅ Se encontraron ${persons.length} personas`);
            
            res.status(200).json({
                success: true,
                data: persons,
                message: 'Personas obtenidas exitosamente',
                count: persons.length
            });
        } catch (error) {
            console.error('❌ Error en PersonController.getPersonsByBusinessClientId:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las personas',
                error: error.message
            });
        }
    }
}

module.exports = PersonController;
