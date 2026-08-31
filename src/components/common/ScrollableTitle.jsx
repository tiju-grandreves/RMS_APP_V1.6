import React, { useEffect, useRef, useState } from 'react';

const ScrollableTitle = ({ title, className = "" }) => {
  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (!titleRef.current) return;
      
      const originalWhiteSpace = titleRef.current.style.whiteSpace;
      const originalDisplay = titleRef.current.style.display;
      
      titleRef.current.style.whiteSpace = 'nowrap';
      titleRef.current.style.display = 'inline-block';
      
      const { scrollWidth, clientWidth } = titleRef.current.parentElement || titleRef.current;
      const overflowAmount = Math.max(scrollWidth - clientWidth, 0);
      
      titleRef.current.style.whiteSpace = originalWhiteSpace || '';
      titleRef.current.style.display = originalDisplay || '';
      
      setIsOverflowing(overflowAmount > 0);
      setScrollDistance(overflowAmount);
    };

    checkOverflow();
    
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (titleRef.current?.parentElement) {
      resizeObserver.observe(titleRef.current.parentElement);
    }
    
    window.addEventListener('resize', checkOverflow);
    
    const timeoutId = setTimeout(checkOverflow, 100);

    return () => {
      window.removeEventListener('resize', checkOverflow);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [title]);

  return (
    <div 
      className={`event-title-container ${isOverflowing ? 'is-overflowing' : ''}`}
      style={{
        '--event-title-scroll-distance': `${scrollDistance}px`,
        '--event-title-scroll-duration': `${Math.max(scrollDistance / 35, 4)}s`
      }}
    >
      <h3
        ref={titleRef}
        className={`event-title-text ${className}`}
      >
        {title}
      </h3>
    </div>
  );
};

export default ScrollableTitle;