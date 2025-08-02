const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

public_users.get('/',function (req, res) {
    return res.status(200).json(books);
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
    let booksByAuthor = [];
    for(let key in books) {
        if(books[key].author === author){
            booksByAuthor.push(books[key]);
        }
    }
    return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
    let booksByTitle = [];
    for(let key in books) {
        if(books[key].title === title){
            booksByTitle.push(books[key]);
        }
    }
    return res.status(200).json(booksByTitle);
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    if(books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/async/books', async function(req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve) => resolve(books));
        };
        const data = await getBooks();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
});

public_users.get('/async/isbn/:isbn', async function(req, res) {
    try {
        const isbn = req.params.isbn;
        const getBook = (isbn) => new Promise((resolve, reject) => {
            if(books[isbn]) resolve(books[isbn]);
            else reject();
        });
        const data = await getBook(isbn);
        res.status(200).json(data);
    } catch (e) {
        res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/async/author/:author', async function(req, res) {
    const author = req.params.author;
    const getBooksByAuthor = (author) => new Promise((resolve) => {
        let result = [];
        for(let key in books) {
            if(books[key].author.toLowerCase() === author.toLowerCase()) {
                result.push(books[key]);
            }
        }
        resolve(result);
    });
    try {
        const data = await getBooksByAuthor(author);
        res.status(200).json(data);
    } catch (e) {
        res.status(404).json({ message: "Not found" });
    }
});

public_users.get('/async/title/:title', async function(req, res) {
    const title = req.params.title;
    const getBooksByTitle = (title) => new Promise((resolve) => {
        let result = [];
        for(let key in books) {
            if(books[key].title.toLowerCase() === title.toLowerCase()) {
                result.push(books[key]);
            }
        }
        resolve(result);
    });
    try {
        const data = await getBooksByTitle(title);
        res.status(200).json(data);
    } catch (e) {
        res.status(404).json({ message: "Not found" });
    }
});

module.exports.general = public_users;
