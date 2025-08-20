-- ======================================
-- Tabla permission_menu
-- ======================================
CREATE TABLE IF NOT EXISTS permission_menu (
    permission_id UUID NOT NULL,
    menu_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    created_by UUID NOT NULL, -- Quién creó
    PRIMARY KEY (permission_id, menu_id),
    -- Definición de las claves foráneas que hacen referencia a otras tablas.
    CONSTRAINT fk_permission_menu_permission FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_permission_menu_menu FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_permission_menu_created_by 
         FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE
);