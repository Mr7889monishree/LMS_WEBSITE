import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import {data, Link, useNavigate} from 'react-router-dom'
import { useClerk,UserButton,useUser } from '@clerk/clerk-react'
import { AppContext } from '../../Context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
const Navbar = () => {
  const {isEducator,backendUrl,setIsEducator,getToken} = useContext(AppContext);
  const {openSignIn} = useClerk();//for opening sign in page when clicking on create account button
  const {user}=useUser();
  const navigate = useNavigate();
  //checking if the particular path name includes course list
  //if it does then different color assigned
  //otherwise a different color assigned for other pages
  const isCourseListPage = location.pathname.includes('/course-list');
  
  //to make the user-->educator
  const becomeEducator=async()=>{
    try {
      if(isEducator){
        navigate('/educator');
        return;
      }
      const token=await getToken();//token of the user signedIn
      const {data}=await axios.post(backendUrl+'/api/educator/update-role',
        {},
      {headers:{Authorization:`Bearer ${token}`}}
      );
      if(data.success){
        setIsEducator(true);
        toast.success(data.message);
      }
      else{
        toast.error(data.message);
      }
    }catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <div className={`flex items-center justify-between
    px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4
    ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      {/**added image with width for different device size */}
        <img src={assets.logo} alt="Logo" 
        className='w-28 lg:w-32 cursor-pointer' onClick={()=>navigate('/')}/>
        {/**different content in desktop and mobile view */}
        <div className='hidden md:flex items-center gap-5 text-gray-500'>
          {/**desktop view */}
          <div className='flex items-center gap-5'>
            {user && 
            <><button onClick={becomeEducator} >{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
            | <Link to='/my-enrollments'>My Enrollments</Link> </>}
          </div>
          {/**if user is available then make the userButton component visible or else the create account button will be visible when they signed out */}
          { user ? <UserButton/> :
            <button onClick={()=>openSignIn()} className='bg-blue-600 text-white px-6 py-2
          rounded-full'>Create Account</button>}
        </div>
        {/**For Smaller Screens(mobile) */}
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
          <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
             {user &&
             <><button onClick={becomeEducator} >{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
             | <Link to='/my-enrollments'>My Enrollments</Link>
             </>}
          </div>
          {
            user ? <UserButton/> :
            <button onClick={()=>openSignIn()}><img src={assets.user_icon} alt="user_icon" /></button>
          }
        </div>
    </div>
  )
}

export default Navbar