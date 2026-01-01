"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Canvas,
  Rect,
  Circle,
  Triangle,
  Line,
  IText,
  Ellipse,
  Polygon,
  Path,
  FabricObject,
  FabricImage,
} from "fabric";
import { imagekitTransformations } from "@/lib/imagekit";
import { useCanvas } from "@/contexts/CanvasContext";

interface UseFabricCanvasProps {
  canvasId: string;
  canvasData: {
    width: number;
    height: number;
    background?: string;
    objects?: any[];
  };
}

export const useFabricCanvas = ({
  canvasId,
  canvasData,
}: UseFabricCanvasProps) => {
  const { canvas, setSelectedObject, setCanvasActions } = useCanvas();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  const [scale, setScale] = useState(1);

  // Initialize Fabric canvas once
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !canvasData) return;
    if (fabricCanvasRef.current) return;

    const container = containerRef.current;
    const { width, height, background } = canvasData;

    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;

    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const newScale = Math.min(scaleX, scaleY, 1);

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: width * newScale,
      height: height * newScale,
      backgroundColor: background || "#ffffff",
    });

    fabricCanvas.setZoom(newScale);
    fabricCanvasRef.current = fabricCanvas;
    setScale(newScale);

    if (typeof window !== "undefined") {
      (window as any).__fabricCanvas = fabricCanvas;
    }

    console.log("Loaded canvasData from DB:", canvasData);

    if (canvasData && canvasData.objects) {
      fabricCanvas.loadFromJSON(canvasData, () => {
        fabricCanvas.requestRenderAll();
        console.log("Fabric objects after load:", fabricCanvas.getObjects());
      });
    } else {
      fabricCanvas.renderAll();
    }

    fabricCanvas.on("selection:created", (e) => {
      if (e.selected?.length === 1) setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on("selection:updated", (e) => {
      if (e.selected?.length === 1) setSelectedObject(e.selected[0]);
    });

    fabricCanvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [canvasData, setSelectedObject]);

  // ✅ All actions wrapped in useCallback
  const addShape = useCallback((config: any) => {
    if (!fabricCanvasRef.current) return;

    const { type, points, path, ...props } = config;
    let shape: FabricObject | null = null;

    try {
      switch (type) {
        case "rect":
          shape = new Rect(props);
          break;
        case "circle":
          shape = new Circle(props);
          break;
        case "ellipse":
          shape = new Ellipse(props);
          break;
        case "triangle":
          shape = new Triangle(props);
          break;
        case "line":
          shape = new Line(points || [50, 50, 200, 200], props);
          break;
        case "polygon":
          shape = new Polygon(points || [], props);
          break;
        case "path":
          shape = new Path(path || "", props);
          break;
        default:
          console.warn(`Unknown shape type: ${type}`);
          return;
      }

      if (shape) {
        fabricCanvasRef.current.add(shape);
        fabricCanvasRef.current.setActiveObject(shape);
        fabricCanvasRef.current.renderAll();
      }
    } catch (error) {
      console.error("Error adding shape:", error);
    }
  }, []);

  const addText = useCallback((fontSize = 32, fontFamily = "Arial") => {
    if (!fabricCanvasRef.current) return;
    const text = new IText("Double click to edit", {
      left: 100,
      top: 100,
      fontSize,
      fill: "#1f2937",
      fontFamily,
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  }, []);

  const addStyledText = useCallback((styleConfig: any) => {
    if (!fabricCanvasRef.current) return;

    const { text, gradient, shadow, ...props } = styleConfig;

    const textObj = new IText(text || "STYLED TEXT", {
      left: 100,
      top: 100,
      ...props,
    });

    if (gradient) {
      const fabricGradient = new (window as any).fabric.Gradient({
        type: gradient.type || "linear",
        gradientUnits: "pixels",
        coords: {
          x1: 0,
          y1: 0,
          x2: gradient.type === "radial" ? textObj.width || 200 : 0,
          y2: textObj.height || 100,
        },
        colorStops: gradient.colors.map((color: string, index: number) => ({
          offset: index / (gradient.colors.length - 1),
          color,
        })),
      });
      textObj.set("fill", fabricGradient);
    }

    if (shadow) {
      textObj.set("shadow", shadow);
    }

    fabricCanvasRef.current.add(textObj);
    fabricCanvasRef.current.setActiveObject(textObj);
    fabricCanvasRef.current.renderAll();
  }, []);

  const addImage = useCallback((imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    })
      .then((img) => {
        if (!img || !fabricCanvasRef.current) return;

        const maxWidth = 400;
        const maxHeight = 400;

        if (img.width && img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }
        if (img.height && img.height > maxHeight) {
          img.scaleToHeight(maxHeight);
        }

        img.set({
          left: 100,
          top: 100,
        });

        fabricCanvasRef.current!.add(img);
        fabricCanvasRef.current!.setActiveObject(img);
        fabricCanvasRef.current!.renderAll();
      })
      .catch((error) => {
        console.error("Error loading image:", error);
        alert(
          "Failed to load image. Please check the URL or try another image."
        );
      });
  }, []);

  const applyImageTransformation = useCallback(
    (transformation: string) => {
      if (!fabricCanvasRef.current) return;

      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (!activeObject || activeObject.type !== "image") {
        alert("Please select an image first");
        return;
      }

      const currentSrc =
        (activeObject as any).getSrc?.() ||
        (activeObject as any)._originalElement?.src ||
        "";

      if (!currentSrc) {
        alert("Could not get image source");
        return;
      }

      let transformedUrl = "";

      switch (transformation) {
        case "removeBg":
          transformedUrl = imagekitTransformations.removeBg(currentSrc);
          break;
        case "grayscale":
          transformedUrl = imagekitTransformations.grayscale(currentSrc);
          break;
        case "blur":
          transformedUrl = imagekitTransformations.blur(currentSrc, 10);
          break;
        case "sharpen":
          transformedUrl = imagekitTransformations.sharpen(currentSrc, 5);
          break;
        case "autoEnhance":
          transformedUrl = imagekitTransformations.autoEnhance(currentSrc);
          break;
        default:
          return;
      }

      FabricImage.fromURL(transformedUrl, {
        crossOrigin: "anonymous",
      })
        .then((newImg) => {
          if (!fabricCanvasRef.current) return;

          newImg.set({
            left: activeObject.left,
            top: activeObject.top,
            scaleX: activeObject.scaleX,
            scaleY: activeObject.scaleY,
            angle: activeObject.angle,
          });

          fabricCanvasRef.current.remove(activeObject);
          fabricCanvasRef.current.add(newImg);
          fabricCanvasRef.current.setActiveObject(newImg);
          fabricCanvasRef.current.renderAll();
          setSelectedObject(newImg);
        })
        .catch((error) => {
          console.error("Error applying transformation:", error);
          alert(
            "Failed to apply transformation. Make sure the image is uploaded to ImageKit."
          );
        });
    },
    [setSelectedObject]
  );

  const changeBackground = useCallback((value: string) => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    c.backgroundColor = value === "transparent" ? "transparent" : value;
    c.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => fabricCanvasRef.current?.remove(obj));
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const updateSelectedObject = useCallback(
    (props: any) => {
      if (!fabricCanvasRef.current) return;
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (activeObject) {
        activeObject.set(props);
        fabricCanvasRef.current.renderAll();
        setSelectedObject(activeObject);
      }
    },
    [setSelectedObject]
  );

  const saveCanvas = useCallback(async () => {
    if (!fabricCanvasRef.current || !canvas) return;

    try {
      const json = fabricCanvasRef.current.toJSON();

      const payload = {
        canvasData: {
          ...json,
          width: canvas.canvasData.width,
          height: canvas.canvasData.height,
          background:
            fabricCanvasRef.current.backgroundColor ||
            canvas.canvasData.background,
        },
      };

      console.log("Saving canvasData:", payload.canvasData);

      const res = await fetch(`/api/canvas/${canvasId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Canvas saved!");
      } else {
        const err = await res.json().catch(() => null);
        console.error("Save error:", err);
        alert(`Failed to save: ${err?.error || res.statusText}`);
      }
    } catch (e) {
      console.error("Error saving canvas:", e);
      alert("Error saving");
    }
  }, [canvas, canvasId]);

  const bringForward = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.bringObjectForward(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const sendBackward = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.sendObjectBackwards(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const bringToFront = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.bringObjectToFront(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const sendToBack = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.sendObjectToBack(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const duplicateSelected = useCallback(async () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (!activeObject) return;

    try {
      const cloned = await activeObject.clone();
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      fabricCanvasRef.current.add(cloned);
      fabricCanvasRef.current.setActiveObject(cloned);
      fabricCanvasRef.current.renderAll();
    } catch (error) {
      console.error("Error duplicating object:", error);
    }
  }, []);

  // ✅ Correct dependency array - no more ESLint warnings
  useEffect(() => {
    setCanvasActions({
      addShape,
      addText,
      addStyledText,
      addImage,
      applyImageTransformation,
      changeBackground,
      deleteSelected,
      saveCanvas,
      updateSelectedObject,
      bringForward,
      sendBackward,
      bringToFront,
      sendToBack,
      duplicateSelected,
    });

    return () => setCanvasActions(null);
  }, [
    setCanvasActions,
    addShape,
    addText,
    addStyledText,
    addImage,
    applyImageTransformation,
    changeBackground,
    deleteSelected,
    saveCanvas,
    updateSelectedObject,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    duplicateSelected,
  ]);

  return {
    canvasRef,
    containerRef,
    fabricCanvasRef,
    scale,
  };
};
