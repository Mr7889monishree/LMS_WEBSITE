import { getAuth } from "@clerk/express";
import Stripe from "stripe";

import User from "../models/User.js";
import Course from "../models/course.js";
import Purchase from "../models/Purchase.js";
import CourseProgress from "../models/CourseProgress.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   GET USER DATA
========================= */
export const getUserData = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   USER ENROLLED COURSES
========================= */
export const usersEnrolledCourses = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userData = await User.findById(userId).populate("enrolledCourses");
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   PURCHASE COURSE
========================= */
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const { userId } = getAuth(req);

    if (!userId ||!courseId ) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({ success: false, message: "User or course not found" });
    }

    const amount = Number(
      (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2)
    );

    const purchase = await Purchase.create({
      userId,
      courseId,
      amount,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY.toLowerCase(),
            product_data: { name: courseData.courseTitle },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      metadata: {
        purchaseId: purchase._id.toString(),
        userId: userId.toString(),
        courseId: courseId.toString(),
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   UPDATE COURSE PROGRESS
========================= */
export const updateCourseProgress = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { courseId, lectureId } = req.body || {};

    if (!userId ||!courseId ) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    let progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (!progressData.lectureCompleted.includes(lectureId)) {
        progressData.lectureCompleted.push(lectureId);
        await progressData.save();
      } else {
        return res.json({ success: true, message: "Lecture already completed" });
      }
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   GET USER COURSE PROGRESS
========================= */
export const getUserCourseProgress = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { courseId } = req.body || {};

    if (!userId ||courseId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const progressData = await CourseProgress.findOne({ userId, courseId });
    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   ADD USER RATING
========================= */
export const addUserRating = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { courseId, rating } = req.body;

    if (!userId ||!courseId ||rating < 1 ||rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid details" });
    }

    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.json({ success: false, message: "Course not found" });
    }

    const userData = await User.findById(userId);
    if (!userData || !userData.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "User has not purchased this course" });
    }

    const existingRatingIndex = courseData.courseRatings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      courseData.courseRatings[existingRatingIndex].rating = rating;
    } else {
      courseData.courseRatings.push({ userId, rating });
    }

    await courseData.save();
    res.json({ success: true, message: "Rating added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
