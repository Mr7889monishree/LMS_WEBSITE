import uniqid from 'uniqid';
import Quill from 'quill'; //the formated text to be added in course description
import {useEffect, useState,useRef} from 'react';
import { assets } from '../../assets/assets';

const Addcourse = () => {
  if(!Array.isArray) return null;
  const quillRef=useRef(null);
  const editorRef=useRef(null);
  const [courseTitle,setCourseTitle]=useState('');
  const [coursePrice,setCoursePrice]=useState(0);
  const [discount,setDiscount]=useState(0);
  const [image,setImage]=useState(null);
  const [chapters,setChapters]=useState([]);
  const [showPopUp,setShowPopup]=useState(false);
  const [currentChapterId,setCurrentChapterId]=useState(null);
  const [lectureDetails,setLectureDetails]=useState({
    lectureTitle:'',
    lectureDuration:'',
    lectureUrl:'',
    isPreviewFree:false,
  })

  const handleChapter=(action,chapterId)=>{
    if(action==='add'){
      const title=prompt('Enter your name');

      if(title){
        const newChapter={
          chapterId:uniqid(),
          chapterTitle:title,
          chapterContent:[],
          collapsed:false,
          chapterOrder: chapters.length>0 ? chapters.slice(-1)[0].chapterOrder+1:1,
        };
        setChapters([...chapters,newChapter]);
      }
    }
    else if(action==='remove'){
      setChapters(chapters.filter((chapter)=> chapter.chapterId !== chapterId))
    }
    //collapsed==false then chapter is open otherwise its closed
    else if(action==='toggle'){
      setChapters(
        chapters.map((chapter)=>
        chapter.chapterId===chapterId ? {...chapter,collapsed:!chapter.collapsed} : chapter
        )
      )
    }

  }

  const handleLectures=(action,chapterId,lectureIndex)=>{
    if(action==='add'){
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    }
    else if(action==='remove'){
      setChapters(
        chapters.map((chapter)=>{
          if(chapter.chapterId===chapterId){
            return{
              ...chapter,
              chapterContent:chapter.chapterContent.filter(
                (_,index)=>index!==lectureIndex
              ),
            };
          }
          return chapter;
        })
      )
    }
  }
  const addLecture=()=>{
    setChapters(
      chapters.map((chapter)=>{
        if(chapter.chapterId===currentChapterId){
          const content=chapter.chapterContent || [];
          const newLecture={
            ...lectureDetails,
            lectureId:uniqid(),
            lectureOrder:content.length>0 ?
            content[content.length-1].lectureOrder + 1 : 1,
            
          }
           return {
          ...chapter,
          chapterContent: [...content, newLecture],
        };
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      ...lectureDetails,
      lectureTitle:'',
      lectureDuration:'',
      lectureUrl:'',
      isPreviewFree:false,
    });
  };

  const handleSumbit=async(e)=>{
    e.preventDefault();
  }
  useEffect(()=>{
    //initiate quill only once
    if(!quillRef.current && editorRef.current){
      quillRef.current=new Quill(editorRef.current,{
        theme:'snow',
      })
    }
  },[])
  return (
    <div className='min-h-screen overflow-scroll flex flex-col items-start 
    justify-between md:p-8 p-4 md:pb-0 pb-0 pt-8'>
        <form onSubmit={handleSumbit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
          <div className='flex flex-col gap-1'>
            <p>Course Title</p>
            <input onChange={e=> setCourseTitle(e.target.value)}
            value={courseTitle}
             type="text" placeholder='Type here'
            className='outline-none md:py-2 
            py-2 px-3 rounded border border-gray-500'
            required
             />
          </div>
          <div className='flex flex-col gap-1'>
            <p>Course Description</p>
            {/**we can format text here */}
            <div ref={editorRef}></div>
          </div>
          <div className='flex items-center justify-between flex-wrap'>
            <div className='flex flex-col gap-1'>
              <p>Course Price</p>
              <input value={coursePrice}
              onChange={e=>setCoursePrice(e.target.value)}
               type="number" placeholder='0'
              className='outline-none md:py-2.5 py-2 px-3 w-28
              rounded border border-gray-500' required />
            </div>
            <div className='flex md:flex-row flex-col gap-3 items-center'>
              <p>Course Thumbnail</p>
              <label htmlFor="thumbnailImage" className='flex items-center gap-3'>
                <img src={assets.file_upload_icon} alt="" 
                className='p-3 bg-blue-500 rouned'/>
                <input type="file" id="thumbnailImage" 
                onChange={e=>setImage(e.target.files[0])}
                accept='image/*' hidden />
                {image && (
                  <img 
                  className='max-h-10'
                  src={URL.createObjectURL(image)}
                  alt='thumbnail'/>
                )}
              </label>

            </div>

          </div>
          <div className='flex flex-col gap-1'>
            <p>Discount %</p>
            <input value={discount}
            onChange={e=>setDiscount(e.target.value)}
             type="number" placeholder='0'
            min={0} max={100} className='outline-none md:py-2.5
            py-2 px-3 w-28 rounded border border-gray-500' required />
          </div>
          {/**Adding Chapters & Lectures */}
          <div>
            {chapters.map((chapter,index)=>(
              <div key={index} className='bg-white border rounded-lg mb-4'>
                <div className='flex justify-between items-center p-4 border-b'>
                  <div className='flex items-center'>
                    <img src={assets.down_arrow_icon} alt="down_arrow_icon"
                    width={14} className={`mr-2 cursor-pointer transition-all
                    ${chapter.collapsed  && 'rotate-90'} `
                    } onClick={()=>handleChapter('toggle',chapter.chapterId)}/>
                    {/**chapter no and title */}
                    <span className='font-semibold'>{index+1} {chapter.chapterTitle}</span>
                  </div>
                  <span className='text-gray-500'>{chapter.chapterContent.length} Lectures</span>
                  <img src={assets.cross_icon} alt="" className='cursor-pointer'
                  onClick={()=>handleChapter('remove',chapter.chapterId)} />
                </div>
              
                {/**when chapter is not collapsed display the lectures */}
                {!chapter.collapsed && (
                  <div className='p-4'>
                    {chapter.chapterContent.map((lecture,index)=>(
                      <div key={index} className='flex justify-between items-center mb-2'>
                        {/**lecture no,title and lecture duration and lecture link provided */}
                        <span>{index+1}.{lecture.lectureTitle} - {
                          lecture.lectureDuration} mins - 
                          <a href={lecture.lectureUrl} 
                          className='text-blue-500' target='_blank'>Link</a> -{lecture.isPreviewFree ?
                          'Free Preview' : 'Paid'} </span>
                          <img src={assets.cross_icon} alt="" className='cursor-pointer'
                          onClick={()=> handleLectures('remove',chapter.chapterId,index)} />
                      </div>

                    ))}
                    <div className='inline-flex bg-gray-100 p-2 rounded cursor-pointer'
                    onClick={()=>handleLectures('add',
                      chapter.chapterId
                    )}>
                      + Add Lecture
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className='flex justify-center items-center bg-blue-100 p-2
            rounded-lg cursor-pointer' onClick={()=> handleChapter('add')}>+ Add Chapter</div>

            {
              showPopUp && (
                <div className='fixed inset-0 flex items-center justify-center 
                bg-gray-800 bg-opacity-50'>
                  <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                    <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>
                    <div className='mb-2'>
                      <p>Lecture Title</p>
                      <input
                      type='text'
                      className='mt-1 block w-full border rounded py-1 px-2'
                      value={lectureDetails.lectureTitle}
                      onChange={(e)=>setLectureDetails({...lectureDetails, 
                        lectureTitle:e.target.value
                      })}
                      />
                    </div>
                    <div className='mb-2'>
                      <p>Duration (mins)</p>
                      <input
                      type='number'
                      className='mt-1 block w-full border rounded py-1 px-2'
                      value={lectureDetails.lectureDuration}
                      onChange={(e)=>setLectureDetails({...lectureDetails, 
                        lectureDuration:e.target.value
                      })}
                      />
                    </div>
                    <div className='mb-2'>
                      <p>Lecture URL</p>
                      <input
                      type='text'
                      className='mt-1 block w-full border rounded py-1 px-2'
                      value={lectureDetails.lectureUrl}
                      onChange={(e)=>setLectureDetails({...lectureDetails, 
                        lectureUrl:e.target.value
                      })}
                      />
                    </div>
                    <div className='mb-2'>
                      <p>Is Preview Free?</p>
                      <input
                      type='checkbox'
                      className='mt-1 scale-125'
                      value={lectureDetails.isPreviewFree}
                      onChange={(e)=>setLectureDetails({...lectureDetails,
                        isPreviewFree:e.target.checked
                      })}
                      />
                    </div>
                    <button className='w-full bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-600/80' type='button'
                    onClick={addLecture}>Add</button> 
                    
                    <img onClick={()=>setShowPopup(false)} src={assets.cross_icon} alt="crossIcon"
                    className='absolute top-4 right-4 w-4 cursor-pointer' />
                  </div>
                </div>
              )
            }
          </div>
          <button type='submit' className='bg-black text-white w-max py-2.5 px-8 rounded my-4' >
            ADD
          </button>
        </form>
    </div>
  )
}

export default Addcourse