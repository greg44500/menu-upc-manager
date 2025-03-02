const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 8000;
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");

//** ROUTES IMPORT */
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js")
const progressionRoutes = require('./routes/progression.routes.js')
const classroomRoutes = require("./routes/classroom.routes.js")
const locationRoutes = require("./routes/location.routes.js")
const productionTypeRoutes = require("./routes/productionType.routes.js")
const serviceRoutes = require("./routes/service.routes.js")
const itemRoutes = require("./routes/items.routes.js")
const errorHandler = require("./middlewares/errorHandler")
const morgan = require('morgan')


const app = express();
app.use(express.json());

// Ajoutez ceci au début de votre app.js, avant les autres middlewares
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
app.use(errorHandler)

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

app.use(cookieParser());
connectDB(); //Methode de connexion MongoDB


// JWT

// **MAIN ROUTES 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progressions", progressionRoutes)
app.use("/api/classrooms", classroomRoutes)
app.use("/api/locations", locationRoutes)
app.use("/api/production-type", productionTypeRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/items", itemRoutes)


app.listen(port, () => {
    console.log(`listening on port: ${port}`);
});