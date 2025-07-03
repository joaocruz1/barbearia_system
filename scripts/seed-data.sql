-- Inserir dados iniciais

-- Localidades
INSERT INTO locations (name, address) VALUES
('Rua 13', 'Rua 13, Centro'),
('Avenida', 'Avenida Principal, Centro'),
('Inconfidentes', 'Bairro Inconfidentes'),
('Ouro Fino', 'Ouro Fino, MG');

-- Planos
INSERT INTO plans (name, price, description, benefits) VALUES
('Barbearia Premium', 125.90, 'Plano completo com corte e barba ilimitados', 
 '{"corte_ilimitado": true, "barba_ilimitada": true, "desconto_produtos": true, "sorteio_brindes": true, "desconto_outros_servicos": true}'),
('Cabelo VIP', 69.90, 'Corte de cabelo ilimitado', 
 '{"corte_ilimitado": true, "desconto_produtos": true, "sorteio_brindes": true, "desconto_outros_servicos": true}'),
('Barba VIP', 69.90, 'Barba ilimitada', 
 '{"barba_ilimitada": true, "desconto_produtos": true, "sorteio_brindes": true, "desconto_outros_servicos": true}'),
('Avulso', 0.00, 'Serviços pagos individualmente', '{}');

-- Serviços
INSERT INTO services (name, price, duration_minutes) VALUES
('Corte de Cabelo', 25.00, 30),
('Barba', 20.00, 20),
('Corte + Barba', 40.00, 45),
('Manicure', 15.00, 30),
('Pedicure', 20.00, 40);

-- Barbeiros
INSERT INTO barbers (name, phone, email) VALUES
('Bruno Souza', '(35) 99999-0001', 'bruno@barbearia.com'),
('Erick', '(35) 99999-0002', 'erick@barbearia.com'),
('Ryan', '(35) 99999-0003', 'ryan@barbearia.com'),
('Carlos', '(35) 99999-0004', 'carlos@barbearia.com'),
('Julio', '(35) 99999-0005', 'julio@barbearia.com'),
('Faguinho', '(35) 99999-0006', 'faguinho@barbearia.com'),
('Joilton', '(35) 99999-0007', 'joilton@barbearia.com');
