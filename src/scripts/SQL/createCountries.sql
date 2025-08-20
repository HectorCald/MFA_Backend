-- ========================================================
-- Tabla: country
-- Descripción: Catálogo de países del mundo
-- ========================================================
CREATE TABLE IF NOT EXISTS country (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL,
    phone_code VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Restricción de unicidad
    CONSTRAINT uq_country_name UNIQUE (name),
    CONSTRAINT uq_country_code UNIQUE (code)
);

-- Insertar algunos países básicos
INSERT INTO country (name, code, phone_code) VALUES 
    ('Bolivia', 'BOL', '+591'),
    ('Argentina', 'ARG', '+54'),
    ('Brasil', 'BRA', '+55'),
    ('Chile', 'CHL', '+56'),
    ('Colombia', 'COL', '+57'),
    ('Ecuador', 'ECU', '+593'),
    ('Paraguay', 'PRY', '+595'),
    ('Perú', 'PER', '+51'),
    ('Uruguay', 'URY', '+598'),
    ('Venezuela', 'VEN', '+58'),
    ('Estados Unidos', 'USA', '+1'),
    ('España', 'ESP', '+34'),
    ('México', 'MEX', '+52')
ON CONFLICT (name) DO NOTHING; 