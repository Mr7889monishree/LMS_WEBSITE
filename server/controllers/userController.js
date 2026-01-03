import {getAuth} from '@clerk/express';
import User from '../models/User.js';
import Course from '../models/course.js';
import Purchase from '../models/Purchase.js';
import Stripe from "stripe";
import CourseProgress from '../models/CourseProgress.js';

export const getUserData=async(req,res)=>{
    try {
        const {userId}=getAuth(req);
        const user=await User.findById(userId);
        
        //if user doesnt exist
        if(!user){
            return res.json({success:false,message:'User not found'});
        }
        res.json({success:true,user});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export const usersEnrolledCourses=async(req,res)=>{
    try {
        const {userId}=getAuth(req);
        const userData=await User.findById(userId).populate('enrolledCourses');

        res.json({success:true,enrolledCourses:userData.enrolledCourses});
        
        
    } catch (error) {
        res.json({success:false,message:error.message});

    }
}

//controller function to purchase any course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const { userId } = getAuth(req);

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({ success: false, message: 'User or course not found' });
    }

    // Calculate the discounted amount
    const amount = Number(
      (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)
    );

    // Store purchase in DB
    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    // Create Stripe line item
    const lineItems = [
      {
        price_data: {
          currency,
          product_data: { name: courseData.courseTitle },
          unit_amount: Math.floor(amount * 100), // convert dollars to cents
        },
        quantity: 1,
      },
    ];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      metadata: { purchaseId: newPurchase._id.toString() }
    });

    // Return session ID (frontend handles redirect)
    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Controller Function - To Update User Course Progress
export const updateCourseProgress=async(req,res)=>{
  try {
    //to update the progress of particular course
    //1)user is required
    //2) the particular course user is learning and lecture details are required
    const {userId}=getAuth(req);
    const {courseId,lectureId}=req.body;
    const progressData=await CourseProgress.findOne({userId,courseId});
    if(progressData){
      //if the lectureId is included in completed section
      if(progressData.lectureCompleted.includes(lectureId)){
        return res.json({success:true,message:'Lecture Already Completed'});
      }
      //if the lectureId is not present in completed section then we need to push to mark it as complete if its completed then it will be added here
      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    }
      //progressData doesnt exist
      else{
        await CourseProgress.create({
          userId,
          courseId,
          lectureCompleted:[lectureId]

        })
      
    }
    res.json({success:true, message:'Progress Updated'});

  } catch (error) {
    res.json({success:false,message:error.message});
    
  }
}

//Controller Function that provide use the CourseProgress details
export const getUserCourseProgress=async(req,res)=>{
  try {
    const {userId}=getAuth(req);
    const {courseId}=req.body;
    const progressData=await CourseProgress.findOne({userId,courseId});
    res.json({success:true,progressData});

  } catch (error) {
    res.json({success:false,message:error.message});
    
  }
}

//Controller to Add user Rating to individual course
export const addUserRating=async(req,res)=>{
    const {userId}=getAuth(req);
    const {courseId,rating}=req.body;
    
    if(!courseId || !userId || !rating || rating<1 || rating>5){
      return res.json({success:false,message:'Invalid Details'});
    }

    //if all these details are valid then
    try {
      const courseData=await Course.findById(courseId);

      if(!courseData){
        return res.json({success:false,message:'Course not found'});
      }
      const userData=await User.findById(userId);
      //if the courseId is not available in enrolledCourseData then we cannot rate the course if its available then only we can rate a course as its enrolled otherwise its not enrolled
      if(!userData || !userData.enrolledCourses.includes(courseId)){
        return res.json({success:false,message:'User has not purchased this course'});
      }

      //if we have purchased then is rating provided or not
      const existingRatingIndex=courseData.courseRatings.findIndex(r=> r.userId===userId);

      //if the rating is already provided by the user then we have to update them
      if(existingRatingIndex > -1){
        courseData.courseRatings[existingRatingIndex].rating=rating;
      }
      //if User has not given rating earlier
      else{
        courseData.courseRatings.push({
          userId,rating
        })
      }
      await Course.save();
      res.json({success:true,message:'Rating Added'});
    } catch (error) {
      res.json({success:false,message:error.message});
    }

}
