-- ======================================
-- Tabla: role
-- ======================================
CREATE TABLE IF NOT EXISTS role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,--Es el nombre descriptivo del rol (Ej. "Administrador").
    code VARCHAR(30) NOT NULL UNIQUE,-- Identificador corto  Ejemplo: "admin", "super_admin", "agent".
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    updated_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha última actualización
    created_by UUID NOT NULL, -- Quién creó
    updated_by UUID, -- Quién actualizó
    -- CONSTRAINTS
    CONSTRAINT fk_role_created_by FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_role_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE
);