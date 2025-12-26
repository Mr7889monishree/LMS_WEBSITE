//for creating context - we have to import create context file
import { createContext, useEffect, useState } from "react";
import {dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'


export const AppContext = createContext();

export const AppContextProvider=({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;
    const [allcourses,setAllCourses]=useState([]); // so whenever we run this app the courses data from asset file should be stored into this allcourses array here so for that we have to create a function to store that.
    const [isEducator,setIsEducator] = useState(true);
    const [enrolledcourses,setEnrolledCourses] = useState([]);

    const navigate=useNavigate();
    const fetchAllCourses=async()=>{
        setAllCourses(dummyCourses);
    }
    //function to calculate average rating of course
    const calculateRating =(course)=>{
         if(course.courseRatings.length==0){
            return 0;
         }
        let totalRating=0;
        course.courseRatings.forEach(rating =>{
            totalRating+=rating.rating;
        })
        return totalRating/course.courseRatings.length;
    }
    //function to calculate course chapter time 
    const calculateChapterTime=(chapter)=>{
        let time=0;
        chapter.chapterContent.map((lecture)=>
        time+=lecture.lectureDuration);
        return humanizeDuration(time*60*1000, {units:["h","m"]})
    }
    //function to calculate course duration
    const courseDuration=(course)=>{
        let total=0;

        course.courseContent.map((chapter)=>
        chapter.chapterContent.map((lecture)=> total+=lecture.lectureDuration))
        return humanizeDuration(total*60*1000, {units:["h","m"]})

    }
    //function to count total lecture in a course
    const CalculateNoOfLectures=(course)=>{
        let totalLectures=0;
        course.courseContent.forEach(chapter=>{
            if(Array.isArray(chapter.chapterContent)){
                totalLectures+=chapter.chapterContent.length;
            }
        });
        return totalLectures;

    }
    //fecth user enrolled courses
    const fetchUserEnrolledCourses=async()=>{
        setEnrolledCourses(dummyCourses)
    }
    useEffect(()=>{
        fetchAllCourses();
        fetchUserEnrolledCourses();
    },[])

    //creation of object to be added to the ContextProvider file which will be support for entire application
    const value={
        //whatever state or function being declared 
        // here will be passed to the AppContext.Provider file too as value
        currency, // by passing here we can use this in entire application
        allcourses,calculateRating,isEducator,setIsEducator,navigate,
        calculateChapterTime,courseDuration,CalculateNoOfLectures,enrolledcourses,fetchUserEnrolledCourses
    }
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}