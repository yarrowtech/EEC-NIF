const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const adminAuthRoutes = require('./routes/adminRoutes');
const teacherAuthRoutes = require('./routes/teacherRoute');
const studentAuthRoutes = require('./routes/studentRoute');
const parentAuthRoutes = require('./routes/parentRoute');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminUserManagementRoutes = require('./routes/adminUserManagement');
const courseRouter = require("./routes/courseRoute")
const subjectRouter = require("./routes/subjectRoute");
const examRouter = require("./routes/examRoute");
const feedbackRouter = require("./routes/feedbackRoute");
const assignmentRouter = require("./routes/assignmentRoute");
const behaviourRouter = require("./routes/behaviourRoute");
const progressRouter = require("./routes/progressRoute");
const aiLearningRouter = require("./routes/aiLearningRoute");
const studentAILearningRouter = require("./routes/studentAILearningRoute");
const alcoveRouter = require("./routes/alcoveRoute");


const nifCourseRoute = require("./routes/nifCourseRoute");
const nifStudentArchiveRoutes = require("./routes/nifStudentArchiveRoutes");


const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));


app.get("/", (req, res) => {
  res.send("Welcome to the Electronic Educare API ..");
})

// Mount auth routes separately
app.use('/api/admin/users', adminUserManagementRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/teacher/auth', teacherAuthRoutes);
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/parent/auth', parentAuthRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/api/student', require('./routes/student'));

app.use('/api/course', courseRouter)
app.use('/api/subject', subjectRouter);
app.use('/api/exam', examRouter);
app.use('/api/assignment', assignmentRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/behaviour', behaviourRouter);
app.use('/api/progress', progressRouter);
app.use('/api/ai-learning', aiLearningRouter);
app.use('/api/student-ai-learning', studentAILearningRouter);
app.use('/api/alcove', alcoveRouter);


app.use('/api/nif/course', nifCourseRoute);
const nifRoutes = require('./routes/nifRoutes');

app.use('/api/nif', nifRoutes);

const wellbeingRoute = require('./routes/wellbeingRoute');
app.use('/api/wellbeing', wellbeingRoute);


app.use('api/nifStudentArchiveRoutes', nifStudentArchiveRoutes );


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
