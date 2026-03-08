import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";

interface TiltCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", ...props }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Rotate based on mouse position relative to center of card
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      {...props}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-2000 cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div 
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} 
        className="h-full w-full pointer-events-none absolute inset-0 rounded-[inherit]"
      >
        {/* Adds a dynamic specular reflection/glow based on tilt */}
        <motion.div
          animate={{ opacity: isHovered ? 0.8 : 0 }}
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)",
            x: useTransform(mouseXSpring, [-0.5, 0.5], ["-50%", "50%"]),
            y: useTransform(mouseYSpring, [-0.5, 0.5], ["-50%", "50%"])
          }}
          className="absolute inset-0 rounded-[inherit] -z-10"
        />
      </div>
      
      {/* Container for content pushed out in Z space */}
      <div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
         {children}
      </div>
    </motion.div>
  );
};

export default TiltCard;
