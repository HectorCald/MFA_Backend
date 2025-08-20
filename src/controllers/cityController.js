const CityModel = require('../models/cityModel');

class CityController {
    /**
     * Obtener todos los países
     * GET /api/countries
     */
    static async getAllCities(req, res) {
        try {
            console.log('🌍 Obteniendo todos los países...');
            
            const cities = await CityModel.getAllCities();
            
            console.log(`✅ Se encontraron ${cities.length} ciudades`);
            
            res.status(200).json({
                success: true,
                message: 'Ciudades obtenidas exitosamente',
                data: cities,
                count: cities.length
            });
        } catch (error) {
            console.error('❌ Error en CityController.getAllCities:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las ciudades',
                error: error.message
            });
        }
    }

    /**
     * Obtener un país por ID
     * GET /api/countries/:id
     */
    static async getCityById(req, res) {
        try {
            const { id } = req.params;
            
            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de la ciudad debe ser un número válido'
                });
            }

            console.log(`🌍 Obteniendo ciudad con ID: ${id}`);
            
            const city = await CityModel.getCityById(id);
            
            if (!city) {
                return res.status(404).json({
                    success: false,
                    message: 'Ciudad no encontrada'
                });
            }

            console.log(`✅ Ciudad encontrada: ${city.name}`);
            
            res.status(200).json({
                success: true,
                message: 'Ciudad obtenida exitosamente',
                data: city
            });
        } catch (error) {
                console.error('❌ Error en CityController.getCityById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener la ciudad',
                error: error.message
            });
        }
    }

    /**
     * Buscar un país por nombre
     * GET /api/countries/search?name=nombre
     */
    static async getCityByName(req, res) {
        try {
            const { name } = req.query;
            
            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro "name" es requerido'
                });
            }

            console.log(`🔍 Buscando ciudad con nombre: ${name}`);
            
            const city = await CityModel.getCityByName(name.trim());
            
            if (!city) {
                return res.status(404).json({
                    success: false,
                    message: 'Ciudad no encontrada'
                });
            }

            console.log(`✅ Ciudad encontrada: ${city.name}`);
            
            res.status(200).json({
                success: true,
                message: 'Ciudad encontrada exitosamente',
                data: city
            });
        } catch (error) {
            console.error('❌ Error en CityController.getCityByName:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar la ciudad',
                error: error.message
            });
        }
    }

    /**
     * Buscar un país por código
     * GET /api/countries/code/:code
     */
    static async getCityByCode(req, res) {
        try {
            const { code } = req.params;
            
            if (!code || code.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El código de la ciudad es requerido'
                });
            }

                console.log(`🔍 Buscando ciudad con código: ${code}`);
            
            const city = await CityModel.getCityByCode(code.trim());
            
            if (!city) {
                return res.status(404).json({
                    success: false,
                    message: 'Ciudad no encontrada'
                });
            }

            console.log(`✅ Ciudad encontrada: ${city.name} (${city.code})`);
            
            res.status(200).json({
                success: true,
                message: 'Ciudad encontrada exitosamente',
                data: city
            });
        } catch (error) {
            console.error('❌ Error en CityController.getCityByCode:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar la ciudad',
                error: error.message
            });
        }
    }

    /**
     * Buscar ciudades por ID de país
     * GET /api/cities/country/:countryId
     */
    static async getCityByCountryId(req, res) {
        try {
            const { countryId } = req.params;
            
            if (!countryId || countryId.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del país es requerido'
                });
            }

            console.log(`🔍 Buscando ciudades para el país con ID: ${countryId}`);
            
            const cities = await CityModel.getCityByCountryId(countryId);
            
            console.log(`✅ Se encontraron ${cities.length} ciudades para el país ${countryId}`);
            
            res.status(200).json({
                success: true,
                message: 'Ciudades obtenidas exitosamente',
                data: cities,
                count: cities.length
            });
        } catch (error) {
            console.error('❌ Error en CityController.getCityByCountryId:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar las ciudades',
                error: error.message
            });
        }
    }
}

module.exports = CityController; 