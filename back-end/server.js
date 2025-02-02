require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const port = process.env.SERVER_PORT || 3000;

const db = require("./connection");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./uploaded_images/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Custom error handler for multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    // Set validation error in request
    req.fileValidationError =
      "Only image files (jpeg, jpg, png, webp) are allowed!";
    return cb(null, false);
  },
}).single("profile_image");

// static files
app.use(express.static(path.join(__dirname, "../front-end")));
app.use(bodyParser.json());
app.use(cors());

// Optionally run migration before starting the server:
// require("./migration");

// First, create a middleware to validate email existence
const checkEmailExists = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT email FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
      if (err) reject(err);
      resolve(result.length > 0);
    });
  });
};

// POST request to create a user with image
app.post("/create-user", async (req, res) => {
  try {
    if (!req.get("content-type")?.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          error: err.message || "Error uploading file",
        });
      }

      // Check for file validation error or missing file
      if (req.fileValidationError || !req.file) {
        return res.status(400).json({
          error: req.fileValidationError || "Profile image is required",
        });
      }

      const { email, password, type = "user", active = 1 } = req.body;

      // Validate required fields
      if (!email || !password) {
        // Clean up uploaded file since validation failed
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }
          return res.status(400).json({ error: "Email already exists" });
        }

        const imagePath = `/uploaded_images/${req.file.filename}`;

        // Create user with validated data
        const sql = "CALL addUser(?, ?, ?, ?, ?)";
        db.query(
          sql,
          [email, password, type, active, imagePath],
          (err, result) => {
            if (err) {
              fs.unlink(req.file.path, () => {});
              return res.status(500).json({
                error: err.sqlMessage || "Error creating user",
              });
            }

            res.status(201).json({
              message: "User created successfully",
              imagePath: imagePath,
            });
          }
        );
      } catch (err) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(500).json({ error: "Error processing request" });
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Started HTTP server on: http://localhost:${port}/`);
});
