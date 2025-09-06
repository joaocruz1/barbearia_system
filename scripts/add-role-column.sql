-- Adicionar coluna role à tabela barbers
ALTER TABLE barbers ADD COLUMN role VARCHAR(20) DEFAULT 'funcionario';

-- Adicionar coluna is_active à tabela barbers
ALTER TABLE barbers ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Definir o primeiro barbeiro como admin (você pode alterar o ID conforme necessário)
UPDATE barbers SET role = 'admin' WHERE id = '25aad185-561b-4ec0-a570-a6d35d513868'; -- Bruno Souza

-- Tornar as colunas obrigatórias após definir valores padrão
ALTER TABLE barbers ALTER COLUMN role SET NOT NULL;
ALTER TABLE barbers ALTER COLUMN is_active SET NOT NULL;
