import React, { useEffect, useState } from 'react';

interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}

const BackgroundGradientAnimation: React.FC<BackgroundGradientAnimationProps> = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className = "",
  interactive = true,
  containerClassName = "",
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  return (
    <>
      {/* CSS Animations dans le head */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes moveVertical {
            0% { transform: translateY(-50%); }
            50% { transform: translateY(50%); }
            100% { transform: translateY(-50%); }
          }
          
          @keyframes moveInCircle {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes moveHorizontal {
            0% { transform: translateX(-50%) translateY(-10%); }
            50% { transform: translateX(50%) translateY(10%); }
            100% { transform: translateX(-50%) translateY(-10%); }
          }
          
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
            100% { transform: translateY(0px) rotate(360deg); }
          }
        `
      }} />
      
      <div className={`relative h-full w-full overflow-hidden ${containerClassName}`}>
        {/* Background de base */}
        <div
          className={`absolute inset-0 ${className}`}
          style={{
            background: `linear-gradient(to bottom, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
          }}
        />
        
        {/* Gradient orbs animés */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "600px",
            height: "600px",
            top: "20%",
            left: "10%",
            background: `radial-gradient(circle, rgba(${firstColor}, 0.6) 0%, rgba(${firstColor}, 0.2) 50%, transparent 100%)`,
            mixBlendMode: blendingValue as any,
            animation: "moveVertical 30s ease infinite",
          }}
        />
        
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "500px",
            height: "500px",
            top: "60%",
            right: "10%",
            background: `radial-gradient(circle, rgba(${secondColor}, 0.6) 0%, rgba(${secondColor}, 0.2) 50%, transparent 100%)`,
            mixBlendMode: blendingValue as any,
            animation: "moveInCircle 20s reverse infinite",
          }}
        />
        
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "700px",
            height: "700px",
            top: "10%",
            right: "20%",
            background: `radial-gradient(circle, rgba(${thirdColor}, 0.5) 0%, rgba(${thirdColor}, 0.15) 50%, transparent 100%)`,
            mixBlendMode: blendingValue as any,
            animation: "moveInCircle 40s linear infinite",
          }}
        />
        
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "400px",
            height: "400px",
            bottom: "20%",
            left: "20%",
            background: `radial-gradient(circle, rgba(${fourthColor}, 0.6) 0%, rgba(${fourthColor}, 0.2) 50%, transparent 100%)`,
            mixBlendMode: blendingValue as any,
            animation: "moveHorizontal 40s ease infinite",
          }}
        />
        
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: "550px",
            height: "550px",
            top: "40%",
            left: "50%",
            background: `radial-gradient(circle, rgba(${fifthColor}, 0.5) 0%, rgba(${fifthColor}, 0.15) 50%, transparent 100%)`,
            mixBlendMode: blendingValue as any,
            animation: "moveInCircle 20s ease infinite",
          }}
        />

        {/* Interactive pointer */}
        {interactive && (
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "300px",
              height: "300px",
              top: mousePosition.y - 150,
              left: mousePosition.x - 150,
              background: `radial-gradient(circle, rgba(${pointerColor}, 0.4) 0%, rgba(${pointerColor}, 0.1) 50%, transparent 100%)`,
              mixBlendMode: blendingValue as any,
              transition: "opacity 0.1s ease",
            }}
          />
        )}

        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                background: `rgba(${firstColor}, 0.6)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 20 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export default BackgroundGradientAnimation;