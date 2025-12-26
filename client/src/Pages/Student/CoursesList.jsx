import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../Components/Student/Navbar'
import { AppContext } from '../../Context/AppContext'
import SearchBar from '../../Components/Student/SearchBar';
import { useParams } from 'react-router-dom';
import CourseCard from '../../Components/Student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../Components/Student/Footer';

const CoursesList = () => {
  const {navigate,allcourses}=useContext(AppContext);
  //to get the input from url parameter and pas to the search bar to display the asked course
  const {input}  = useParams();
  //function to show the filtered course
  const [filteredCourse,setFilteredCourse]=useState([]);

  if(!Array.isArray(allcourses)) return null;

  useEffect(()=>{
    if(allcourses && allcourses.length>0){
      const tempCourses = allcourses.slice()

      input ? 
      setFilteredCourse(
        tempCourses.filter( item =>
          item.courseTitle.toLowerCase().includes(input.toLowerCase())
        )
      )
      : setFilteredCourse(tempCourses)
    }
  },[allcourses,input])//whenever input and course change this function should run

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
          <div>
            <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
            <p className='text-gray-500'>
            <span className='text-blue-600 cursor-pointer' onClick={()=>navigate('/')}>Home</span> / <span>Course List</span></p>
          </div>
          <SearchBar data={input}/> 
        </div>
        {
          input && <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8
          -mb-8 text-gray-600'>
            <p>{input}</p>
            <img src={assets.cross_icon} alt="cross" className='cursor-pointer' 
            onClick={()=>navigate('/course-list')}/>
          </div>
        }
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 px-2 md:p-0 gap-3'>
          {/**courses to be displayed here */}
          {
            filteredCourse.map((course,index)=>
            <CourseCard key={index} course={course}/>)
          }
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default CoursesList