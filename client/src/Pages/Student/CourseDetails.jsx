import React, { useContext, useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import { AppContext } from '../../Context/AppContext';
import Loading from '../../Components/Student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../Components/Student/Footer';
import YouTube from 'react-youtube'
import axios from 'axios';
import { toast } from 'react-toastify';
const CourseDetails = () => { 
  const {id}=useParams();//to get the particular course id from the url

  //state variable to store course data
  const [courseData,setCourseData]=useState(null);
  const [openSection,setOpenSection]=useState({});
  const [playerData,setPlayerData]=useState(null);
  const [isAlreadyenrolled,setIsAlreadyEnrolled]=useState(false);
  //using this id we will find particular course with that id from allcourses
  const {currency,allcourses,calculateRating,calculateChapterTime,courseDuration,CalculateNoOfLectures,
    backendUrl,userData,getToken
  }=useContext(AppContext);

  //function for fetching individual course data
  const fetchCourse=async()=>{
    try {
      //individula course data
      const {data}=await axios.get(backendUrl+'/api/course/'+id);
      
      if(data.success){
        setCourseData(data.courseData);
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  //Function to enrollCourse so that user can enroll and purchase the course
  const enrollCourse = async () => {
  try {
    if (!userData) return toast.warn('Login to Enroll');

    if (isAlreadyenrolled) return toast.warn('Already Enrolled');

    const token = await getToken();

    //Send the actual course _id (as string) to backend
    const { data } = await axios.post(backendUrl+
      '/api/user/purchase',
      {courseId:courseData._id},
      {headers:{Authorization:`Bearer ${token}`}}
    )
    if (data.success) {
      const {session_url}=data;
      window.location.replace(session_url);
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    toast.error(error.message);
  }
};

  //course data now available
  useEffect(()=>{
    fetchCourse();
  },[])
  useEffect(() => {
  if (userData?.enrolledCourses?.length && courseData?._id) {
    const enrolledIds = userData.enrolledCourses.map(e => e.toString());
    setIsAlreadyEnrolled(enrolledIds.includes(courseData._id.toString()));
  }
}, [userData, courseData]);

  //toggle function
  const toggleSection=(index)=>{
    setOpenSection((prev)=>(
      {...prev,
        [index]: !prev[index],
      }
    ))
  }
  return  courseData ? (
    <>
    <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between
    md:px-36 px-8 md:pt-30 pt-20 text-left'>
      <div className='absolute top-0 left-0 w-full h-section-height -z-1
      bg-gradient-to-b from-cyan-100/70'></div>
        {/* left column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-details-heading-large 
          text-course-details-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
          {/**this is used to hide the html tags from the text being displayed */}
          <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{__html:courseData.courseDescription.slice(0,200)}}></p>

          {/* course rating and reviews */}
          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
              <div className='flex'>
                {[...Array(5)].map((_,i)=> (<img key={i} src={
                  i<Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank
                } alt="star-ratings"
                className='w-3.5 h-3.5'/>))}
              </div>
            <p className='text-blue-600'>({courseData.courseRatings.length} {
              courseData.courseRatings.length>1 ? 'Ratings' : 'Rating '})</p>
            {/**total number of enrolledstudents */}
            <p>{courseData.enrolledStudents.length}
              {courseData.enrolledStudents.length > 1 ? 'students':'student'}
            </p>
          </div>
          <p className='text-sm'>Course by <span className='text-blue-600 underline'>{courseData.educatorId.name}</span></p>
          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5'>
              {courseData.courseContent.map((chapter,index)=>(
                <div key={index} className='border border-gray-300
                bg-white mb-2 rounded'>
                  <div className='flex items-center justify-between
                   px-4 py-3 cursor-pointer select-none' onClick={()=>{toggleSection(index)}}>
                    <div className='flex items-center gap-2'>
                      <img src={assets.down_arrow_icon} alt="arrow icon" 
                      className={`transform transition-transform ${openSection[index] 
                        ? 'rotate-180' : ''
                      }`}/>
                      <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-default '>{chapter.chapterContent.length} Lectures - {
                      calculateChapterTime(chapter)} </p>
                  </div>
                  {/**for lectures to appear here */}
                  <div className={`overflow-hidden transition-all duration-300
                    ${openSection[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t
                    border-gray-300'>
                      {chapter.chapterContent.map((lecture,i)=>(
                        <li key={i} className='flex items-start gap-2 py-1'>
                          <img src={assets.play_icon} alt="play icon"
                          className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full
                          text-gray-800 text-xs md:text-default gap-3'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {/**if the lecture is available for free preview then display this */}
                              {lecture.isPreviewFree && <p onClick={()=> setPlayerData({
                                videoId:lecture.lectureUrl.split('/').pop() //clicking on this
                                //preview we will get the videoId in the variable and it will be stored in the playerData so using that video id we would get the preview videoid we have to play that video on the course thumbnail
                              })} className='text-blue-500 cursor-pointer'>Preview</p>}
                              {/**total duration of lecture */}
                              <p>{humanizeDuration(lecture.lectureDuration*60*1000,{units:['h','m']})}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='py-20 text-sm md:text-default'>
            <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
            <p className='pt-3 rich-text'
             dangerouslySetInnerHTML={{__html:courseData.courseDescription}}></p>
          </div>
        </div>
        {/* right column */}
        <div className='max-w-course-card z-10 shadow-custom-card rounded-t
            md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[400px] mx-auto'>
              {/**course image and price details */}
            {
                playerData ? 
                <YouTube
                videoId={playerData.videoId}
                opts={{playerVars:{autoplay:1}}}
                iframeClassName='w-full aspect-video'
                />

                : 
                <img src={courseData.courseThumbnail} alt="" /> 
              }
          
          <div className='p-5'>
            <div className='flex items-center gap-2'>
              
              <img className='w-3.5'
               src={assets.time_left_clock_icon} alt="time left clock icon" />
               <p className='text-red-500'><span className='font-medium'>
                5 days</span> left at this price!</p>
            </div>
            <div className='flex items-center gap-3 pt-2'>
              {/**discount price */}
              <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
              <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
              <p className='md:text-lg text-gray-500 '>{courseData.discount} % off</p>
            </div>
            {/**more details of course like:duration,lectures count etc.. */}
            <div className='flex items-center text-sm md:text-default gap-4 pt-2
            md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              {/**vertical line creation properties*/}
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt="time clock icon" />
                <p>{courseDuration(courseData)}</p>{/**total duration of the course */}
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt="lecture icon" />
                <p>{CalculateNoOfLectures(courseData)} lessons</p>{/**total duration of the course */}
              </div>
            </div>
           <button
        onClick={enrollCourse}
        disabled={!courseData?._id || isAlreadyenrolled}
        className={`w-full py-3 px-2 rounded font-medium ${
          isAlreadyenrolled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white'
        }`}
      >
        {isAlreadyenrolled ? 'Already Enrolled' : 'Enroll Now'}
</button>


            <div className='pt-6'>
              <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the course?</p>
              <ul className='ml-4 pt-2 text-sm md:text-default list-disc
              text-gray-500'>
                <li>Lifetime access with free updates</li>
                <li>Step-by-Step, hands-on project guidances</li>
                <li>Downloadable resources and source code</li>
                <li>Quizzes to test your knowledge</li>
                <li>Certificate of completion</li>
              </ul>
            </div>
          </div>
          

        </div>
    </div>
    <Footer/>
    </>
  ) : <Loading/>
}

export default CourseDetails