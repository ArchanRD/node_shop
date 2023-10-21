import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    pid: {
        type: Number,
        unique: true,
        required: true,
    },
    pname: {
        type: String,
        required: true,
    },
    pdesc: {
        type: String,
        required: true,
    },
    pprice: {
        type: Number,
        required: true,
    },
    pimages: {
        type: String,
        required: true,
    },
    pcategorys: {
        type: String,
    },
    ptags: [String],
    pstock: {
        type: Number,
        required: true,
    },
    variants: [String],
    status: {
        type: String,
    },
});

const Product = mongoose.model('Product', productSchema);
export default Product;