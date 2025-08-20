-- ========================================================
-- Tabla: business_person_role
-- Descripción: Tabla de unión (many-to-many) que asigna
-- uno o más tipos de roles a una persona de negocio específica.
-- Define el rol que una persona tiene dentro de la estructura
-- de un negocio o empresa. Ej. Gerente General, Contacto Contable
-- ========================================================
CREATE TABLE IF NOT EXISTS business_person_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_client_id UUID NOT NULL,
    person_id UUID NOT NULL,
    role_type_id UUID NOT NULL,
    office_id UUID NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID NULL,
    updated_at TIMESTAMP NULL,
    -- Constraints de integridad referencial
    CONSTRAINT fk_bpr_business_client
        FOREIGN KEY (business_client_id) REFERENCES business_client(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_bpr_person
        FOREIGN KEY (person_id) REFERENCES person(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_bpr_role_type
        FOREIGN KEY (role_type_id) REFERENCES role_type(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_bpr_office
        FOREIGN KEY (office_id) REFERENCES office(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES app_user(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id)
    -- Evita duplicidad de asignaciones para una misma persona en una oficina
    CONSTRAINT uq_person_role_unique
        UNIQUE (business_client_id, person_id, role_type_id, office_id)
);
-- Índices adicionales recomendados para optimización de búsquedas
CREATE INDEX idx_bpr_business_client ON business_person_role (id);
CREATE INDEX idx_bpr_person ON business_person_role (id);
CREATE INDEX idx_bpr_role_type ON business_person_role (id);
CREATE INDEX idx_bpr_office ON business_person_role (id);