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

    // 5️⃣ Handle Clerk events
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          imageUrl: data.image_url,
        };

        await User.create(userData);
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          imageUrl: data.image_url,
        };

        await User.findByIdAndUpdate(data.id, userData);
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
        // Ignore unneeded events
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