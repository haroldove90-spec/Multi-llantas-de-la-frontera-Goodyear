# Matriz de Roles y Permisos (RBAC) - TyreTrack ERP

| Módulo | SuperAdmin | Gerente de Sucursal | Contador | Vendedor |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Total (Multi-sede) | Local (Su Sede) | Bloqueado | Bloqueado |
| **Inventario** | CRUD + Costos | CRUD (Local) + Costos | Lectura (Sin Costos) | Lectura (Sin Costos) |
| **Ventas** | Ver Reportes | Gestionar (Su Sede) | Ver Reportes | Crear Ventas |
| **Traspasos** | Autorizar Todos | Gestionar (Su Sede) | Bloqueado | Bloqueado |
| **Garantías** | Ver / Borrar | Gestionar (Su Sede) | Bloqueado | Registrar |
| **Centro Fiscal** | Full Access | Ver / Descargar | Gestionar XML/PDF | Bloqueado |
| **Sucursales** | CRUD Total | Bloqueado | Bloqueado | Bloqueado |

## Restricciones Específicas
- **Vendedor:** No puede ver el campo `costo` en ninguna vista. Descuentos máximos del 3%.
- **Contador:** No tiene botones de acción (Crear, Editar, Borrar) en ningún módulo excepto en Carga de Documentos Fiscales.
- **Gerente:** Solo puede operar transacciones que involucren su `branchId` asignado.
