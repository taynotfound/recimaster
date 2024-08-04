import React, { useState, useEffect } from 'react';

const TypewriterEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 20); // Adjust the speed of typing here

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return (
    <div className="text-white whitespace-pre-wrap">
      {displayedText}
    </div>
  );
};

export default TypewriterEffect;