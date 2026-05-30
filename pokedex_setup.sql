-- SQL script to set up the Pokémon database for MySQL

-- Drop old tables if they exist to ensure a clean slate for Phase 0
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pokemons;

-- Create the 'pokemons' table (Admin-managed database)
CREATE TABLE pokemons (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  types VARCHAR(255),
  abilities VARCHAR(255),
  weaknesses VARCHAR(255),
  hp INT,
  attack INT,
  defense INT,
  special_attack INT,
  special_defense INT,
  speed INT
);

-- USERS table (Phase 0 Implementation)
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
  profile_picture_url VARCHAR(500),
  bio TEXT,
  trainer_class VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COLLECTIONS table (Phase 0 Implementation)
CREATE TABLE collections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  pokemon_id INT NOT NULL,
  nickname VARCHAR(50),
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  date_caught TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pokemon_id) REFERENCES pokemons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_pokemon (user_id, pokemon_id)
);

-- Insert Gen 1 Pokémon data
INSERT IGNORE INTO pokemons (id, name, height, weight, types, abilities, weaknesses, hp, attack, defense, special_attack, special_defense, speed) VALUES
(1, 'bulbasaur', 0.7, 6.9, 'grass, poison', 'overgrow, chlorophyll', 'flying, poison, bug, fire, ice', 45, 49, 49, 65, 65, 45),
(2, 'ivysaur', 1, 13, 'grass, poison', 'overgrow, chlorophyll', 'flying, poison, bug, fire, ice', 60, 62, 63, 80, 80, 60),
(3, 'venusaur', 2, 100, 'grass, poison', 'overgrow, chlorophyll', 'flying, poison, bug, fire, ice', 80, 82, 83, 100, 100, 80),
(4, 'charmander', 0.6, 8.5, 'fire', 'blaze, solar-power', 'ground, rock, water', 39, 52, 43, 60, 50, 65),
(5, 'charmeleon', 1.1, 19, 'fire', 'blaze, solar-power', 'ground, rock, water', 58, 64, 58, 80, 65, 80),
(6, 'charizard', 1.7, 90.5, 'fire, flying', 'blaze, solar-power', 'ground, rock, water', 78, 84, 78, 109, 85, 100),
(7, 'squirtle', 0.5, 9, 'water', 'torrent, rain-dish', 'grass, electric', 44, 48, 65, 50, 64, 43),
(8, 'wartortle', 1, 22.5, 'water', 'torrent, rain-dish', 'grass, electric', 59, 63, 80, 65, 80, 58),
(9, 'blastoise', 1.6, 85.5, 'water', 'torrent, rain-dish', 'grass, electric', 79, 83, 100, 85, 105, 78),
(10, 'caterpie', 0.3, 2.9, 'bug', 'shield-dust, run-away', 'flying, rock, fire', 45, 30, 35, 20, 20, 45),
(11, 'metapod', 0.7, 9.9, 'bug', 'shed-skin', 'flying, rock, fire', 50, 20, 55, 25, 25, 30),
(12, 'butterfree', 1.1, 32, 'bug, flying', 'compound-eyes, tinted-lens', 'flying, rock, fire', 60, 45, 50, 90, 80, 70),
(13, 'weedle', 0.3, 3.2, 'bug, poison', 'shield-dust, run-away', 'flying, rock, fire', 40, 35, 30, 20, 20, 50),
(14, 'kakuna', 0.6, 10, 'bug, poison', 'shed-skin', 'flying, rock, fire', 45, 25, 50, 25, 25, 35),
(15, 'beedrill', 1, 29.5, 'bug, poison', 'swarm, sniper', 'flying, rock, fire', 65, 90, 40, 45, 80, 75),
(16, 'pidgey', 0.3, 1.8, 'normal, flying', 'keen-eye, tangled-feet, big-pecks', 'fighting', 40, 45, 40, 35, 35, 56),
(17, 'pidgeotto', 1.1, 30, 'normal, flying', 'keen-eye, tangled-feet, big-pecks', 'fighting', 63, 60, 55, 50, 50, 71),
(18, 'pidgeot', 1.5, 39.5, 'normal, flying', 'keen-eye, tangled-feet, big-pecks', 'fighting', 83, 80, 75, 70, 70, 101),
(19, 'rattata', 0.3, 3.5, 'normal', 'run-away, guts, hustle', 'fighting', 30, 56, 35, 25, 35, 72),
(20, 'raticate', 0.7, 18.5, 'normal', 'run-away, guts, hustle', 'fighting', 55, 81, 60, 50, 70, 97),
(21, 'spearow', 0.3, 2, 'normal, flying', 'keen-eye, sniper', 'fighting', 40, 60, 30, 31, 31, 70),
(22, 'fearow', 1.2, 38, 'normal, flying', 'keen-eye, sniper', 'fighting', 65, 90, 65, 61, 61, 100),
(23, 'ekans', 2, 6.9, 'poison', 'intimidate, shed-skin, unnerve', 'ground, psychic', 35, 60, 44, 40, 54, 55),
(24, 'arbok', 3.5, 65, 'poison', 'intimidate, shed-skin, unnerve', 'ground, psychic', 60, 95, 69, 65, 79, 80),
(25, 'pikachu', 0.4, 6, 'electric', 'static, lightning-rod', 'ground', 35, 55, 40, 50, 50, 90),
(26, 'raichu', 0.8, 30, 'electric', 'static, lightning-rod', 'ground', 60, 90, 55, 90, 80, 110),
(27, 'sandshrew', 0.6, 12, 'ground', 'sand-veil, sand-rush', 'water, grass, ice', 50, 75, 85, 20, 30, 40),
(28, 'sandslash', 1, 29.5, 'ground', 'sand-veil, sand-rush', 'water, grass, ice', 75, 100, 110, 45, 55, 65),
(29, 'nidoran-f', 0.4, 7, 'poison', 'poison-point, rivalry, hustle', 'ground, psychic', 55, 47, 52, 40, 40, 41),
(30, 'nidorina', 0.8, 20, 'poison', 'poison-point, rivalry, hustle', 'ground, psychic', 70, 62, 67, 55, 55, 56),
(31, 'nidoqueen', 1.3, 60, 'poison, ground', 'poison-point, rivalry, sheer-force', 'ground, psychic', 90, 92, 87, 75, 85, 76),
(32, 'nidoran-m', 0.5, 9, 'poison', 'poison-point, rivalry, hustle', 'ground, psychic', 46, 57, 40, 40, 40, 50),
(33, 'nidorino', 0.9, 19.5, 'poison', 'poison-point, rivalry, hustle', 'ground, psychic', 61, 72, 57, 55, 55, 65),
(34, 'nidoking', 1.4, 62, 'poison, ground', 'poison-point, rivalry, sheer-force', 'ground, psychic', 81, 102, 77, 85, 75, 85),
(35, 'clefairy', 0.6, 7.5, 'fairy', 'cute-charm, magic-guard, friend-guard', 'poison, steel', 70, 45, 48, 60, 65, 35),
(36, 'clefable', 1.3, 40, 'fairy', 'cute-charm, magic-guard, unaware', 'poison, steel', 95, 70, 73, 95, 90, 60),
(37, 'vulpix', 0.6, 9.9, 'fire', 'flash-fire, drought', 'ground, rock, water', 38, 41, 40, 50, 65, 65),
(38, 'ninetales', 1.1, 19.9, 'fire', 'flash-fire, drought', 'ground, rock, water', 73, 76, 75, 81, 100, 100),
(39, 'jigglypuff', 0.5, 5.5, 'normal, fairy', 'cute-charm, competitive, friend-guard', 'fighting', 115, 45, 20, 45, 25, 20),
(40, 'wigglytuff', 1, 12, 'normal, fairy', 'cute-charm, competitive, frisk', 'fighting', 140, 70, 45, 85, 50, 45),
(41, 'zubat', 0.8, 7.5, 'poison, flying', 'inner-focus, infiltrator', 'ground, psychic', 40, 45, 35, 30, 40, 55),
(42, 'golbat', 1.6, 55, 'poison, flying', 'inner-focus, infiltrator', 'ground, psychic', 75, 80, 70, 65, 75, 90),
(43, 'oddish', 0.5, 5.4, 'grass, poison', 'chlorophyll, run-away', 'flying, poison, bug, fire, ice', 45, 50, 55, 75, 65, 30),
(44, 'gloom', 0.8, 8.6, 'grass, poison', 'chlorophyll, stench', 'flying, poison, bug, fire, ice', 60, 65, 70, 85, 75, 40),
(45, 'vileplume', 1.2, 18.6, 'grass, poison', 'chlorophyll, effect-spore', 'flying, poison, bug, fire, ice', 75, 80, 85, 110, 90, 50),
(46, 'paras', 0.3, 5.4, 'bug, grass', 'effect-spore, dry-skin, damp', 'flying, rock, fire', 35, 70, 55, 45, 55, 25),
(47, 'parasect', 1, 29.5, 'bug, grass', 'effect-spore, dry-skin, damp', 'flying, rock, fire', 60, 95, 80, 60, 80, 30),
(48, 'venonat', 1, 30, 'bug, poison', 'compound-eyes, tinted-lens, run-away', 'flying, rock, fire', 60, 55, 50, 40, 55, 45),
(49, 'venomoth', 1.5, 12.5, 'bug, poison', 'shield-dust, tinted-lens, wonder-skin', 'flying, rock, fire', 70, 65, 60, 90, 75, 90);
