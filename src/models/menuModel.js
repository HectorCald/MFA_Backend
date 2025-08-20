const db = require('../config/db');

class MenuModel {
    static async getUserMenu(userPermissions) {
        try {
            console.log('🔍 Obteniendo menú para permisos:', userPermissions);
            
            if (!userPermissions || userPermissions.length === 0) {
                console.log('⚠️ Usuario sin permisos, retornando menú vacío');
                return [];
            }

            // Obtener menús que el usuario puede acceder según sus permisos
            const query = `
                SELECT DISTINCT
                    m.id,
                    m.code,
                    m.name,
                    m.parent_id,
                    m.path,
                    m.icon,
                    m.order_index,
                    m.is_active,
                    m.created_at,
                    m.updated_at
                FROM menu m
                INNER JOIN permission_menu pm ON m.id = pm.menu_id
                WHERE pm.permission_id = ANY($1)
                AND m.is_active = true
                ORDER BY m.order_index ASC, m.name ASC
            `;

            const result = await db.query(query, [userPermissions]);
            const allMenus = result.rows;

            console.log(`✅ Encontrados ${allMenus.length} menús accesibles`);

            // Construir la estructura jerárquica del menú
            const menuTree = this.buildMenuTree(allMenus);

            return menuTree;
        } catch (error) {
            console.error('❌ Error en MenuModel.getUserMenu:', error);
            throw error;
        }
    }
}

module.exports = MenuModel;
