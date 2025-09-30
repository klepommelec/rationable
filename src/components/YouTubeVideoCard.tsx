
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { IYouTubeVideo } from '@/types/decision';
import { handleExternalLinkClick } from '@/utils/navigation';

interface YouTubeVideoCardProps {
  video: IYouTubeVideo;
}

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ video }) => {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col"
      onClick={(e) => handleExternalLinkClick(e, video.url)}
    >
      <div className="aspect-video relative overflow-hidden flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
      </div>
      
      <div className="p-4 md:p-4 flex flex-col">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-5">
          {video.title}
        </h4>
        
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span className="truncate flex-1 mr-2">{video.channelTitle}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span>{video.viewCount}</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </a>
  );
};

export default YouTubeVideoCard;
