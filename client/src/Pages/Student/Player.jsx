import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../Components/Student/Footer';
import Rating from '../../Components/Student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../Components/Student/Loading';

const Player = () => {
  const {
    enrolledcourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState({ lectureCompleted: [] });
  const [initialRating, setInitialRating] = useState(0);

  /* ======================
     LOAD COURSE DATA
  ====================== */
  useEffect(() => {
    if (!enrolledcourses.length) return;

    const course = enrolledcourses.find(c => c._id === courseId);
    if (!course) return;

    setCourseData(course);

    const rating = course.courseRatings.find(r => r.userId === userData?._id);
    if (rating) setInitialRating(rating.rating);
  }, [enrolledcourses, courseId, userData]);

  /* ======================
     TOGGLE CHAPTER
  ====================== */
  const toggleSection = (index) => {
    setOpenSection(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /* ======================
     GET COURSE PROGRESS
  ====================== */
  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/get-course-progress`,
        {
          params: { courseId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setProgressData(data.progressData || { lectureCompleted: [] });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getCourseProgress();
  }, [courseId]);

  /* ======================
     MARK LECTURE COMPLETE
  ====================== */
  const markLectureAsCompleted = async (lectureId) => {
    if (!lectureId) return;

    try {
      // Optimistic UI update
      setProgressData(prev => ({
        lectureCompleted: Array.from(
          new Set([...(prev.lectureCompleted || []), lectureId])
        ),
      }));

      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        toast.error(data.message);
        getCourseProgress(); // rollback-safe
      }
    } catch (error) {
      toast.error(error.message);
      getCourseProgress();
    }
  };

  /* ======================
     HANDLE RATING
  ====================== */
  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!courseData) return <Loading />;

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">

        {/* LEFT COLUMN */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div key={index} className="border border-gray-300 bg-white mb-2 rounded">

                {/* Chapter Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
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
                    <p className="font-medium">{chapter.chapterTitle}</p>
                  </div>
                  <p className="text-sm">
                    {chapter.chapterContent.length} Lectures –{' '}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                {/* Lectures */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSection[index] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <ul className="pl-4 md:pl-10 pr-4 py-2 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={lecture.lectureId} className="flex items-start gap-2 py-1">
                        <img
                          src={
                            progressData.lectureCompleted.includes(lecture.lectureId)
                              ? assets.blue_tick_icon
                              : assets.play_icon
                          }
                          alt="status"
                          className="w-4 h-4 mt-1"
                        />

                        <div className="flex justify-between w-full text-sm">
                          <p>{lecture.lectureTitle}</p>

                          <div className="flex gap-3">
                            <p
                              className="text-blue-500 cursor-pointer"
                              onClick={() =>
                                setPlayerData({
                                  lectureId: lecture.lectureId,
                                  lectureTitle: lecture.lectureTitle,
                                  lectureUrl: lecture.lectureUrl,
                                  chapter: index + 1,
                                  lecture: i + 1,
                                })
                              }
                            >
                              Watch
                            </p>

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

          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:mt-10">
          {playerData ? (
            <>
              <YouTube
                videoId={playerData.lectureUrl.split('/').pop()}
                iframeClassName="w-full aspect-video"
              />
              <div className="flex justify-between items-center mt-2">
                <p>
                  {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                </p>
                <button
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className="text-blue-600"
                >
                  {progressData.lectureCompleted.includes(playerData.lectureId)
                    ? 'Completed'
                    : 'Mark Complete'}
                </button>
              </div>
            </>
          ) : (
            <img src={courseData.courseThumbnail} alt="Course thumbnail" />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Player;
