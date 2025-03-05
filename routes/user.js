const { Router} = require("express");

const { purchaseModel, userModel, courseModel } = require("../db");

const userRouter = Router();

const jwt = require("jsonwebtoken");

const { JWT_USER_PASSWORD } = require("../config");

const { z } = require("zod");

const { userMiddleware } = require("../middleware/user");

const bcrypt = require("bcrypt");

userRouter.post("/signup", async function(req, res){
    const userInfoType = z.object({
        email: z.string().min(4).max(40).email,
        password: z.string().min(8).max(30),
        firstName: z.string().min(5).max(40),
        lastName: z.string().min(5).max(30)
    });

    const parsingData = userInfoType.safeParse(req.body);

    if(!parsingData.success){
        res.status(403).json({
            message: "Data format is incorrect!",
            error: parsingData.error
        });
        return;
    }

    const { email, password, firstName, lastName } = req.body;

    const hashedPassword  = await bcrypt.hash(password, 5);

    await userModel.create({
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName
    })
    res.json({
        message: "You have signed up!"
    });
});

userRouter.post("/signin", async function(req, res){

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email: email,
    });
    if(!user){
        res.json({
            message: "User does not exist!"
        });
        return;
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if(comparePassword){
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_USER_PASSWORD);
        //do cookie logic
        res.json({
            token: token
        })
    }
    else{
        res.status(403).json({
            message: "Incorrect credentials!"
        })
    }
    res.json({
        message: "You have signed in!"
    });
});
userRouter.get("/purchases", userMiddleware, async function(req, res){
    //relationships in mogodb

    const userId = req.userId;
    const purchases = await purchaseModel.find({
        userId
    });

    const coursesData = await courseModel.find({
        _id: { $in: purchases.map(x => x.courseId)}
    });
    res.json({
        purchases,
        courses: coursesData
    });
});

module.exports = {
    userRouter: userRouter
}