import { Webhook } from "svix";
import User from "../models/User.js";

/**
 * Clerk Webhook Controller
 * - Uses RAW request body (required for Svix verification)
 * - Verifies signature using svix headers
 * - Syncs Clerk users to MongoDB
 */
const clerkWebhooks = async (req, res) => {
  try {
    // 1️⃣ Get raw payload (Express raw middleware already provided it)
    const payload = req.body.toString();

    // 2️⃣ Create Svix webhook verifier
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // 3️⃣ Verify webhook (throws if invalid)
    const event = whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // 4️⃣ Extract event data
    const { data, type } = event;

    // Log the verified event for debugging
    console.log("Clerk Webhook Event:", type, data);

    // 5️⃣ Handle Clerk events safely
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id, // Ensure your User schema allows string _id
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          imageUrl: data.image_url || "",
        };

        try {
          const newUser = await User.create(userData);
          console.log("User created:", newUser._id);
        } catch (dbError) {
          console.error("DB Error on create:", dbError.message);
        }
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          imageUrl: data.image_url || "",
        };

        try {
          const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
          if (updatedUser) {
            console.log("User updated:", updatedUser._id);
          } else {
            console.warn("User not found for update:", data.id);
          }
        } catch (dbError) {
          console.error("DB Error on update:", dbError.message);
        }
        break;
      }

      case "user.deleted": {
        try {
          const deletedUser = await User.findByIdAndDelete(data.id);
          if (deletedUser) {
            console.log("User deleted:", deletedUser._id);
          } else {
            console.warn("User not found for deletion:", data.id);
          }
        } catch (dbError) {
          console.error("DB Error on delete:", dbError.message);
        }
        break;
      }

      default:
        // Ignore unneeded events
        console.log("Ignoring event type:", type);
        break;
    }

    // 6️⃣ Always acknowledge webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Clerk Webhook Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default clerkWebhooks;
