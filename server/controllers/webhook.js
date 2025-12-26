import { Webhook } from "svix";
import User from "../models/User.js";

const clerkWebhooks = async (req, res) => {
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


export default clerkWebhooks;