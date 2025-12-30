import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/course.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        whook.verify(req.body.toString(), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url || ""
                };
                await User.create(userData);
                return res.json({});
            }
            case "user.updated": {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url || ""
                };
                await User.findByIdAndUpdate(data.id, userData, { new: true });
                return res.json({});
            }
            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                return res.json({});
            }
            default:
                return res.status(200).json({ message: "Event type not handled" });
        }
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const purchaseId = session.metadata.purchaseId;

    try {
      const purchase = await Purchase.findById(purchaseId);
      const user = await User.findById(purchase.userId);
      const course = await Course.findById(purchase.courseId);

      // Update DB
      course.enrolledStudents.push(user._id);
      await course.save();

      user.enrolledCourses.push(course._id);
      await user.save();

      purchase.status = 'completed';
      await purchase.save();

      console.log(`Purchase ${purchaseId} completed`);
    } catch (err) {
      console.error('Error updating DB after webhook', err);
    }
  }

  // respond 200 to Stripe
  res.json({ received: true });
};


