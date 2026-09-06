'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface MarqueeTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  speed?: number; // pixels per second
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
}

export function MarqueeText({
  text,
  speed = 28, // readable speed
  className,
  as: Component = 'div',
  ...props
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollPhase, setScrollPhase] = useState<'start' | 'scrolling' | 'end'>('start');

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        const diff = textWidth - containerWidth;
        if (diff > 4) {
          setIsOverflowing(true);
          setOverflowDistance(diff);
        } else {
          setIsOverflowing(false);
          setOverflowDistance(0);
        }
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  // Autonomous, mobile-friendly marquee cycle:
  // 1. Pause at start (2.0s)
  // 2. Scroll to end (duration based on overflow distance)
  // 3. Pause at end (2.0s)
  // 4. Scroll back to start
  useEffect(() => {
    if (!isOverflowing || isHovered) return;

    const scrollDurationMs = Math.max(1800, (overflowDistance / speed) * 1000);
    const pauseMs = 2000;

    let timeoutId: NodeJS.Timeout;

    const cycle = () => {
      // Step 1: Wait at start, then scroll to end
      timeoutId = setTimeout(() => {
        setScrollPhase('scrolling');

        // Step 2: Once at end, pause at end
        timeoutId = setTimeout(() => {
          setScrollPhase('end');

          // Step 3: Wait at end, then return to start
          timeoutId = setTimeout(() => {
            setScrollPhase('start');
            // Repeat cycle
            cycle();
          }, pauseMs);
        }, scrollDurationMs);
      }, pauseMs);
    };

    cycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOverflowing, overflowDistance, speed, isHovered]);

  const scrollDurationSec = Math.max(1.8, overflowDistance / speed);
  const isAtEnd = scrollPhase === 'scrolling' || scrollPhase === 'end' || isHovered;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isOverflowing ? text : undefined}
      className={cn(
        'relative overflow-hidden whitespace-nowrap select-none max-w-full group cursor-default',
        className
      )}
      {...props}
    >
      <div
        className="inline-block whitespace-nowrap will-change-transform"
        style={{
          transform: isOverflowing && isAtEnd ? `translateX(-${overflowDistance}px)` : 'translateX(0px)',
          transition:
            isOverflowing && isAtEnd
              ? `transform ${scrollDurationSec}s ease-in-out`
              : 'transform 0.8s ease-in-out',
        }}
      >
        <span ref={textRef} className="inline-block whitespace-nowrap">
          {text}
        </span>
      </div>

      {/* Subtle fade gradient indicator on right edge when not fully at end */}
      {isOverflowing && scrollPhase !== 'end' && !isHovered && (
        <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-white dark:from-slate-900 pointer-events-none opacity-80" />
      )}

      {/* Subtle fade gradient indicator on left edge when scrolled away from start */}
      {isOverflowing && isAtEnd && (
        <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-white dark:from-slate-900 pointer-events-none opacity-80" />
      )}
    </div>
  );
}
