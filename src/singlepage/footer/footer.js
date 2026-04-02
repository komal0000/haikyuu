import React, { useMemo, useState, useEffect } from "react";
import "./footer.css";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { prepareWithSegments, walkLineRanges, layoutWithLines } from "@chenglou/pretext";

const BalancedText = ({ text, font, maxWidth, lineHeight }) => {
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

  return (
    <div style={{ width, height, position: "relative" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", top: i * lineHeight, left: 0, whiteSpace: "pre" }}>
          {l.text}
        </div>
      ))}
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
