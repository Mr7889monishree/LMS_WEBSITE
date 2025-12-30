import Course from '../models/course.js'

//Get All course
export const getAllCourses=async(req,res)=>{
    try {
        const courses=await Course.find({
            //display all courses where isPublished is true
            isPublished:true
        }).select(['-courseContent','-enrolledStudents']).populate({
            path:'educatorId'
        }) 
        res.json({success:true,courses});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

//Get course by their id
export const getCourseId=async(req,res)=>{
    //get the id
    const {id}=req.params;//id from the course url
    try {
        //find individual course using id parameter
        const courseData=await Course.findById(id).populate({path:'educatorId'});

        //Remove lectureUrl if isPreview is false
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl="";
                }
            })
        })
        res.json({success:true,courseData});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}
