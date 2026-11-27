const router = require("express").Router();
const pool = require("../db");

const ALLOWED_STATUSES = ["Pending", "In progress", "Completed"];

function parseId(rawId) {
  // Only positive whole-number IDs are accepted.
  if (!/^[1-9]\d*$/.test(String(rawId))) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) ? id : null;
}

function validateRecord(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const fields = ["title", "category", "description", "status"];
  for (const field of fields) {
    if (typeof body[field] !== "string") {
      return `${field} must be a string.`;
    }
  }

  const title = body.title.trim();
  const category = body.category.trim();
  const description = body.description.trim();
  const status = body.status.trim();

  if (title.length < 3 || title.length > 80) {
    return "Title must have 3 to 80 characters.";
  }
  if (category.length < 2 || category.length > 40) {
    return "Category must have 2 to 40 characters.";
  }
  if (description.length < 5 || description.length > 300) {
    return "Description must have 5 to 300 characters.";
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return "Status must be Pending, In progress, or Completed.";
  }

  return {
    title,
    category,
    description,
    status
  };
}

// GET /api/records - read all records.
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records ORDER BY id"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return next(error);
  }
});

// GET /api/records/:id - read one record.
router.get("/:id", async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "ID must be a positive whole number." });
  }

  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// POST /api/records - create a record. Any client-supplied id is ignored.
router.post("/", async (req, res, next) => {
  const record = validateRecord(req.body);
  if (typeof record === "string") {
    return res.status(400).json({ message: record });
  }

  try {
    const result = await pool.query(
      `INSERT INTO records (title, category, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, category, description, status`,
      [record.title, record.category, record.description, record.status]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// PUT /api/records/:id - replace all four editable fields; does not create.
router.put("/:id", async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "ID must be a positive whole number." });
  }

  const record = validateRecord(req.body);
  if (typeof record === "string") {
    return res.status(400).json({ message: record });
  }

  try {
    const result = await pool.query(
      `UPDATE records
       SET title = $1, category = $2, description = $3, status = $4
       WHERE id = $5
       RETURNING id, title, category, description, status`,
      [record.title, record.category, record.description, record.status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/records/:id - delete one record.
router.delete("/:id", async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "ID must be a positive whole number." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    return res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
