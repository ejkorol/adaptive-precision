import { useState, useEffect, useRef } from "react";
import { timeSlots } from "./data";
import { motion } from "framer-motion";
import { gsap } from "gsap";

const App = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [spanSize, setSpanSize] = useState<{ height: number; width: number }>({
    height: 0,
    width: 0,
  });
  const [snapped, setSnapped] = useState<boolean>(false);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });
  const [isMinimumHeight, setIsMinimumHeight] = useState<boolean>(false);

  const spanRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<HTMLDivElement[][]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const initialXRef = useRef<number | null>(null);
  const initialYRef = useRef<number | null>(null);

  const updateMousePosition = (e: MouseEvent) => {
    requestAnimationFrame(() => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    });
  };

  const isMouseOutOfBounds = () => {
    const hitBox = 20;

    for (let timeIdx = 0; timeIdx < slotRefs.current.length; timeIdx++) {
      const slotRow = slotRefs.current[timeIdx];
      for (let slotIdx = 0; slotIdx < slotRow.length; slotIdx++) {
        const slot = slotRow[slotIdx];
        const { x, y, width, height } = slot.getBoundingClientRect();
        if (
          mousePosition.x >= x - hitBox &&
          mousePosition.x <= x + width + hitBox &&
          mousePosition.y >= y - hitBox &&
          mousePosition.y <= y + height + hitBox
        ) {
          return false; // Inside bounds
        }
      }
    }
    setSnapped(false);
    setMouseDown(false);
    return true; // Out of bounds
  };

  useEffect(() => {
    // handle down
    if (selectorRef.current && mouseDown && snapped) {
      // buttery smooth this is -> migrated to ref from the state for the intialPos

      const heightDiff = Math.abs(mousePosition.y - (initialYRef.current || 0));
      const { left } = cursorRef.current!.getBoundingClientRect();

      gsap.to(selectorRef.current, {
        x: left, // Keep x position aligned with the cursor
        y:
          mousePosition.y < (initialYRef.current || 0)
            ? (initialYRef.current || 0) - heightDiff // Expand upwards if dragging upwards
            : initialYRef.current || 0, // Expand downwards if dragging downwards
        opacity: 1,
        backgroundColor: "#1E90FF",
        width: 200,
        height: heightDiff,
        borderRadius: "10px",
        ease: "power1",
        duration: 0.2,
      });

      setIsMinimumHeight(
        selectorRef.current.getBoundingClientRect().height > 18 ? true : false,
      );

      // handle release
    } else if (selectorRef.current && !mouseDown) {
      gsap.to(selectorRef.current, {
        x: mousePosition.x - 15,
        y: mousePosition.y - 15,
        opacity: 0,
        backgroundColor: "transparent",
        width: 100,
        height: 5,
        borderRadius: "5px",
        ease: "power1",
        duration: 0.2,
      });
    }
  }, [mouseDown, snapped, mousePosition]);

  const handleMouseDown = (e: MouseEvent) => {
    setMouseDown(true);
    const hitBox = 20;

    initialXRef.current = e.clientX;
    initialYRef.current = e.clientY;

    for (let timeIdx = 0; timeIdx < slotRefs.current.length; timeIdx++) {
      const slotRow = slotRefs.current[timeIdx];
      for (
        let slotIdx = 0;
        slotIdx < slotRefs.current[timeIdx].length;
        slotIdx++
      ) {
        const slot = slotRow[slotIdx];
        const { x, y, width, height } = slot.getBoundingClientRect();
        if (
          e.clientX >= x - hitBox &&
          e.clientX <= x + width + hitBox &&
          e.clientY >= y - hitBox &&
          e.clientY <= y + height + hitBox
        ) {
          const currentSlotTime = slot.getAttribute("data-time");
          setSelectedSlot((prev) => ({
            ...prev,
            start: currentSlotTime,
          }));
        }
      }
    }
  };

  const handleMouseUp = (_e: MouseEvent) => {
    setMouseDown(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    if (spanRef.current) {
      const { height, width } = spanRef.current.getBoundingClientRect();
      setSpanSize({ height, width });
    }

    return () => (
      window.removeEventListener("mousemove", updateMousePosition),
      window.removeEventListener("mousedown", handleMouseDown),
      window.removeEventListener("mouseup", handleMouseUp)
    );
  }, []);

  const handleHoverEffect = () => {
    const hitBox = 20;
    let isHovered = false;

    for (let timeIdx = 0; timeIdx < slotRefs.current.length; timeIdx++) {
      const slotRow = slotRefs.current[timeIdx];

      for (let slotIdx = 0; slotIdx < slotRow.length; slotIdx++) {
        const slot = slotRow[slotIdx];
        const { x, y, width, height } = slot.getBoundingClientRect();

        if (
          mousePosition.x >= x - hitBox &&
          mousePosition.x <= x + width + hitBox &&
          mousePosition.y >= y - hitBox &&
          mousePosition.y <= y + height + hitBox
        ) {
          isHovered = true;
          const currentSlotTime = slot.getAttribute("data-time");
          const snappedPosition = { x: x + 15, y: y + 15 };

          /**
           * like a typeguard to ensure the setting mouse position doesnt trigger infinite rerenders
           * */
          if (
            mousePosition.x !== snappedPosition.x ||
            mousePosition.y !== snappedPosition.y
          ) {
            setMousePosition(snappedPosition);
            setSnapped(true);
          }

          // handle the selected logic here
          if (selectedSlot.end !== currentSlotTime) {
            setSelectedSlot((prev) => ({
              ...prev,
              end: currentSlotTime,
            }));
          }

          gsap.to(cursorRef.current, {
            width: 200,
            height: 4,
            borderRadius: "2px",
            ease: "power1.out",
            duration: 0.3,
          });
          return; // Exit early if hovering
        }
      }
      if (isHovered) break;
    }

    // Check if mouse is out of bounds while dragging
    if (mouseDown && isMouseOutOfBounds()) {
      gsap.to(selectorRef.current, {
        opacity: 0,
        backgroundColor: "transparent",
        width: 100,
        height: 5,
        borderRadius: "5px",
        ease: "power1",
        duration: 0.2,
      });
    }

    // Reset cursor if not hovering
    if (!isHovered) {
      setSnapped(false);
      gsap.to(cursorRef.current, {
        width: 30,
        height: 30,
        borderRadius: "50%",
        ease: "power1.out",
        duration: 0.25,
      });
    }
  };

  useEffect(() => {
    handleHoverEffect();
  }, [mousePosition, handleHoverEffect]);

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        ref={cursorRef}
        animate={{
          x: mousePosition.x - 15,
          y: mousePosition.y - 15,
        }}
        transition={{ ease: "easeOut", duration: 0.1618 }}
        style={{
          position: "absolute",
          borderRadius: "50%",
          height: 30,
          width: 30,
          backgroundColor: "#333333",
          opacity: "80%",
          zIndex: 100,
          pointerEvents: "none",
        }}
      />

      {/* selector */}
      <div
        ref={selectorRef}
        className="flex flex-col gap-1 py-2 px-3"
        style={{
          opacity: 0,
          position: "absolute",
          zIndex: 101,
          cursor: "none",
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      >
        {snapped && mouseDown && isMinimumHeight && (
          <p className="text-white text-xs tracking-wider">
            {selectedSlot.start} - {selectedSlot.end}
          </p>
        )}
      </div>

      <main className="cursor-none bg-[#212121] flex items-center justify-center h-screen w-full select-none">
        {/* Graph */}
        <section>
          {timeSlots.map((time, timeIdx) => (
            <div
              className="relative flex flex-col items-center gap-6 mb-3"
              key={timeIdx}
            >
              {/* Text */}
              <span
                ref={spanRef}
                className="text-[#757575] font-light tracking-wider font-mono text-sm absolute left-0"
                style={{
                  left: `-${spanSize.width * 1.6}px`,
                  top: `-${spanSize.height / 2}px`,
                }}
              >
                {time.hour}PM
              </span>

              {/* Bars */}
              {time.slots.map((slot, slotIdx) => (
                <div
                  key={slotIdx}
                  ref={(el) => {
                    if (!slotRefs.current[timeIdx]) {
                      slotRefs.current[timeIdx] = [];
                    }
                    if (el) {
                      slotRefs.current[timeIdx][slotIdx] = el;
                    }
                  }}
                  data-time={slot.time}
                  style={{
                    height: 2,
                    backgroundColor:
                      slot.display === "visible" ? "#333333" : "transparent",
                    width: 200,
                    borderRadius: "1px",
                  }}
                />
              ))}
            </div>
          ))}
        </section>
      </main>
    </>
  );
};

export default App;
