import React, { useContext, useState } from 'react'
import { AppContext } from '../../Context/AppContext';
import { assets } from '../../assets/assets';
import {Line} from 'rc-progress'
import Footer from '../../Components/Student/Footer';

const MyEnrollments = () => {
  const {enrolledcourses,fetchUserEnrolledCourses,courseDuration,navigate}=useContext(AppContext);
  const [progressArray,SetProgressArray]=useState([
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:1,totalLectures:5},
    {lectureCompleted:3,totalLectures:6},
    {lectureCompleted:2,totalLectures:4},
    {lectureCompleted:0,totalLectures:3},
    {lectureCompleted:5,totalLectures:7},
    {lectureCompleted:5,totalLectures:5},
    {lectureCompleted:6,totalLectures:8},
    {lectureCompleted:4,totalLectures:7},
    {lectureCompleted:7,totalLectures:7},
    {lectureCompleted:1,totalLectures:4},
    {lectureCompleted:0,totalLectures:2},
    {lectureCompleted:4,totalLectures:4},
  ])
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
                    {/**lectures completed out of total lectures */}
                    {progressArray[index] && `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`}<span>Lectures</span>
                  </td>
                  <td className='px-4 py-3 max-sm:text-right'>
                    <button
                    onClick={()=>navigate('/player/' + course._id)}
                    className='px-4 sm:px-6 py-2 sm:py-3
                    bg-blue-600 max-sm:text-xs text-white rounded'>
                      {progressArray[index] && progressArray[index].lectureCompleted /
                      progressArray[index].totalLectures === 1 ? 'Completed' : 'Ongoing'}
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