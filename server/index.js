import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';
import { clerkMiddleware } from '@clerk/express';
import {clerkWebhooks,stripeWebhooks} from './controllers/webhook.js';
import educatorRouter from './routes/educatorRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRoutes.js';


//initialize express app
const app=express();

//connect to database
await connectDB();
await connectCloudinary();

// middlewares FIRST
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// webhooks AFTER (isolated)
app.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebhooks
);

app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

//routes
app.use('/api/educator',educatorRouter);
app.use('/api/course',courseRouter);
app.use('/api/user',userRouter);
app.get('/',(req,res)=>{
    res.status(200).send("API WORKING!");
})

//port
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`The server is running in port no:${PORT}`);
})