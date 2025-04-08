const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const authRoutes = require('./routes/auth');
const Course = require('./models/course');

const app = express();

// ✅ Allow multiple origins (for index.html running on 5500 or 5501)
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5500',
  'http://localhost:5501'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Middleware to parse JSON and serve static assets
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.static("public")); 
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/coderclasDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ Auth Routes
app.use('/api/auth', authRoutes);

// ✅ Multer config for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// ✅ Get single course by ID
app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// ✅ Add new course with image upload
app.post("/api/courses", upload.single('image'), async (req, res) => {
  try {
    const {
      title, price, startDate, duration,
      level, language, mode, certificate,
      description, availableSlots
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newCourse = new Course({
      title,
      price,
      startDate,
      duration,
      level,
      language,
      mode,
      certificate: certificate === "true",
      description,
      availableSlots: Number(availableSlots) || 0,
      imageUrl
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: "Failed to add course", details: error.message });
  }
});

// ✅ Update course by ID
app.put("/api/courses/:id", async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

// ✅ Delete course by ID
app.delete("/api/courses/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// ✅ Start the server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
