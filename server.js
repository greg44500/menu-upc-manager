const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 8000;
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js")
const classroomRoutes = require("./routes/classroom.routes.js")
const errorHandler = require("./middlewares/errorHandler")
const morgan = require('morgan')


const app = express();
app.use(express.json());
app.use(errorHandler)

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cors());

app.use(cookieParser());
connectDB(); //Methode de connexion MongoDB

// JWT

// MAIN ROUTES 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classrooms", classroomRoutes)


app.listen(port, () => {
    console.log(`listening on port: ${port}`);
});