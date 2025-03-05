const { Router } = require("express");

const adminRouter = Router();

const { JWT_ADMIN_PASSWORD } = require("../config");

const { adminModel, courseModel } = require("../db");
const  jwt  = require("jsonwebtoken");
const { z } = require("zod");

const { adminMiddleware } = require("../middleware/admin");

const bcrypt = require("bcrypt");

// adminRouter.use(middleware);

adminRouter.post("/signup", async function(req, res){

    const adminInfoType = z.object({
        email: z.string().min(4).max(40).email(),
        password: z.string().min(4).max(40),
        lastName: z.string().min(4).max(40),
        firstName: z.string().min(4).max(40)
    });

    const parsingData = adminInfoType.safeParse(req.body);

    if(!parsingData.success){
        res.json({
            massage: "Incorrect Format!",
            error: parsingData.error
        });
        return;
    }

    const { email, password, lastName, firstName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 5);
    await adminModel.create({
        email: email,
        password: hashedPassword,
        lastName: lastName,
        firstName: firstName
    });
    res.json({
        message: "Admin Signed Up!"
    });
});

adminRouter.post("/signin", async function(req, res){
    const { email, password } = req.body;

    const admin = await adminModel.findOne({
        email: email
    });
    if(!admin){
        res.status(403).json({
            message: "Admin not found!"
        });
        return;
    }
    const comparePassword = await bcrypt.compare(password, admin.password);
    if(comparePassword){
        const token = jwt.sign({
            id: admin._id.toString()
        }, JWT_ADMIN_PASSWORD);
        res.json({
            token: token
        });
    }
    else{
        res.status(403).json({
            message: "Incorrect Credentials!"
        });
    };
});

adminRouter.post("/course", adminMiddleware, async function(req, res){
    const adminId = req.userId;

    const courseInfoType = z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        imgUrl: z.string()
    });

    const parsingData = courseInfoType.safeParse(req.body);
    if(!parsingData.success){
        res.status(403).json({
            message: "Incorrect course adat format!",
            error: parsingData.error
        });
        return;
    }

    const { title, description, price, imgUrl } = req.body;
    await courseModel.create({
        title: title,
        description: description,
        price: price,
        imgUrl: imgUrl,
        creatorId: adminId
    })
    res.json({
        message:"Course created!",
        creatorId: course._id
    });
});

adminRouter.put("/course", adminMiddleware, async function(req, res){
    const adminId = req.userId;

    const { title, description, price, imgUrl, courseId } = req.body;
    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    },
    {
        title: title,
        description: description,
        price: price,
        imgUrl: imgUrl
    })
    res.json({
        message: "Course Updated!",
        courseId: courseId
    });
});

adminRouter.get("/course/bulk", adminMiddleware, async function(req, res){

    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId
    });
    res.json({
        message: "The courses!",
        courseId: courses
    });
});

module.exports = {
    adminRouter: adminRouter
}