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

public_users.get('/promise/books', function(req, res) {
    new Promise((resolve, reject) => {
        resolve(books);
    })
    .then(data => res.json(data))
    .catch(err => res.status(500).json({message: "Error"}));
});

public_users.get('/promise/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        if (books[isbn]) resolve(books[isbn]);
        else reject();
    })
    .then(data => res.json(data))
    .catch(() => res.status(404).json({ message: "Book not found" }));
});

public_users.get('/promise/author/:author', function(req, res) {
    const author = req.params.author;
    new Promise((resolve) => {
        let booksByAuthor = [];
        for(let key in books) {
            if(books[key].author === author){
                booksByAuthor.push(books[key]);
            }
        }
        resolve(booksByAuthor);
    })
    .then(data => res.json(data));
});

public_users.get('/promise/title/:title', function(req, res) {
    const title = req.params.title;
    new Promise((resolve) => {
        let booksByTitle = [];
        for(let key in books) {
            if(books[key].title === title){
                booksByTitle.push(books[key]);
            }
        }
        resolve(booksByTitle);
    })
    .then(data => res.json(data));
});

module.exports.general = public_users;
