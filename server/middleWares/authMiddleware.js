import { clerkClient, getAuth } from "@clerk/express";

//Middleware for protecting educator route
const protectEducator=async(req,res,next)=>{
    try {
        const {userId}=getAuth(req);
        //using this userId we have to get the user to check if he/she is educator or not
        const response=await clerkClient.users.getUser(userId);


        if(response.publicMetadata.role !=='educator'){
            return res.json({success:false,message:'Unauthorized Access'});
        }
        next();
    } catch (error) {
        res.json({success:false,message:error.message});
    }



}

export default protectEducator;