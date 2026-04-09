import React, { ReactNode, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

interface BackgroundProviderProps {
  children: ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
  const { theme } = useTheme();

  // Preload background images for smooth transitions
  useEffect(() => {
    const lightImg = new Image();
    lightImg.src = '/light.png';
    const darkImg = new Image();
    darkImg.src = '/dark.png';
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(${theme === 'dark' ? '/dark.png' : '/light.png'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    position: 'relative' as const,
    transition: 'background-image 0.5s ease-in-out',
  };

  return (
    <div style={backgroundStyle}>
      {/* Overlay for better readability */}
      <div 
        className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-black/20' 
            : 'bg-custom-beige/30'
        }`}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 