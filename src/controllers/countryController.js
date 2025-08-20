const CountryModel = require('../models/countryModel');

class CountryController {
    /**
     * Obtener todos los países
     * GET /api/countries
     */
    static async getAllCountries(req, res) {
        try {
            console.log('🌍 Obteniendo todos los países...');
            
            const countries = await CountryModel.getAllCountries();
            
            console.log(`✅ Se encontraron ${countries.length} países`);
            
            res.status(200).json({
                success: true,
                message: 'Países obtenidos exitosamente',
                data: countries,
                count: countries.length
            });
        } catch (error) {
            console.error('❌ Error en CountryController.getAllCountries:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener los países',
                error: error.message
            });
        }
    }

    /**
     * Obtener un país por ID
     * GET /api/countries/:id
     */
    static async getCountryById(req, res) {
        try {
            const { id } = req.params;
            
            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del país debe ser un número válido'
                });
            }

            console.log(`🌍 Obteniendo país con ID: ${id}`);
            
            const country = await CountryModel.getCountryById(id);
            
            if (!country) {
                return res.status(404).json({
                    success: false,
                    message: 'País no encontrado'
                });
            }

            console.log(`✅ País encontrado: ${country.name}`);
            
            res.status(200).json({
                success: true,
                message: 'País obtenido exitosamente',
                data: country
            });
        } catch (error) {
            console.error('❌ Error en CountryController.getCountryById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener el país',
                error: error.message
            });
        }
    }

    /**
     * Buscar un país por nombre
     * GET /api/countries/search?name=nombre
     */
    static async getCountryByName(req, res) {
        try {
            const { name } = req.query;
            
            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro "name" es requerido'
                });
            }

            console.log(`🔍 Buscando país con nombre: ${name}`);
            
            const country = await CountryModel.getCountryByName(name.trim());
            
            if (!country) {
                return res.status(404).json({
                    success: false,
                    message: 'País no encontrado'
                });
            }

            console.log(`✅ País encontrado: ${country.name}`);
            
            res.status(200).json({
                success: true,
                message: 'País encontrado exitosamente',
                data: country
            });
        } catch (error) {
            console.error('❌ Error en CountryController.getCountryByName:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar el país',
                error: error.message
            });
        }
    }

    /**
     * Buscar un país por código
     * GET /api/countries/code/:code
     */
    static async getCountryByCode(req, res) {
        try {
            const { code } = req.params;
            
            if (!code || code.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El código del país es requerido'
                });
            }

            console.log(`🔍 Buscando país con código: ${code}`);
            
            const country = await CountryModel.getCountryByCode(code.trim());
            
            if (!country) {
                return res.status(404).json({
                    success: false,
                    message: 'País no encontrado'
                });
            }

            console.log(`✅ País encontrado: ${country.name} (${country.code})`);
            
            res.status(200).json({
                success: true,
                message: 'País encontrado exitosamente',
                data: country
            });
        } catch (error) {
            console.error('❌ Error en CountryController.getCountryByCode:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar el país',
                error: error.message
            });
        }
    }
}

module.exports = CountryController; 