import React, { useMemo, useState, useEffect, useRef } from "react";
import "./footer.css";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { prepareWithSegments, walkLineRanges, layoutWithLines } from "@chenglou/pretext";
const CHAR_REPEL_RADIUS = 94;
const CHAR_REPEL_STRENGTH = 20;

function useElementWidth(ref, fallbackWidth) {
  const [width, setWidth] = useState(fallbackWidth);

  useEffect(() => {
    if (!ref.current) return undefined;

    const node = ref.current;
    const update = () => {
      const next = node.clientWidth;
      if (next > 0) setWidth(next);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function getRepelOffset(glyph, pointer) {
  if (!pointer.active) return { x: 0, y: 0 };

  const dx = glyph.cx - pointer.x;
  const dy = glyph.cy - pointer.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= CHAR_REPEL_RADIUS || distance === 0) return { x: 0, y: 0 };

  const intensity = ((CHAR_REPEL_RADIUS - distance) / CHAR_REPEL_RADIUS) ** 2;
  const push = intensity * CHAR_REPEL_STRENGTH;

  return {
    x: (dx / distance) * push,
    y: (dy / distance) * push,
  };
}

function InteractiveSpreadText({ text, font, lineHeight }) {
  const hostRef = useRef(null);
  const hostWidth = useElementWidth(hostRef, 280);
  const [pointer, setPointer] = useState({ active: false, x: 0, y: 0 });

  const { glyphs, renderWidth, renderHeight } = useMemo(() => {
    try {
      const prepared = prepareWithSegments(text, font);
      let tightWidth = 0;

      walkLineRanges(prepared, Math.max(hostWidth, 120), line => {
        if (line.width > tightWidth) tightWidth = line.width;
      });

      const wrappedWidth = Math.max(1, Math.ceil(tightWidth));
      const lineLayout = layoutWithLines(prepared, wrappedWidth, lineHeight);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        return {
          glyphs: [],
          renderWidth: wrappedWidth,
          renderHeight: lineHeight,
        };
      }

      context.font = font;
      const nextGlyphs = [];

      lineLayout.lines.forEach((line, lineIndex) => {
        let cursorX = 0;
        Array.from(line.text).forEach((char, charIndex) => {
          const width = context.measureText(char).width;
          const safeWidth = width > 0 ? width : context.measureText(" ").width;

          nextGlyphs.push({
            id: `${lineIndex}-${charIndex}`,
            char,
            left: cursorX,
            top: lineIndex * lineHeight,
            width: safeWidth,
            cx: cursorX + safeWidth / 2,
            cy: lineIndex * lineHeight + lineHeight / 2,
          });

          cursorX += safeWidth;
        });
      });

      return {
        glyphs: nextGlyphs,
        renderWidth: wrappedWidth,
        renderHeight: Math.max(lineHeight, lineLayout.height),
      };
    } catch (error) {
      return {
        glyphs: [
          {
            id: "fallback-0",
            char: text,
            left: 0,
            top: 0,
            width: hostWidth,
            cx: hostWidth / 2,
            cy: lineHeight / 2,
          },
        ],
        renderWidth: hostWidth,
        renderHeight: lineHeight,
      };
    }
  }, [font, hostWidth, lineHeight, text]);

  const onMouseMove = event => {
    if (!hostRef.current) return;
    const rect = hostRef.current.getBoundingClientRect();
    setPointer({
      active: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const onMouseLeave = () => {
    setPointer({ active: false, x: 0, y: 0 });
  };

  return (
    <div
      ref={hostRef}
      className="spreadText"
      style={{ minHeight: `${renderHeight}px` }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="spreadText__stage" style={{ width: `${renderWidth}px`, height: `${renderHeight}px` }}>
        {glyphs.map(glyph => {
          const offset = getRepelOffset(glyph, pointer);
          return (
            <span
              key={glyph.id}
              className="spreadText__glyph"
              style={{
                left: `${glyph.left}px`,
                top: `${glyph.top}px`,
                width: `${glyph.width}px`,
                height: `${lineHeight}px`,
                lineHeight: `${lineHeight}px`,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                transition: pointer.active
                  ? "transform 70ms linear"
                  : "transform 460ms cubic-bezier(0.2, 0.88, 0.25, 1)",
              }}
            >
              {glyph.char === " " ? "\u00A0" : glyph.char}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const Footer = () => {
  return (
    <div className="footerPanel">
      <div className="footerPanel__block">
        <div className="footerPanel__label">Rating</div>
        <div className="footerPanel__starRow">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
        </div>
      </div>
      <div className="footerPanel__block footerPanel__block--wide">
        <div className="footerPanel__label">Genre</div>
        <div className="footerPanel__value">
          <InteractiveSpreadText
            text="Drama, Comedy, Sports, School"
            font='600 18px "Trebuchet MS", "Segoe UI", Tahoma, sans-serif'
            lineHeight={26}
          />
        </div>
      </div>
      <div className="footerPanel__block">
        <div className="footerPanel__label">Studio</div>
        <div className="footerPanel__value">
          <InteractiveSpreadText
            text="Production I.G"
            font='600 18px "Trebuchet MS", "Segoe UI", Tahoma, sans-serif'
            lineHeight={26}
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
