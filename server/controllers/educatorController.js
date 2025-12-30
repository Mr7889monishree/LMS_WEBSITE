//for updating the role of educator so that regular user can become an educator
import {clerkClient, getAuth} from '@clerk/express'
import {v2 as cloudinary} from 'cloudinary'
import Course from '../models/course.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

//so in users meta data we have to update the user to an educator where role will be update for that updation to be possible this line is written below:
export const updateRoleToEducator=async(req,res)=>{
    try {
        const {userId}=getAuth(req);
        
        await clerkClient.users.updateUserMetadata(userId,
            {
                publicMetadata:{
                    role:'educator',
                }
            }
        )
        res.json({success:true,message:'You can now publish course'});

    } catch (error) {
      res.json({success:false,message:error.message});  
    }
}

//Add new course to the DB
export const addCourse= async(req,res)=>{
    try {
        //getting course data from req.body
        const {courseData}=req.body;
        const imageFile=req.file; //we have to parse this image using multer package
        const {userId}=getAuth(req);
        //check if we have imagefile or not
        if(!imageFile){
            return res.json({success:false,message:'Thumbnail not attached'});
        }
        //the received course data from the json file will be in form of string so to add that in our database and all we need to parse them 
        const parsedCourseData=JSON.parse(courseData);
        parsedCourseData.educatorId=userId;//adding educatorId to courseData
        
        //store the courseData in database now
        const newCourse= await Course.create(parsedCourseData);

        //upload the image to the newCourse added
        //1)upload the image to cloudinary where we will get a public url of this image which we can add it to the course data
        const imageUpload= await cloudinary.uploader.upload(imageFile.path);//pass the image file to cloudinary to get the url
        //and the url will be received in the property called secure_url
        newCourse.courseThumbnail=imageUpload.secure_url;
        await newCourse.save();

        //response
        res.json({success:true,message:'Course Added'});

    } catch (error) {
        res.json({success:false,message:error.message});
    }

}

//Controller function to Get Educator Courses
export const getEducatorCourses=async(req,res)=>{
    try {
        const {userId}=getAuth(req);
        //to find the courses with this usedId
        const courses=await Course.find({educatorId:userId});//all the courses of this particular educator will be sent
        res.json({success:true,courses});

    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

//Get Educator Dashboard Data(Total Earning,Enrolled Students,No. Of Courses)

export const educatorDashboardData=async(req,res)=>{
    try {
        const {userId}=getAuth(req);
        //all courses of particular userId
        const courses=await Course.find({educatorId:userId});

        //DashboardDatas
        //TotalCourses
        const totalCourses=courses.length;
        //TotalEarning
        const courseIds=Course.map(course=> course._id);
        const purchases=await Purchase.find({
            courseId:{$in:courseIds},
            status:'completed',
        });
        const totalEarnings = purchases.reduce((sum,purchase)=>
        sum+purchase.amount,0);

        //Student data who has enrolled into this educator Course
        const enrolledStudentsData=[];
        for(const course of courses){
            const Students=await User.find({
                _id:{$in:course.enrolledStudents},

            }, 'name imageUrl'); 
            Students.forEach(student=>{
            enrolledStudentsData.push({
                courseTitle:course.courseTitle,
                student,
            })
        })
        } //so this will give only the name and imageUrl of the students
        
        res.json({success:true,dashboardData:{
            totalEarnings,enrolledStudentsData,totalCourses
        }})

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//Controller to get enrolledStudents Data along with their purchase data
export const getEnrolledStudentsData=async(req,res)=>{
    try {
        const {userId}=getAuth(req);
        //fetch all courses created by this educator
        const courses=await Course.find({educatorId:userId});
        //gets the list of courseIds
        const courseIds=Course.map(course => course._id);
        //To find the purchases with the user and course data
        const purchases = await Purchase.find({
            courseId:{$in:courseIds},
            status:'completed',
        }).populate('userId','name imageUrl').populate('courseId','courseTitle');

        //find the students data
        const enrolledStudents=purchases.map(purchase=>({
            student:purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseDate:purchase.createdAt,
        }));
        res.json({success:true,enrolledStudents});//returns the enrolledStudents data
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}