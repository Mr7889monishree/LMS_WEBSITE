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
    res.status(200).json({ success: true, sessionId: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};