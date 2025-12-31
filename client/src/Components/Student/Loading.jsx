import { useEffect } from 'react';
import {useNavigate, useParams } from 'react-router-dom'
const Loading = () => {
  const navigate = useNavigate();
  const { path } = useParams();

  useEffect(() => {
    // small delay to allow webhook/db sync
    const timer = setTimeout(() => {
      navigate(`/${path}`)
    }, 1500)

    return () => clearTimeout(timer)
  }, [navigate, path])
  return (
    
    <div className='min-h-screen flex items-center justify-center'>
      {/* loading animation */}
      <div className='w-16 sm:w-20 aspect-square border-4
      border-gray-300 border-t-4 border-t-blue-400 rounded-full
      animate-spin'>
      </div>
        
    </div>
  )
}

export default Loading