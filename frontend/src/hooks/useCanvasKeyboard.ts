import { useEffect } from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import { Rect, Circle, Triangle, FabricText, Line } from "fabric";

export const useCanvasKeyboard = () => {
  const { canvasActions, selectedObject } = useCanvas();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Delete / Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedObject) {
          canvasActions?.deleteSelected();
        }
      }

      // Copy: Ctrl/Cmd + C
      if (ctrlKey && e.key === "c") {
        e.preventDefault();
        if (selectedObject) {
          const fabricCanvas = (window as any).__fabricCanvas;
          if (fabricCanvas) {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
              (window as any).__clipboard = {
                type: activeObject.type,
                data: activeObject.toObject(),
                text: activeObject.text,
              };
            }
          }
        }
      }

      // Paste: Ctrl/Cmd + V
      if (ctrlKey && e.key === "v") {
        e.preventDefault();
        const clipboard = (window as any).__clipboard;
        const fabricCanvas = (window as any).__fabricCanvas;

        if (clipboard && fabricCanvas) {
          try {
            let cloned;
            const objectData = clipboard.data;

            if (clipboard.type === "rect") {
              cloned = new Rect(objectData);
            } else if (clipboard.type === "circle") {
              cloned = new Circle(objectData);
            } else if (clipboard.type === "triangle") {
              cloned = new Triangle(objectData);
            } else if (clipboard.type === "text") {
              cloned = new FabricText(clipboard.text || "", objectData);
            } else if (clipboard.type === "line") {
              cloned = new Line(
                [
                  objectData.x1 || 0,
                  objectData.y1 || 0,
                  objectData.x2 || 0,
                  objectData.y2 || 0,
                ],
                objectData
              );
            }

            if (cloned) {
              cloned.set({
                left: (objectData.left || 0) + 20,
                top: (objectData.top || 0) + 20,
              });

              fabricCanvas.add(cloned);
              fabricCanvas.setActiveObject(cloned);
              fabricCanvas.renderAll();

              (window as any).__clipboard = {
                type: cloned.type,
                data: cloned.toObject(),
                text: cloned.text,
              };
            }
          } catch (error) {
            console.error("Error pasting:", error);
          }
        }
      }

      // Duplicate: Ctrl/Cmd + D
      if (ctrlKey && e.key === "d") {
        e.preventDefault();
        if (selectedObject) {
          canvasActions?.duplicateSelected();
        }
      }

      // Save: Ctrl/Cmd + S
      if (ctrlKey && e.key === "s") {
        e.preventDefault();
        canvasActions?.saveCanvas();
      }

      // Bring Forward: Ctrl/Cmd + ]
      if (ctrlKey && e.key === "]") {
        e.preventDefault();
        if (selectedObject) {
          canvasActions?.bringForward();
        }
      }

      // Send Backward: Ctrl/Cmd + [
      if (ctrlKey && e.key === "[") {
        e.preventDefault();
        if (selectedObject) {
          canvasActions?.sendBackward();
        }
      }

      // Arrow keys for movement
      if (selectedObject && !ctrlKey) {
        const step = e.shiftKey ? 10 : 1;

        if (e.key === "ArrowUp") {
          e.preventDefault();
          canvasActions?.updateSelectedObject({
            top: (selectedObject.top || 0) - step,
          });
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          canvasActions?.updateSelectedObject({
            top: (selectedObject.top || 0) + step,
          });
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          canvasActions?.updateSelectedObject({
            left: (selectedObject.left || 0) - step,
          });
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          canvasActions?.updateSelectedObject({
            left: (selectedObject.left || 0) + step,
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasActions, selectedObject]);
};
