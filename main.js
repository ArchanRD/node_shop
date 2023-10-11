import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import routes from "./routes/routes.js";

const app = express();
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Connected to database"));

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        secret: "mySecret",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

//set template engine
app.set('view engine', 'ejs');

app.use("", routes);

app.listen(8000, () => {
    console.log(`Server is running at http://localhost:8000`);
});