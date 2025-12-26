import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext';
import { assets, dummyDashboardData } from '../../assets/assets';
import Loading from '../../Components/Student/Loading';

const Dashboard = () => {
  const {currency}=useContext(AppContext);
  //state variable to store the dashboard data
  const [dashboardData,setDashboardData] = useState(null);
  const fetchDashboardData=()=>{
    setDashboardData(dummyDashboardData);
  }
  useEffect(()=>{
    fetchDashboardData();
  },[]);
  return dashboardData ?(
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 
    md:p-8 p-4 pb-0 md:pb-0 pt-8'>
      <div className='space-y-5'>
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex items-center gap-3 shadow-card border border-blue-600 
          p-4 w-56 rounded-md'>
            <img src={assets.patients_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-base text-gray-500'>TotalEnrollments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-600 
          p-4 w-56 rounded-md'>
            <img src={assets.appointments_icon} alt="appointment_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-500'>{dashboardData.totalCourses}</p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-600 
          p-4 w-56 rounded-md'>
            <img src={assets.earning_icon} alt="patients_icon" />
            <div>
              <p className='text-2xl font-medium text-gray-500'>{currency}{dashboardData.totalEarnings}</p>
              <p className='text-base text-gray-500'>Total Earning</p>
            </div>
          </div>
        </div>
        {/**enrolled students */}
        <div className='md:pt-8'>
          <h2 className='pb-6 text-lg font-medium'>Latest Enrollments</h2>
          <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden 
          rounded-md bg-white border border-gray-500/20 '>
            <table className='table-fixed md:table-auto w-full overflow-hidden'>
              <thead className='text-gray-900 border-b border-gray-500/20 text-sm 
              text-left'>
                <tr>
                  <th className='px-4 py-3 font-semibold text-center hidden 
                  sm:table-cell text-lg'>S.No</th>
                  <th className='px-4 py-3 text-lg font-semibold'>Student Name</th>
                  <th className='px-4 py-3 text-lg font-semibold'>Course Title</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {dashboardData.enrolledStudentsData.map((student,index)=>(
                  <tr className='border-b border-gray-500/20' key={index}>
                    <td className='px-4 py-3 text-center hidden sm:table-cell'>
                      {index+1}
                    </td>
                    <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                      <img src={student.student.imageUrl} 
                      alt="profile"
                      className='w-9 h-9 rounded-full' />
                      <span className='truncate'>{student.name}</span>
                    </td>
                    <td className='px-4 py-3 truncate'>{student.courseTitle}</td>
                   </tr>
                ))}
              </tbody>
            </table>
            
          </div>

        </div>
      </div>
    </div>
    
  ): <Loading/>
}

export default Dashboard