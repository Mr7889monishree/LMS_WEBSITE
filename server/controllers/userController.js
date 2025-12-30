import {getAuth} from '@clerk/express';
import User from '../models/User.js';
import Course from '../models/course.js';
import Purchase from '../models/Purchase.js';
import Stripe from "stripe";

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
export const purchaseCourse=async(req,res)=>{
    try {
        //1)get the courseId
        const {courseId}=req.body;
        //2)get the origin
        const {origin}=req.headers;
        //3)get the userId and courseData
        const {userId}=getAuth(req);
        const userData=await User.findById(userId);
        const courseData=await Course.findById(courseId);

        //check whether we have user and coursedata
        if(!userData || !courseData){
            return res.json({success:false,message:'Data not found'});
        }
        //if both are available
        const purchaseData={
            courseId:courseData._id,
            userId,
            amount:(courseData.coursePrice - courseData.discount * courseData.coursePrice/100).toFixed(2),
        };
        //store in mongodb
        const newPurchase=await Purchase.create(purchaseData);
        //after storing we have initialize payment gateway using stripe
        const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency=process.env.CURRENCY.toLowerCase();
        //creating line items for stripe for storing data
        const lineItems=[{
            price_data:{
                currency,
                product_data:{
                    name:courseData.courseTitle
                },
                unit_amount:Math.floor(newPurchase.amount) * 100,
            },
            quantity:1,
        }];

        //using this line items,will create one payment session
        const session=await stripeInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-enrollments`,
            cancel_url:`${origin}/`,
            line_items:lineItems,
            mode:'payment',
            metadata:{
                purchaseId:newPurchase._id.toString()
            }
        })
        res.json({success:true,session_url:session.url});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}