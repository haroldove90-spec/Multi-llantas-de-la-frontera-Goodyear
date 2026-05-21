-- ====================================================================
-- MULTILLANTAS DE LA FRONTERA - PLATAFORMA ERP COMPLETA
-- SCRIPT DE BASE DE DATOS ACTUALIZADO PARA SUPABASE
-- Incluye: Definición de Sucursales, Perfiles de Usuario, Control de Roles,
-- Configuración de Storage y Generación de Credenciales de Acceso.
-- ====================================================================

-- Habilitar extensión pgcrypto de Postgres para codificación segura de claves
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Tabla de Sucursales (5 Sucursales Autorizadas)
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY, -- e.g., 'matriz', 'norte', 'sur', 'oriente', 'poniente'
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  manager TEXT NOT NULL,
  phone TEXT NOT NULL,
  schedule TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DE SUCURSALES (Las 5 Sucursales de Multillantas de la Frontera)
-- Insertadas proactivamente aquí para asegurar que las referencias FK subsecuentes no fallen.
INSERT INTO public.branches (id, name, location, manager, phone, schedule)
VALUES 
  ('matriz',  'Helios',      'Av. Constitución 450, Monterrey, NL', 'Ing. Ricardo Salgado', '81 8345 6789', 'Lun-Vie 8:00 - 19:00, Sab 9:00 - 14:00')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;

INSERT INTO public.branches (id, name, location, manager, phone, schedule)
VALUES 
  ('norte',   'San Andres',  'Blvd. Manuel Ávila Camacho 23, CDMX', 'Lic. Martha Ruiz', '55 5234 5678', 'Lun-Vie 9:00 - 18:00, Sab 9:00 - 15:00')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;

INSERT INTO public.branches (id, name, location, manager, phone, schedule)
VALUES 
  ('sur',     'Industrial',  'Prolongación Montejo 12, Mérida, YUC', 'C.P. Julian Cantón', '999 923 4567', 'Lun-Vie 8:00 - 18:00, Sab 8:00 - 13:00')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;

INSERT INTO public.branches (id, name, location, manager, phone, schedule)
VALUES 
  ('oriente', 'Oriente',     'Av. Oriente 102, Veracruz, VER', 'Ing. Misael Esparza', '229 934 5678', 'Lun-Vie 8:00 - 18:00, Sab 8:00 - 14:00')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;

INSERT INTO public.branches (id, name, location, manager, phone, schedule)
VALUES 
  ('poniente','Poniente',    'Av. Poniente 870, Guadalajara, JAL', 'Alfredo Esparza', '333 456 7890', 'Lun-Vie 9:00 - 19:00, Sab 9:00 - 15:00')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;

-- 2. Tabla de Catálogo Principal de Llantas (Stock Maestro)
CREATE TABLE IF NOT EXISTS public.tires (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  width INTEGER NOT NULL,
  profile INTEGER NOT NULL,
  rim INTEGER NOT NULL,
  load_index TEXT NOT NULL,
  speed_rating TEXT NOT NULL,
  type TEXT CHECK (type IN ('AT', 'HT', 'MT')),
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  price1 DECIMAL(10, 2), -- Precio 1
  price2 DECIMAL(10, 2), -- Precio 2
  price_reseller DECIMAL(10, 2), -- Precio revendedor
  image_url TEXT, -- URL/Simulación de imagen
  name TEXT, -- Nombre del producto
  description TEXT, -- Descripción
  last_movement TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRACIÓN INDEPENDIENTE PARA AGREGAR COLUMNAS EN BASE DE DATOS ACTIVA
ALTER TABLE public.tires ADD COLUMN IF NOT EXISTS price1 DECIMAL(10, 2);
ALTER TABLE public.tires ADD COLUMN IF NOT EXISTS price2 DECIMAL(10, 2);
ALTER TABLE public.tires ADD COLUMN IF NOT EXISTS price_reseller DECIMAL(10, 2);
ALTER TABLE public.tires ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.tires ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.tires ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Tabla Secundaria de Existencias de Llantas por Sucursal
CREATE TABLE IF NOT EXISTS public.stocks (
  tire_id TEXT REFERENCES public.tires(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tire_id, branch_id)
);

-- 4. Tabla de Perfiles de Usuario (User Profiles)
-- Vinculado a auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY, -- Id correspondiente en auth.users
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT,
  branch_id TEXT REFERENCES public.branches(id), -- Nulo para administradores corporativos
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que la restricción de roles esté actualizada para soportar todos los roles de la matriz de permisos
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('superadmin', 'contador', 'vendedor', 'secretaria_facturista', 'credito_cobranza'));

-- 5. Ventas de Neumáticos
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY, -- ex: 'V-2001'
  branch_id TEXT REFERENCES public.branches(id) NOT NULL,
  seller_id TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('PUE', 'PPD')),
  payment_form TEXT CHECK (payment_form IN ('01', '03', '31', '99')),
  status TEXT CHECK (status IN ('Timbrada', 'Pendiente', 'Cancelada', 'CRP Generado')),
  cfdi_usage TEXT NOT NULL,
  rfc_recuper TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retiros y Artículos de Venta
CREATE TABLE IF NOT EXISTS public.sale_items (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
  tire_id TEXT REFERENCES public.tires(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traspasos entre Sucursales en Tiempo Real
CREATE TABLE IF NOT EXISTS public.transfers (
  id TEXT PRIMARY KEY, -- ex: 'T-1001'
  origin_branch_id TEXT REFERENCES public.branches(id),
  destination_branch_id TEXT REFERENCES public.branches(id),
  tire_id TEXT REFERENCES public.tires(id),
  quantity INTEGER NOT NULL,
  status TEXT CHECK (status IN ('En tránsito', 'Recibido', 'Cancelado')),
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantías Registradas (DOT, Kilometraje, Fotos, Veredicto)
CREATE TABLE IF NOT EXISTS public.warranties (
  id TEXT PRIMARY KEY, -- ex: 'G-001'
  dot TEXT NOT NULL,
  tire_id TEXT REFERENCES public.tires(id),
  mileage INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('Pendiente', 'Aprobada', 'Rechazada')),
  date TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT,
  diagnosis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración Global de Visuales y Personalización del ERP
CREATE TABLE IF NOT EXISTS public.app_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  theme JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- ====================================================================
-- CREACIÓN DE ACCESOS Y USUARIOS EN SUPABASE (auth.users y public.user_profiles)
-- ====================================================================

-- Función helper para registrar robustamente a un usuario en Supabase con su clave codificada
CREATE OR REPLACE FUNCTION public.create_erp_user(
  user_id UUID,
  fullname TEXT,
  user_email TEXT,
  clear_password TEXT,
  user_role TEXT,
  assigned_branch TEXT
) RETURNS VOID AS $$
BEGIN
  -- 1. Insertar en el esquema de autenticación nativa de Supabase (auth.users)
  -- NOTA: Se encripta la clave de manera segura utilizando pgcrypto de Postgres
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    extensions.crypt(clear_password, extensions.gen_salt('bf')),
    NOW(),
    jsonb_strip_nulls(json_build_object('provider', 'email', 'providers', array['email'])::jsonb),
    jsonb_strip_nulls(json_build_object('name', fullname, 'role', user_role)::jsonb),
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insertar en la tabla visible pública de Table Editor (public.user_profiles)
  INSERT INTO public.user_profiles (id, name, email, role, branch_id)
  VALUES (user_id, fullname, user_email, user_role, assigned_branch)
  ON CONFLICT (id) DO UPDATE 
    SET name = EXCLUDED.name, 
        role = EXCLUDED.role, 
        branch_id = EXCLUDED.branch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ====================================================================
-- INSERTAR LOS 8 USUARIOS SOLICITADOS CON SUS RESPECTIVOS ROLES Y NUEVO ACCESO ADMIN
-- ====================================================================

-- 0. Harold Anguiano (Rol: Administrador / Corporativo Global)
SELECT public.create_erp_user(
  'e04f0d3a-0e9e-4c78-9844-4861e6871a93'::UUID,
  'Harold Anguiano',
  'harold_anguiano@multillanta.com',
  '123_harold',
  'superadmin',
  NULL -- Acceso global multicentro
);

-- 1. Manuel Esparza (Rol: Administrador / Corporativo)
SELECT public.create_erp_user(
  '4a2f8b50-6a78-43d1-9bc0-de0dbf53e6b1'::UUID,
  'Manuel Esparza',
  'manuel_esparza@multillantas.com',
  '123_esparza',
  'superadmin',
  NULL -- Acceso global multicentro
);

-- 2. Manuel Villaseñor (Rol: Vendedor / Sucursal San Andres)
SELECT public.create_erp_user(
  'e632b724-ea66-441d-bca2-8dbbc429f5f1'::UUID,
  'Manuel Villaseñor',
  'manuel_villasenor@multillantas.com',
  '123_vendedor',
  'vendedor',
  'norte'
);

-- También insertamos el duplicado con el correo con dos puntos en caso de error/tipografía del cliente
SELECT public.create_erp_user(
  'e632b724-ea66-441d-bca2-8dbbc429f5f2'::UUID,
  'Manuel Villaseñor (Ty)',
  'manuel:villasenor@multillantas.com',
  '123_vendedor',
  'vendedor',
  'norte'
);

-- 3. Liliana Medina (Rol: Contador / Sucursal Helios)
SELECT public.create_erp_user(
  '4e3a890a-24cd-4b13-9111-96850cd0ea9a'::UUID,
  'Liliana Medina',
  'liliana_medina@multillantas.com',
  '123_contador',
  'contador',
  'matriz'
);

-- 4. Mario Vargas (Rol: Vendedor / Sucursal Helios)
SELECT public.create_erp_user(
  'b0af7d6b-07b9-44be-99bb-9fd0b1f28b5e'::UUID,
  'Mario Vargas',
  'mario_vargas@multillantas.com',
  '123_vendedor',
  'vendedor',
  'matriz'
);

-- 5. Magdalena López (Rol: Secretaria Facturista / Sucursal Helios)
SELECT public.create_erp_user(
  'c3fc7b4a-a435-4122-83b6-200c870bfde5'::UUID,
  'Magdalena López',
  'magdalena_lopez@multillantas.com',
  '123_facturista',
  'secretaria_facturista',
  'matriz'
);

-- 6. Cristian Esparza (Rol: Vendedor / Sucursal Oriente)
SELECT public.create_erp_user(
  '18efbd9d-2ba3-4c90-99af-2d12521f7ed3'::UUID,
  'Cristian Esparza',
  'cristian_esparza@multillantas.com',
  '123_vendedor',
  'vendedor',
  'oriente'
);

-- 7. Misael Esparza (Rol: Crédito y Cobranza / Sucursal Poniente)
SELECT public.create_erp_user(
  '0fab1bde-6534-4e20-9bfb-2c8dfd9bebc3'::UUID,
  'Misael Esparza',
  'misael_esparza@multillantas.com',
  '123_credito',
  'credito_cobranza',
  'poniente'
);

-- 8. Alfredo Esparza (Rol: Vendedor / Sucursal Industrial)
SELECT public.create_erp_user(
  'de8fb72a-1cba-4eef-bbf1-8a901ff2a7e4'::UUID,
  'Alfredo Esparza',
  'alfredo_esparza@miltillantas.com',
  '123_vendedor',
  'vendedor',
  'sur'
);


-- ====================================================================
-- CONFIGURACIÓN DE STORAGE BUCKETS (Garantías y Documentos)
-- ====================================================================

-- Crear un bucket público para fotos de garantías en el sistema
INSERT INTO storage.buckets (id, name, public) 
VALUES ('warranties', 'warranties', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para permitir a los usuarios autenticados subir fotos
CREATE POLICY "Permitir subida a usuarios autenticados" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'warranties');

CREATE POLICY "Permitir lectura pública de fotos" 
  ON storage.objects FOR SELECT 
  TO public 
  USING (bucket_id = 'warranties');


-- ====================================================================
-- POLÍTICAS DE ACCESO RLS (Row Level Security) SEGURAS
-- ====================================================================

-- Restablecer políticas en public.user_profiles
DROP POLICY IF EXISTS "Public Read" ON public.user_profiles;

CREATE POLICY "Lectura Pública de Perfiles" 
  ON public.user_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Actualización del propio perfil" 
  ON public.user_profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Forzar habilitación de RLS para robustez
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de branches
DROP POLICY IF EXISTS "Public Read" ON public.branches;
CREATE POLICY "Lectura Pública Sucursales" ON public.branches FOR SELECT USING (true);

-- Permitir edición de la app_config global
DROP POLICY IF EXISTS "Public Read" ON public.app_config;
DROP POLICY IF EXISTS "Public Write" ON public.app_config;
CREATE POLICY "Configuración ERP Pública" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Edición ERP Permitida" ON public.app_config FOR ALL USING (true);

-- Limpieza de la función helper de instalación para seguridad
DROP FUNCTION IF EXISTS public.create_erp_user;
