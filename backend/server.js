const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== STATIC FILES ================== */
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

/* ================== DATABASE ================== */
mongoose
  .connect("mongodb://127.0.0.1:27017/civic_issues")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

/* ================== MODELS ================== */
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const IssueSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    category: String,
    image: String,
    email: String,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Issue = mongoose.model("Issue", IssueSchema);

/* ================== MULTER ================== */
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================== ROUTES ================== */

// USER SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    await User.create({ name, email, password });
    res.json({ message: "Signup successful" });
  } catch {
    res.status(500).json({ message: "Signup failed" });
  }
});

// USER LOGIN
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid password" });

    res.json({ email: user.email, role: user.role });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

// REPORT ISSUE
app.post("/report", upload.single("image"), async (req, res) => {
  try {
    const issue = new Issue({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      category: req.body.category,
      email: req.body.email,
      image: req.file ? req.file.filename : null,
    });

    await issue.save();
    res.json({ message: "Issue reported successfully" });
  } catch {
    res.status(500).json({ message: "Issue not saved" });
  }
});

// MY ISSUES
app.get("/my-issues", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required" });

    const issues = await Issue.find({ email }).sort({ createdAt: -1 });
    res.json(issues);
  } catch {
    res.status(500).json({ message: "Failed to fetch issues" });
  }
});

// DELETE ISSUE
app.delete("/issue/:id", async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: "Issue deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete issue" });
  }
});

// GOVERNMENT ROUTES
app.get("/gov/issues", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch {
    res.status(500).json({ message: "Failed to fetch issues" });
  }
});

app.put("/gov/issue/:id", async (req, res) => {
  await Issue.findByIdAndUpdate(req.params.id, { status: "Solved" });
  res.json({ message: "Issue marked as solved" });
});

/* ================== START SERVER ================== */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
