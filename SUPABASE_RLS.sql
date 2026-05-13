-- ESTRUCTURA DE SEGURIDAD RLS PARA SUPABASE (TYRETRACK ERP)

-- 1. Tablas Principales
-- branches, tires, sales, transfers, warranties, profiles

-- 2. Definición de Roles (Profiles table metadata)
-- role: 'vendedor', 'gerente', 'contador', 'superadmin'

-- ==========================================
-- POLÍTICAS PARA LA TABLA 'SALES' (VENTAS)
-- ==========================================

-- SuperAdmin: Todo acceso
CREATE POLICY "SuperAdmin full access" ON sales
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin'));

-- Vendedor: Solo crear y ver ventas de SU SUCURSAL
CREATE POLICY "Vendedor: Ver ventas de su sucursal" ON sales
  FOR SELECT TO authenticated
  USING (branch_id = (SELECT branch_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Vendedor: Registrar nuevas ventas" ON sales
  FOR INSERT TO authenticated
  WITH CHECK (branch_id = (SELECT branch_id FROM profiles WHERE id = auth.uid()));

-- ==========================================
-- POLÍTICAS PARA LA TABLA 'TIRES' (INVENTARIO)
-- ==========================================

-- Vendedor/Todos: Ver existencias y precios
CREATE POLICY "Public focus readable inventory" ON tires
  FOR SELECT TO authenticated
  USING (true);

-- ELIMINACIÓN DE VISIBILIDAD DE COSTO:
-- Sugerencia: El campo 'cost' debe estar en una tabla separada 'tire_financials' 
-- o usar una View que no incluya el campo 'cost' para roles no-admin.

-- ==========================================
-- LÓGICA DE TRASPASOS (TRANSFERS)
-- ==========================================

-- Bloqueo de Stock en Traspaso (Trigger Function)
CREATE OR REPLACE FUNCTION handle_inventory_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estatus cambia a 'RECIBIDO', sumar stock en destino
  IF (NEW.status = 'RECIBIDO' AND OLD.status != 'RECIBIDO') THEN
    UPDATE tires 
    SET stock = stock || jsonb_build_object(NEW.destination_branch_id, (COALESCE((stock->>NEW.destination_branch_id)::int, 0) + NEW.quantity))
    WHERE id = NEW.product_id;
  END IF;
  
  -- Si el estatus es 'PENDIENTE' (Salida), restar stock en origen
  IF (TG_OP = 'INSERT') THEN
    UPDATE tires 
    SET stock = stock || jsonb_build_object(NEW.origin_branch_id, (COALESCE((stock->>NEW.origin_branch_id)::int, 0) - NEW.quantity))
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transfer_status_change
  AFTER INSERT OR UPDATE ON transfers
  FOR EACH ROW EXECUTE FUNCTION handle_inventory_transfer();
