import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../Components/Student/Footer';
import Rating from '../../Components/Student/Rating';

const Player = () => {
  const { enrolledcourses, calculateChapterTime } = useContext(AppContext);
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);

  // 1️⃣ Fetch enrolled course
  useEffect(() => {
    const course = enrolledcourses.find(c => c._id === courseId);
    setCourseData(course);
  }, [enrolledcourses, courseId]);

  // 2️⃣ Auto-load first lecture
  useEffect(() => {
    if (!courseData) return;

    const firstLecture =
      courseData.courseContent?.[0]?.chapterContent?.[0];

    if (firstLecture?.lectureUrl) {
      setPlayerData({
        ...firstLecture,
        chapter: 1,
        lecture: 1,
      });
    }
  }, [courseData]);

  // 3️⃣ Toggle chapter
  const toggleSection = (index) => {
    setOpenSection(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">

        {/* LEFT COLUMN */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-5">
            {courseData?.courseContent.map((chapter, index) => (
              <div key={index} className="border border-gray-300 bg-white mb-2 rounded">

                {/* Chapter Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      alt="arrow"
                      className={`transition-transform ${
                        openSection[index] ? 'rotate-180' : ''
                      }`}
                    />
                    <p className="font-medium text-sm md:text-base">
                      {chapter.chapterTitle}
                    </p>
                  </div>

                  <p className="text-sm">
                    {chapter.chapterContent.length} Lectures – {calculateChapterTime(chapter)}
                  </p>
                </div>

                {/* Lectures */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSection[index] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <ul className="list-disc pl-4 md:pl-10 pr-4 py-2 border-t border-gray-300 text-gray-600">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={assets.play_icon}
                          alt="play"
                          className="w-4 h-4 mt-1"
                        />

                        <div className="flex justify-between w-full text-xs md:text-sm">
                          <p>{lecture.lectureTitle}</p>

                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                className="text-blue-500 cursor-pointer"
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture,
                                    chapter: index + 1,
                                    lecture: i + 1,
                                  })
                                }
                              >
                                Watch
                              </p>
                            )}

                            <p>
                              {humanizeDuration(
                                lecture.lectureDuration * 60 * 1000,
                                { units: ['h', 'm'] }
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this Course:</h1>
            <Rating initialRating={0}/>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <YouTube
                videoId={playerData.lectureUrl.split('/').pop()}
                iframeClassName="w-full aspect-video"
              />
              <div className="flex justify-between items-center mt-2">
                <p>
                  {playerData.chapter}.{playerData.lecture}{' '}
                  {playerData.lectureTitle}
                </p>
                <button className="text-blue-600">
                  Mark as Completed
                </button>
              </div>
            </div>
          ) : (
            <img src={courseData?.courseThumbnail} alt="Course thumbnail" />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Player;
