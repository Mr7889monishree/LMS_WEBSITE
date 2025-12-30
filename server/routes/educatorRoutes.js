import express from 'express'
import upload from '../configs/multer.js';
import protectEducator from '../middleWares/authMiddleware.js';
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';


const educatorRouter= express.Router();

//Add educator router
educatorRouter.post('/update-role',updateRoleToEducator);
educatorRouter.post(
  '/add-course',
  protectEducator,
  upload.single('image'),
  addCourse
);
educatorRouter.get('/courses',
  protectEducator,
  getEducatorCourses
);
educatorRouter.get('/dashboard',
  protectEducator,
  educatorDashboardData
);
educatorRouter.get('/enrolled-students',
  protectEducator,
  getEnrolledStudentsData
);

//API's TO GET ALL COURSES AND INDIVIDUAL COURSE WITH THEIR ID's




export default educatorRouter;