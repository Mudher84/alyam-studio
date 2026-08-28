import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

interface ImageParallaxProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  speed?: number;
}

export default function ImageParallax({ 
  src, 
  alt, 
  className,
  imageClassName,
  speed = 0.2
}: ImageParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform the Y position of the image based on scroll
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div 
      ref={ref} 
      className={cn("relative overflow-hidden w-full h-full", className)}
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[15%] -bottom-[15%] w-full h-[130%]"
      >
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-full object-cover", imageClassName)}
          loading="lazy"
        />
      </motion.div>
    </div>
  );
}
