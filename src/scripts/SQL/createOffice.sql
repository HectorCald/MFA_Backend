-- ========================================================
-- Tabla: office
-- Descripción: Representa una oficina o sucursal perteneciente
-- a un cliente empresa. Contiene información de contacto
-- y ubicación. Relacionada a un país y ciudad.
-- ========================================================
CREATE TABLE IF NOT EXISTS office (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_client_id UUID NOT NULL,
    office_type_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    address TEXT NULL,
    postal_code VARCHAR(10),
    country_id UUID NOT NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(30) NULL,
    cellphone VARCHAR(30) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID NULL,
    updated_at TIMESTAMP NULL,
    city_id UUID NOT NULL,
    CONSTRAINT fk_office_business_client FOREIGN KEY (business_client_id) REFERENCES business_client(id) ON DELETE RESTRICT,
    CONSTRAINT fk_office_office_type FOREIGN KEY (office_type_id) REFERENCES office_type(id) ON DELETE RESTRICT,
    CONSTRAINT fk_office_country FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE RESTRICT,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES app_user(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id),
    CONSTRAINT fk_office_city FOREIGN KEY (city_id) REFERENCES city(id) ON DELETE RESTRICT
);
-- Índices recomendados para búsquedas
CREATE INDEX idx_office_name ON office (name);
CREATE INDEX idx_office_business_client ON office (business_client_id);
CREATE INDEX idx_office_office_type ON office (office_type_id);
CREATE INDEX idx_office_country ON office (country_id);