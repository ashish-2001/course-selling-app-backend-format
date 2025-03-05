const mongoose = require("mongoose");

console.log("connecting To...");

const Schema = mongoose.Schema;

const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    password: String,
    email: {type: String, unique: true},
});

const adminSchema = new Schema({
    firstName: String,
    lastName: String,
    password: String,
    email: {type: String, unique: true}
});

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imgUrl: String,
    creatorId: ObjectId
});

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId,
});

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema)

module.exports = {
    userModel: userModel,
    adminModel: adminModel,
    courseModel: courseModel,
    purchaseModel: purchaseModel
}