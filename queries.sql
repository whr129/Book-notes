CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	review text,
	book_name text
);

INSERT INTO books (review, book_name)
VALUES ('GENSHIN', 'IMPACT')

ALTER TABLE books
ADD recap text;

UPDATE books SET recap = 'START' 
WHERE id = 1;

ALTER TABLE books
ADD date VARCHAR(45),
ADD rate INT;

UPDATE books SET date = '2020-03-22', rate = '10'
WHERE id = 1;

ALTER TABLE books
ADD author VARCHAR(50);

UPDATE books SET author = 'Mihayo' 
WHERE id = 1;

ALTER TABLE books
ADD url text;

UPDATE books SET url = 'https://covers.openlibrary.org/b/id/240727-L.jpg' 
WHERE id = 1;