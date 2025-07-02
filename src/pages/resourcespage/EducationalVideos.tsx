import { useState } from "react";
import { Play, X } from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import { Link } from "react-router-dom";
import YouTube from "react-youtube";
import { videos, Video } from "./videos";

const EducationalVideos = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
          Educational Videos
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Watch instructional videos on various topics in pediatric neurology,
          created specifically for healthcare professionals in East Africa.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {videos.slice(0, 3).map((video: Video) => (
          <div
            key={video.id}
            className="rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="relative w-full h-48">
              {playingVideoId === video.youtubeId ? (
                <>
                  <YouTube
                    videoId={video.youtubeId}
                    opts={{
                      height: "100%",
                      width: "100%",
                      playerVars: { autoplay: 1 },
                    }}
                    className="w-full h-full"
                  />
                  <button
                    onClick={() => setPlayingVideoId(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 text-white hover:bg-opacity-80 z-10"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={() => setPlayingVideoId(video.youtubeId)}
                      className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Play className="h-5 w-5 text-primary-700 ml-1" />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-primary-800">
                  {video.title}
                </h3>
                <span className="text-gray-500 text-sm">{video.duration}</span>
              </div>
              {video.category && (
                <span className="inline-block bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                  {video.category}
                </span>
              )}
              {video.description && (
                <p className="text-gray-600 text-sm mt-2">
                  {video.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/all-videos">
          <Button variant="primary">View All Videos</Button>
        </Link>
      </div>
    </Section>
  );
};

export default EducationalVideos;
