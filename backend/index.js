import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import session from "express-session";
import dotenv from 'dotenv';
import Sequelize  from "sequelize";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke MySQL dengan Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const Role = sequelize.define('role', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const user = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  roleId: {
    type: Sequelize.INTEGER,
    references: {
      model: Role,
      key: 'id'
    }
  }
});

const admin = sequelize.define('admin', {
  attendance_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: admin,
      key: 'id'
    }
  }
});

const karyawan = sequelize.define('karyawan', {
  attendance_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: karyawan,
      key: 'id'
    }
  }
});

// Sinkronisasi model dengan database
sequelize.sync();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user','karyawan'], default: 'user' },
  });
  
  const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  });

const User = mongoose.model('User', userSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto'
    }
}));

// Verifying role and token (Middleware)
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied' });
  
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid token' });
    }
  };

// Register User
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const newUser = new User({ username, password: hashedPassword, role });
    try {
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// Login User
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });
  
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });
  
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.header('Authorization', `Bearer ${token}`).json({ token });
  });

// Record attendance (only accessible to users with role 'user')
app.post('/api/attendance', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Access forbidden' });
  
    const newAttendance = new Attendance({ user: req.user._id });
    await newAttendance.save();
    res.status(201).json(newAttendance);
  });
  
  // Get all attendances (only accessible to admin)
  app.get('/api/attendance', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access forbidden' });
  
    const attendances = await Attendance.find().populate('user', 'username');
    res.json(attendances);
  });
  
  const PORT = process.env.PORT || 3306;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
