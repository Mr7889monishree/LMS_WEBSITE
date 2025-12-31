import mongoose from 'mongoose'

const courseProgressSchema=new mongoose.Schema(
    {
        userId:{type:String,required:true},
        courseId:{type:String,required:true},
        completed:{type:Boolean,default:false},
        lectureCompleted:[],//list of lectures thats completed



    },{minimize:false},
    {/**Mongoose will ensure that if you set an empty object {} for a field, that empty object will be stored in the MongoDB document. For this field we have lectureCompleted as empty object by so for that to be stored initially we need to set minimize to be false which is by default true where mongoDb will not store the empty object as we force now it will*/}
);


const CourseProgress=mongoose.model('CourseProgress',courseProgressSchema);

export default CourseProgress;