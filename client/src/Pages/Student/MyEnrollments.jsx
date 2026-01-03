import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext';
import {Line} from 'rc-progress'
import Footer from '../../Components/Student/Footer';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyEnrollments = () => {
  const {enrolledcourses,fetchUserEnrolledCourses,courseDuration,navigate,userData,
    backendUrl,getToken,CalculateNoOfLectures
  }=useContext(AppContext);
  const [progressArray,SetProgressArray]=useState([])

  //function for getting course progress from backend
  const getCourseProgress=async()=>{
    try {
      const token=await getToken();
      //function that will get progress data of multiple courses so we need multiple async operation and to handle that follow given below code
      const tempProgressArray=await Promise.all(
        enrolledcourses.map(async(course)=>{
          const {data}=await axios.get(`${backendUrl}/api/user/get-course-progress`,{courseId:course._id},
            {headers:{Authorization:`Bearer ${token}`}}
          )
           let totalLectures=CalculateNoOfLectures(course);
            const lectureCompleted = data?.progressData?. lectureCompleted?.length || 0;

          return {totalLectures,lectureCompleted,courseId:course._id};
        })
      )
      SetProgressArray(tempProgressArray);

    } catch (error) {
      toast.error(error.message);
    }
  }
  useEffect(()=>{
    if(userData){
      fetchUserEnrolledCourses();
    }
  },[userData])
  useEffect(()=>{
    if(enrolledcourses.length > 0){
      getCourseProgress();
    }
  },[enrolledcourses])
  return (
    <>
      <div className='md:px-36 px-8 pt-10'>
          <h1 className='text-2xl font-semibold'>My Enrollments</h1>
          <table className='md:table-auto table-fixed w-full overflow-hidden border
          mt-10'>
            <thead className='text-gray-900 border-b border-gray-500/20
            text-sm text-left  max-sm:hidden'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>Course</th>
                <th className='px-4 py-3 font-semibold truncate'>Duration</th>
                <th className='px-4 py-3 font-semibold truncate'>Completed</th>
                <th className='px-4 py-3 font-semibold truncate'>Status</th>
              </tr>
            </thead>
            <tbody className='text-gray-700'>
              {/**displaying the individual courses details */}
              {enrolledcourses.map((course,index)=>(
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='md:px-6 pl-4 md:pl-4 py-4
                  flex items-center space-x-3'>
                    <img src={course.courseThumbnail} alt="" 
                    className='w-16 sm:w-24 md:w-40'/>
                  <div className='flex-1'>
                    <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                    <Line strokeWidth={0.8} percent={progressArray[index] ?
                      (progressArray[index].lectureCompleted*100/ progressArray[index].totalLectures) : 0
                    } className='bg-gray-300
                    rounded-full'/>
                  </div>
                  </td>
                  <td className='px-4 py-3 max-sm:hidden'>
                    {/**courseDurationtime */}
                    {courseDuration(course)}
                  </td>
                  <td className='px-4 py-3 max-sm:hidden'>
  {progressArray[index] 
    ? `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures} Lectures` 
    : '0 Lecture'}
      </td>

      <td className='px-4 py-3 max-sm:text-right'>
        <button
          onClick={()=>navigate('/player/' + course._id)}
          className='px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 max-sm:text-xs text-white rounded'
        >
          {progressArray[index] && progressArray[index].totalLectures > 0 &&
          progressArray[index].lectureCompleted / progressArray[index].totalLectures === 1 
            ? 'Completed' : 'Ongoing'}
        </button>
      </td>

                </tr>
              ))}
            </tbody>
          </table>
      </div>
      <Footer/> 
    </>
  )
}

export default MyEnrollments