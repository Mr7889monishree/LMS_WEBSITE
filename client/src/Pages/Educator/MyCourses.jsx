import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import { assets, dummyCourses } from '../../assets/assets';
import Loading from '../../Components/Student/Loading';

const MyCourses = () => {
  const {currency,allcourses}=useContext(AppContext);
  //state variable to store the courses
  const [course,setCourse]=useState(null);
  const fetchAllCourses=async()=>{
    setCourse(allcourses);
  }
  useEffect(()=>{
    fetchAllCourses();
  },[])
  return course ?(
    <div className='h-screen flex flex-col items-start justify-between 
    md:pb-0 pb-0 md:p-8 p-4 '>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden 
        rounded-md bg-white border border-gray-500/20'>
          <table className='md:table-auto table-fixed w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm 
            text-left'>
              <tr>
                <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Published On</th>
              </tr>
            </thead>
            <tbody className='text-md text-gray-500'>
              {course.map((course)=>(
                <tr key={course._id} className='border-b border-gray-500/20'>
                  <td className='md:px-6 pl-3 md:pl-6 py-4 flex items-center space-x-4 truncate'>
                    <img src={course.courseThumbnail} alt="courseImage" 
                    className='w-20'/>
                    <span className='truncate hidden md:block text-md'>{course.courseTitle}</span>
                  </td>
                  <td className='px-6 py-4 text-md'>{currency} {
                    Math.floor(course.enrolledStudents.length * (course.coursePrice 
                      - course.discount * course.coursePrice / 100 
                    ))}</td>
                  <td className='px-6 py-4 text-md'>{course.enrolledStudents.length}</td>
                  <td className='px-6 py-4 text-md' >
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
  ): <Loading/>
}

export default MyCourses