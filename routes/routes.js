import express from "express";
const router = express.Router();
import User from "../models/users.js";
import multer from "multer";
import fs from "fs";

//storage upload
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

let upload = multer({
    storage: storage,
}).single("user_image");

router.get("/", (req, res) => {
    User.find()
        .exec()
        .then((users) => {
            res.render("home", { users: users, title: "Home page" });
        })
        .catch((err) => console.log(err));
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add User" });
});

router.get("/edit_users/:id", (req, res) => {
    let id = req.params.id;
    User.findById(id)
        .then((result) => {
            res.render("edit_users", { title: "Edit User", user: result });
        })
        .catch((err) => console.log(err));
});

//add user to db
router.post("/add_user_db", upload, async(req, res) => {
    try {
        const user = new User({
            name: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });
        await user.save();
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

//update user to db
router.post("/update_user_db/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_user_image);
        } catch (error) {
            console.log(error);
        }
    } else {
        new_image = req.body.old_user_image;
    }

    User.findByIdAndUpdate(id, {
            name: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        })
        .then(() => {
            res.redirect("/");
        })
        .catch((err) => console.log(err));
});

//delete user
router.post("/delete_users/:id", (req, res) => {
    let id = req.params.id;
    User.findByIdAndDelete(id)
        .then((result) => {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
            res.redirect("/");
        })
        .catch((err) => console.log(err));
});
export default router;