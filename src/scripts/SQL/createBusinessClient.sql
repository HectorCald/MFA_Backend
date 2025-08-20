-- ========================================================
-- Tabla: business_client
-- Descripción: Almacena los datos de los clientes empresariales,
-- como agencias o empresas corporativas. Incluye información
-- de identificación fiscal, segmento y otros datos de negocio.
-- ========================================================
CREATE TABLE IF NOT EXISTS business_client (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    document_number VARCHAR(50) NOT NULL UNIQUE,
    iata_number VARCHAR(10),
    business_client_type_id UUID,
    centralized_payment BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    country_id UUID,
    CONSTRAINT uq_code UNIQUE (code),
    CONSTRAINT fk_business_client_type
        FOREIGN KEY (business_client_type_id) REFERENCES business_client_type(id) ON DELETE SET NULL,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES app_user(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id)
);

-- Índices adicionales (útiles para búsquedas frecuentes)
CREATE INDEX idx_business_client_name ON business_client (name);
CREATE INDEX idx_business_client_type ON business_client (business_client_type_id);
CREATE INDEX idx_business_client_document ON business_client (document_number);