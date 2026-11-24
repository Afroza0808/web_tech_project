
const request = require("supertest");
const path = require("path");
const fs = require("fs");

// Create a separate database for testing
const testDbPath = path.join(
    __dirname,
    "../database/bookloop.test.db"
);

fs.mkdirSync(path.dirname(testDbPath), { recursive: true });

if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
}

process.env.DB_PATH = testDbPath;

// Import app and database after setting DB_PATH
const app = require("../src/app");
const db = require("../src/config/db");

const validBook = {
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    price: 450,
    book_condition: "Good",
    seller_name: "Afroza",
    listing_type: "SELL"
};

const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const createBook = async () => {
    return request(app)
        .post("/api/books")
        .send(validBook);
};

beforeEach(async () => {
    await runQuery("DELETE FROM books");
});

afterAll(async () => {
    await new Promise((resolve, reject) => {
        db.close(err => {
            if (err) reject(err);
            else resolve();
        });
    });
});

describe("Book Listing CRUD Integration Tests", () => {

    // CREATE
    test("POST - should create a book", async () => {
        const res = await createBook();

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Book added successfully");
        expect(res.body.bookId).toBeDefined();
    });

    test("POST - should reject missing required fields", async () => {
        const res = await request(app)
            .post("/api/books")
            .send({ author: "Test Author" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("All fields are required");
    });

    test("POST - should reject negative price", async () => {
        const res = await request(app)
            .post("/api/books")
            .send({ ...validBook, price: -100 });

        expect(res.statusCode).toBe(400);
    });

    test("POST - should reject non-numeric price", async () => {
        const res = await request(app)
            .post("/api/books")
            .send({ ...validBook, price: "450" });

        expect(res.statusCode).toBe(400);
    });

    // READ
    test("GET - should retrieve all books", async () => {
        await createBook();

        const res = await request(app)
            .get("/api/books");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe(validBook.title);
    });

    test("GET - should retrieve a book by ID", async () => {
        const created = await createBook();
        const id = created.body.bookId;

        const res = await request(app)
            .get(`/api/books/${id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(id);
        expect(res.body.title).toBe(validBook.title);
    });

    test("GET - should return 404 for unknown book ID", async () => {
        const res = await request(app)
            .get("/api/books/99999");

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Book not found");
    });

    // UPDATE
    test("PUT - should update an existing book", async () => {
        const created = await createBook();
        const id = created.body.bookId;

        const updatedBook = {
            ...validBook,
            title: "Updated Database Book",
            price: 550
        };

        const res = await request(app)
            .put(`/api/books/${id}`)
            .send(updatedBook);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Book updated successfully");

        const check = await request(app)
            .get(`/api/books/${id}`);

        expect(check.body.title).toBe("Updated Database Book");
        expect(check.body.price).toBe(550);
    });

    test("PUT - should reject invalid update data", async () => {
        const created = await createBook();
        const id = created.body.bookId;

        const res = await request(app)
            .put(`/api/books/${id}`)
            .send({ ...validBook, price: -50 });

        expect(res.statusCode).toBe(400);
    });

    test("PUT - should return 404 for unknown book ID", async () => {
        const res = await request(app)
            .put("/api/books/99999")
            .send(validBook);

        expect(res.statusCode).toBe(404);
    });

    // DELETE
    test("DELETE - should delete an existing book", async () => {
        const created = await createBook();
        const id = created.body.bookId;

        const res = await request(app)
            .delete(`/api/books/${id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Book deleted successfully");

        const check = await request(app)
            .get(`/api/books/${id}`);

        expect(check.statusCode).toBe(404);
    });

    test("DELETE - should return 404 for unknown book ID", async () => {
        const res = await request(app)
            .delete("/api/books/99999");

        expect(res.statusCode).toBe(404);
    });

});
