import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../Components/Educator/Navbar'
import Sidebar from '../../Components/Educator/Sidebar'
import Footer from '../../Components/Educator/Footer'

const Educator = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
        <Navbar/>

        <div className='flex'>
          {/**left side will get sidebar */}
          <Sidebar/>
          <div className='flex-1'>
            {/**other components on the right side where flex-1 means it will use entire space available in the row */}
             {<Outlet/>}
          </div>
           
        </div>
        <Footer/>
    </div>
  )
}

export default Educator