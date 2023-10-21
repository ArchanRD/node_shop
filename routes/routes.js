import express from "express";
const router = express.Router();
import User from "../models/users.js";
import multer from "multer";
import fs from "fs";
import Product from "../models/products.js";

//storage upload
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

let uploadUserImage = multer({
    storage: storage,
}).single("user_image");

let uploadProductImage = multer({
    storage: storage,
}).single("pimage");

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
router.post("/add_user_db", uploadUserImage, async(req, res) => {
    try {
        if (req.body.phone.length != 10) {
            req.body.phone = 1234567890;
        }
        const user = new User({
            name: req.body.username,
            email: req.body.email,
            phone: req.body.phone || 1234567890,
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
router.post("/update_user_db/:id", uploadUserImage, (req, res) => {
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

    if (req.body.phone.length != 10) {
        req.body.phone = 1234567890;
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

//add product
router.get("/add_product", (req, res) => {
    res.render("add_product", { page_title: "Add Product" });
});

router.post("/add_product_db", uploadProductImage, async(req, res) => {
    try {
        const product = new Product({
            pname: req.body.pname,
            pdesc: req.body.pdesc,
            pprice: req.body.pprice,
            pimages: req.file.filename,
            pcategorys: req.body.pcategory,
            ptags: req.body.ptag,
            pstock: req.body.pstock,
            variants: req.body.variant,
            status: req.body.pstatus,
            pid: Math.floor(Math.random() * 100),
        });
        await product.save();
        res.redirect("/products");
    } catch (err) {
        console.log(err);
    }
});

// view products
router.get("/products", (req, res) => {
    Product.find()
        .exec()
        .then((products) => {
            res.render("view_products", {
                products: products,
                page_title: "View Products",
            });
        });
});

// edit products
router.get("/edit_product/:id", (req, res) => {
    let pid = req.params.id;

    Product.findOne({ pid: pid })
        .then((product) => {
            res.render("edit_product", { products: product, title: "Edit Product" });
        })
        .catch((err) => console.log(err));
});

// update product
router.post("/update_product/:id", uploadProductImage, (req, res) => {
    let pid = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.poldimage);
        } catch (error) {
            console.log(error);
        }
    } else {
        new_image = req.body.poldimage;
    }

    Product.findOneAndUpdate({ pid: pid }, {
            pname: req.body.pname,
            pdesc: req.body.pdesc,
            pprice: req.body.pprice,
            pimages: new_image,
            pcategorys: req.body.pcategory,
            ptags: req.body.ptags,
            pstock: req.body.pstock,
            variants: req.body.pvariants,
            status: req.body.pstatus,
            pid: pid,
        })
        .then(() => {
            res.redirect("/products");
        })
        .catch((err) => console.log(err));
});

//detele product

router.post("/delete_product/:id", (req, res) => {
    let pid = req.params.id;

    Product.findOneAndDelete(pid)
        .then(() => {
            res.redirect("/products");
        })
        .catch((err) => console.log(err));
});

//product gallery
router.get("/product_gallery", (req, res) => {
    Product.find().exec().then((products) => {
        res.render("product_gallery", { page_title: "All Products", products: products });
    })
});

//view product 
router.get("/product/:id", (req, res) => {
    let pid = req.params.id;
    Product.findOne({ pid: pid }).then((result) => {
        res.render("product", { page_title: result.pname, product: result });
    })
})
export default router;