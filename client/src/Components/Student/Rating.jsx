import React, { useEffect, useState } from 'react'

const Rating = ({initialRating,onRate}) => {
  const [Rating,SetRating]=useState(initialRating || 0);

  //function to handle the rating
  const handleRating=(value)=>{
    SetRating(value);
    if(onRate) onRate(value)
  }

  useEffect(()=>{
    if(initialRating){
      SetRating(initialRating);
    }
  },[initialRating])
  return (
    <div>
      {/**creation of array */}
      {Array.from({length:5},(_,index)=>{
        const starValue=index+1;
        return (
          <span className={`text-xl
          sm:text-2xl cursor-pointer transition-colors
          ${starValue <= Rating ? 'text-yellow-500'
          :'text-gray-400'}`} key={index}
          onClick={()=>handleRating(starValue)}>
            &#9733;
          </span>
        )
      })}
    </div>
  )
}

export default Rating