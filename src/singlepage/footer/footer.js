import React, { useMemo, useState, useEffect, useRef } from "react";
import "./footer.css";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { prepareWithSegments, walkLineRanges, layoutWithLines } from "@chenglou/pretext";
import { motion, useMotionValue, useSpring } from "framer-motion";

const RepellingChar = ({ char, xOffset, yOffset, mouseX, mouseY }) => {
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const springX = useSpring(dx, { stiffness: 300, damping: 20 });
  const springY = useSpring(dy, { stiffness: 300, damping: 20 });

  useEffect(() => {
    if (mouseX === null || mouseY === null) {
      dx.set(0);
      dy.set(0);
      return;
    }
    const distX = mouseX - xOffset;
    const distY = mouseY - yOffset;
    const distance = Math.sqrt(distX * distX + distY * distY);
    const maxDist = 100;
    
    if (distance < maxDist && distance > 0) {
      const force = (maxDist - distance) / distance;
      dx.set(-distX * force * 0.8);
      dy.set(-distY * force * 0.8);
    } else {
      dx.set(0);
      dy.set(0);
    }
  }, [mouseX, mouseY, xOffset, yOffset]);

  return (
    <motion.span style={{ x: springX, y: springY, display: "inline-block" }}>
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
};

const BalancedText = ({ text, font, maxWidth, lineHeight }) => {
  const [mousePos, setMousePos] = useState({ x: null, y: null });
  const containerRef = useRef(null);

  const { lines, width, height } = useMemo(() => {
    try {
      const prepared = prepareWithSegments(text, font);
      let bestWidth = 0;
      walkLineRanges(prepared, maxWidth, (line) => {
        if (line.width > bestWidth) bestWidth = line.width;
      });
      const layout = layoutWithLines(prepared, Math.ceil(bestWidth), lineHeight);
      return { lines: layout.lines, height: layout.height, width: Math.ceil(bestWidth) };
    } catch (e) {
      return { lines: [{ text }], height: lineHeight, width: "auto" };
    }
  }, [text, font, maxWidth, lineHeight]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: null, y: null });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width, height, position: "relative", cursor: "default" }}
    >
      {lines.map((l, i) => {
        const chars = l.text.split("");
        // Approximation of x offset for each char in a system font
        const estimateCharWidth = l.width / Math.max(chars.length, 1);
        return (
          <div key={i} style={{ position: "absolute", top: i * lineHeight, left: 0, whiteSpace: "nowrap" }}>
            {chars.map((c, j) => (
              <RepellingChar
                key={j}
                char={c}
                xOffset={j * estimateCharWidth + estimateCharWidth/2}
                yOffset={i * lineHeight + lineHeight/2}
                mouseX={mousePos.x}
                mouseY={mousePos.y}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

const Footer = () => {
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    const handleResize = () => setContainerWidth(Math.min(window.innerWidth - 40, 400));
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="Footer">
      <div className="left">
        <div className="review">Rating</div>
        <div className="star">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
        </div>
      </div>
      <div className="mid">
        <div className="genre">Genre</div>
        <div className="element">
          <BalancedText 
            text="Drama, Comedy, Sports, School" 
            font='16px system-ui, -apple-system, sans-serif'
            maxWidth={containerWidth / 3}
            lineHeight={24}
          />
        </div>
      </div>
      <div className="right">
        <div className="heading">Studio</div>
        <div className="element">Production I.G</div>
      </div>
    </div>
  );
};

export default Footer;
