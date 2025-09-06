-- Adicionar coluna password à tabela barbers
ALTER TABLE barbers ADD COLUMN password VARCHAR(255);

-- Definir senha inicial para todos os barbeiros
-- Senha: 123456 (hash bcrypt)
-- Hash gerado automaticamente pelo script setup-authentication.js
UPDATE barbers SET password = '$2b$10$FU2.T1CJn9wrAw9LVuCx1O24ryp7qSkyzjw9xJC.Cnn3h/xyA7HLS' WHERE password IS NULL;

-- Tornar a coluna password obrigatória após definir valores padrão
ALTER TABLE barbers ALTER COLUMN password SET NOT NULL;
