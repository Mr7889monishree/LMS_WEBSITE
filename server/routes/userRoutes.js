import express from 'express'
import { getUserData, purchaseCourse, usersEnrolledCourses } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.get('/data',getUserData);
userRouter.get('/enrolled-courses',usersEnrolledCourses);
userRouter.post('/purchase',purchaseCourse);


export default userRouter;