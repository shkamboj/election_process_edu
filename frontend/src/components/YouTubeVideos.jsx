import { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import FALLBACK_VIDEOS from '../data/fallbackVideos';

/** Valid YouTube video IDs are exactly 11 chars: alphanumeric, hyphen, underscore. */
const VALID_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function VideoCard({ video, accent }) {
  const [playing, setPlaying] = useState(false);

  if (playing && VALID_VIDEO_ID.test(video.video_id)) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black aspect-video">
        <iframe
          title={video.title}
          src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="group w-full text-left rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2"
      style={{ '--tw-ring-color': accent }}
      aria-label={`Play: ${video.title}`}
    >
      <div className="relative aspect-video bg-gray-100">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 bg-white">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{video.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{video.channel}</p>
      </div>
    </button>
  );
}

function YouTubeVideos({ country }) {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | error | unavailable

  useEffect(() => {
    setVideos([]);
    setStatus('loading');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    fetch(`/youtube/${country.id}`, { signal: controller.signal })
      .then((r) => {
        if (r.status === 503) { setStatus('unavailable'); return null; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const fetched = data.videos || [];
        if (fetched.length) {
          setVideos(fetched);
          setStatus('ok');
        } else {
          setVideos(FALLBACK_VIDEOS[country.id] || FALLBACK_VIDEOS.default);
          setStatus('ok');
        }
      })
      .catch(() => {
        setVideos(FALLBACK_VIDEOS[country.id] || FALLBACK_VIDEOS.default);
        setStatus('ok');
      })
      .finally(() => clearTimeout(timeoutId));

    return () => { controller.abort(); clearTimeout(timeoutId); };
  }, [country.id]);

  if (status === 'unavailable') return null;

  return (
    <section aria-label={`${country.name} election videos`} className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-600 shrink-0" aria-hidden="true">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
        <h3 className="text-base font-semibold text-gray-800">
          Learn more - YouTube
        </h3>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}


      {status === 'ok' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.video_id} video={v} accent={country.accent} />
          ))}
        </div>
      )}
    </section>
  );
}

const videoShape = PropTypes.shape({
  video_id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
});

VideoCard.propTypes = {
  video: videoShape.isRequired,
  accent: PropTypes.string.isRequired,
};

YouTubeVideos.propTypes = {
  country: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
};

export default memo(YouTubeVideos);
