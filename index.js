import express from "express";
import pg from "pg";
import axios from "axios";
import bodyParser from "body-parser";

const port = 3000;
const app = express();

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "bookNotes",
    password: "5w7L203Y@_24q",
    port: 5432
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let books = [];
let sortBy = "id";

//Get all the books from the database
async function getBooks(sortBy) {
    let book = [];
    if (sortBy === "id") {
        book = await db.query("SELECT * FROM books ORDER BY id ASC ");
    } else if (sortBy === "rate") {
        book = await db.query("SELECT * FROM books ORDER BY rate DESC ");
    } else {
        book = await db.query("SELECT * FROM books ORDER BY date DESC");
    }
    console.log(book.rows);
    books = book.rows;
}

let MaxID = 0;

async function Max_ID() {
    await getBooks("id");
    MaxID = books[books.length - 1].id;
}

Max_ID();

//Get the correct format of URL of book cover
function fetchUrl(isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

//Render the homepage
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//Render the books
app.get("/books", async (req, res) => {
    await getBooks(sortBy);
    res.render("books.ejs", {
        books: books
    });
});

//Handle the sort order
app.get("/books/id", (req, res) => {
    res.redirect("/books");
});

app.get("/books/rate", (req, res) => {
    sortBy = "rate";
    res.redirect("/books");
});

app.get("/books/date", (req, res) => {
    sortBy = "date";
    res.redirect("/books");
});

//Render the form
app.get("/AddBook", (req, res) => {
    res.render("AddBook.ejs");
});

//Submit a new book
app.post("/submitBook", async (req, res) => {
    //Get the book cover automatically
    let bookName = req.body["book_name"].split(' ');
    bookName= bookName.join("+");
    console.log(bookName);
    try {
        const result = await axios(`https://openlibrary.org/search.json?title=${bookName}`);
        console.log(result.data.docs[0].isbn[0]);
        try{
            await db.query("INSERT INTO books (review, book_name, recap, date, rate, author, url) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
            [req.body["review"], req.body["book_name"],
             req.body["recap"], req.body["date"],
             req.body["rate"], req.body["author"], fetchUrl(result.data.docs[0].isbn[0])]);
             MaxID++;
             res.redirect("/books");
            //fetchImage(result.data.docs[0].isbn[0]);
        } catch(error) {
            res.send("Information not sufficient").status(400);
        }
    } catch(error) {
        res.send("404 Not Found").status(400);
    }
});

//View certain book
app.get("/viewBook/:id", async (req, res) => {
    await getBooks(sortBy);
    const id = parseInt(req.params.id);
    //handle the error
    if (id >= 1 && id <= MaxID) {
        const currentBook = books.find((book) => book.id === id);
        console.log(currentBook);
        res.render("viewBook.ejs", {
        book : currentBook
        }); 
    } else {
        res.send("Book Not Found").status(400);
    }
});

//Edit certain book
app.get("/EditBook/:id", async (req, res) => {
    await getBooks(sortBy);
    const id = parseInt(req.params.id);
    console.log(MaxID);
    //handle the error
    if (id >= 0 && id <= MaxID) {
        let currentBook = books.find((book) => book.id === id);
        res.render("Addbook.ejs", {
            index : id,
            book: currentBook
        });
    } else {
        res.send("Book Not Found").status(400);
    }
});

//Handle the form request and update the database
app.post("/EditForm/:id", async (req, res) => {
    await getBooks(sortBy);
    const id = parseInt(req.params.id);
    let currentBook = req.body;
    console.log(MaxID);
    if (id >= 1 && id <= MaxID) {
        //Get the book cover automatically
    let oldBook = books.find((book) => book.id === id);
    let bookName = req.body["book_name"].split(' ');
    bookName= bookName.join("+");
    console.log(bookName);
    try {
        const result = await axios(`https://openlibrary.org/search.json?title=${bookName}`);
        //renew the url
        console.log(result.data.docs[0].isbn[0]);
        if (currentBook.book_name !== oldBook.book_name) {
            try{
                await db.query("UPDATE books SET url = $1 WHERE id = $2", [fetchUrl(result.data.docs[0].isbn[0]), id]);
            } catch (error) {
                res.send("Book is invalid").status(400);
            }
        }
        console.log(1);
        try {
            await db.query("UPDATE books SET review = $1, book_name = $2, recap = $3, date = $4, rate = $5, author = $6 WHERE id = $7",
            [currentBook.review, currentBook.book_name, currentBook.recap, currentBook.date, currentBook.rate, currentBook.author, id]);
            res.redirect("/books");
        } catch(error) {
            res.send("Information Not Sufficient").status(400);
        }
    } catch(error) {
        res.send("404 Not Found").status(400);
    }
    } else {
        res.send("Book Not Found").status(400);
    }
});

//Delete Certain book
app.get("/deleteBook/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 1 && id <= MaxID) {
        try{
            await db.query("DELETE FROM books WHERE id = $1", [id]);
            if (MaxID === id) {
                MaxID--;
            }
            res.redirect("/books");
        } catch(error) {
            res.send("Book Not Found").status(400);
        }
    } else {
        res.send("Book Not Found").status(400);
    }
});

//About
app.get("/about", (req, res) => {
    res.render("About.ejs");
});

app.listen(port, () => {
    console.log(`Port is running on port ${port}`);
})