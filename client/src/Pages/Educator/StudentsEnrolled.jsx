import { useEffect, useState } from 'react'
import { dummyStudentEnrolled } from '../../assets/assets';
import Loading from '../../Components/Student/Loading';

const StudentsEnrolled = () => {
  const [studentsEnrolled,setStudentsEnrolled]=useState(null);

  const getStudentsEnrolled=async()=>{
    setStudentsEnrolled(dummyStudentEnrolled);
  }
  useEffect(()=>{
    getStudentsEnrolled();
  },[])
  return studentsEnrolled ? (
    <div className='min-h-screen flex flex-col items-start justify-between 
    md:pb-0 pb-0 md:px-8 px-4 pt-8'>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden 
        rounded-md bg-white border border-gray-500/20'>
          <table className='table-fixed md:table-auto overflow-hidden w-full pb-4'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 text-center hidden sm:table-cell'>
                  S.No
                </th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Course Title</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className='text-md text-gray-500'>
              {studentsEnrolled.map((item,index)=>(
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>
                    {index+1}
                  </td>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3 '>
                    <img src={item.student.imageUrl}
                     alt="profileImage" 
                     className='w-9 h-9 rounded-full'/>
                     <span className='truncate'>{item.student.name}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                  <td className='px-4 py-3 hidden text-center sm:table-cell'>{
                    new Date(item.purchaseDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  ): <Loading/>
}

export default StudentsEnrolled