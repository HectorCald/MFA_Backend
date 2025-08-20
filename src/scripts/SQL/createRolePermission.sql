-- ======================================
-- Tabla role_permission
-- ======================================
CREATE TABLE IF NOT EXISTS role_permission (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    updated_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha última actualización
    created_by UUID NOT NULL, -- Quién creó
    updated_by UUID, -- Quién actualizó
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role(id),
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_role_permission_created_by FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_role_permission_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);