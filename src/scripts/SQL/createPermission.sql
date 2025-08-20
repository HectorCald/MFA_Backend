-- ======================================
-- Tabla: permission
-- ======================================
CREATE TABLE IF NOT EXISTS permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(50) NOT NULL, -- Ej. usuario
    action VARCHAR(50) NOT NULL,--Ej. asignar_rol
    scope VARCHAR(50),-- Ej. todos
    code VARCHAR(150) GENERATED ALWAYS AS (module || '.' || action || '.' || scope) STORED, --usuario.asignar.rol.todos
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    updated_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha última actualización
    created_by UUID NOT NULL, -- Quién creó
    updated_by UUID, -- Quién actualizó
    CONSTRAINT fk_permission_created_by FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_permission_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE
);