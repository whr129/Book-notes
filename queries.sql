CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	review text,
	book_name text,
	recap text,
	date VARCHAR(45),
	rate INT,
	author VARCHAR(50),
	url text
);