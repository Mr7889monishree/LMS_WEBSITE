import React from 'react'
import {Route, Routes, useMatch } from 'react-router-dom'
import Home from './Pages/Student/Home'
import CoursesList from './Pages/Student/CoursesList'
import CourseDetails from './Pages/Student/CourseDetails'
import MyEnrollments from './Pages/Student/MyEnrollments'
import Player from './Pages/Student/Player'
import Loading from './Components/Student/Loading'
import Educator from './Pages/Educator/Educator'
import Dashboard from './Pages/Educator/Dashboard'
import Addcourse from './Pages/Educator/Addcourse'
import MyCourses from './Pages/Educator/MyCourses'
import StudentsEnrolled from './Pages/Educator/StudentsEnrolled'
import Navbar from './Components/Student/Navbar'
import "quill/dist/quill.snow.css";
import {ToastContainer} from 'react-toastify';

const App = () => {
  //whenever this path matches and after educator any other page in educator is opened means this navbar should be visible not the navbar designed for other pages 
  //useMatch() is a hook used in react router for checking if the particular path assigned matches
  const isEducatorRoute = useMatch('/educator/*')
  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer/>
      {!isEducatorRoute && <Navbar/>}
      {/**this is only for students and other pages 
       * but when its for educator diff navbar will be shown
       * that will be shown and that time this navbar should be 
       * hidden.
      */}
      <Routes>
        {/**Routes for Student page */}
        <Route path='/' element={<Home/>}/>
        <Route path='/course-list' element={<CoursesList/>}/>
        {/**for displaying filtered course list */}
        <Route path='/course-list/:input' element={<CoursesList/>}/>
        {/**courses for that particular user id which is a dynamic route */}
        <Route path='/course/:id' element={<CourseDetails/>}/>
        <Route path='/my-enrollments' element={<MyEnrollments/>}/>
        <Route path='/player/:courseId' element={<Player/>}/>
        {/**dynamic routing */}
        <Route path='/loading/:path' element={<Loading/>}/>
        <Route/>
        {/**Routing for educators */}
        <Route path='/educator' element={<Educator/>}>
            {/**adding nested routes */}
            <Route path='/educator' element={<Dashboard/>}/>
            <Route path='add-course' element={<Addcourse/>}/>
            <Route path='my-courses' element={<MyCourses/>}/>
            <Route path='student-enrolled' element={<StudentsEnrolled/>}/>

        </Route>
      </Routes>
    </div>
  )
}

export default App