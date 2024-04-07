'use client'

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [svgFiles, setSvgFiles] = useState([]);
  const [loadedSVGCount, setLoadedSVGCount] = useState(16); // Start with 16 SVGs
  const [hoverIndex, setHoverIndex] = useState(null); // Track hover state

  useEffect(() => {
    // Function to update the SVG files state
    const updateSvgFiles = (count) => {
      setSvgFiles(Array.from({ length: count }, (_, i) => `/avatar/${i}.svg`));
    };

    // Load more SVGs when reaching near the bottom of the page
    const loadMoreSVGs = () => {
      setLoadedSVGCount((prevCount) => {
        const newCount = Math.min(prevCount + 16, 1000); // Increase by 16, max out at 1000
        updateSvgFiles(newCount);
        return newCount;
      });
    };

    // Initial load of SVGs
    updateSvgFiles(loadedSVGCount);

    const handleScroll = () => {
      // Trigger loading more SVGs when the user scrolls near the bottom of the page
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMoreSVGs();
      }
    };

    // Set up the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadedSVGCount]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {svgFiles.map((file, index) => (
          <div
            key={index}
            className="flex justify-center items-center p-0 relative"
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <img
              src={file}
              alt={`Avatar ${index}`}
              className="object-fill m-0 p-0"
              loading="lazy"
            />
            {hoverIndex === index && (
              <div
                className="absolute  inset-0 bg-black bg-opacity-50 flex justify-center items-center text-white text-2xl"
              >
                Life time ID: {index}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
