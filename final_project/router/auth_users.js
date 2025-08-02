const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
     return username && typeof username === "string";
}

const authenticatedUser = (username,password)=>{ 
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    let accessToken = jwt.sign(
        { data: username },
        'access',
        { expiresIn: 60 * 60 }
    );
    req.session.username = username;
    return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
    const username = req.session.username;
    const review = req.query.review;
    if (!username) {
        return res.status(401).json({ message: "Login required" });
    }
    if (!review) {
        return res.status(400).json({ message: "Review must be provided as a query parameter" });
    }
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified!", reviews: books[isbn].reviews });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;
    if (!username) {
        return res.status(401).json({ message: "Login required" });
    }
    if (!books[isbn] || !books[isbn].reviews) {
        return res.status(404).json({ message: "Book or reviews not found" });
    }
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review by this user to delete" });
    }
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted!", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
