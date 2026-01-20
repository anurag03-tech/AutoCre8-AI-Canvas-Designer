// // // // // // // // // // app/src/hooks/useFabricCanvas.ts
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as fabric from "fabric";
import { useCanvas } from "@/contexts/CanvasContext";
import { imagekitTransformations } from "@/lib/imagekit";
import { fa } from "zod/v4/locales";

export const useFabricCanvas = ({ canvasId, canvasData }: any) => {
  const { setSelectedObject, setCanvasActions } = useCanvas();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const originalCanvasDataRef = useRef<any>(null);
  const [scale, setScale] = useState(1);

  // CALCULATE SCALE TO FIT CONTAINER

  const calculateScale = useCallback(() => {
    if (!containerRef.current || !fabricCanvasRef.current) return;

    const container = containerRef.current;
    const canvas = fabricCanvasRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const canvasWidth = canvas.width || 1280;
    const canvasHeight = canvas.height || 720;

    const scaleX = (containerWidth * 0.9) / canvasWidth;
    const scaleY = (containerHeight * 0.9) / canvasHeight;

    const newScale = Math.min(scaleX, scaleY, 1);

    setScale(newScale);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", calculateScale);
    return () => {
      window.removeEventListener("resize", calculateScale);
    };
  }, [calculateScale]);

  const loadCanvasJSON = useCallback(
    async (data: any) => {
      if (!fabricCanvasRef.current || !data) return;
      const c = fabricCanvasRef.current;

      const jsonToLoad = data.canvasData || data;
      originalCanvasDataRef.current = jsonToLoad;

      // 1. SET DYNAMIC DIMENSIONS
      const width = jsonToLoad.width || 1080;
      const height = jsonToLoad.height || 1080;
      c.setDimensions({ width, height });

      // 2. CLEAR CANVAS
      c.clear();

      // 3. SET BACKGROUND (Color or Gradient Instance)
      if (jsonToLoad.background) {
        if (typeof jsonToLoad.background === "string") {
          c.backgroundColor = jsonToLoad.background;
        } else if (
          jsonToLoad.background.type ||
          jsonToLoad.background.colorStops
        ) {
          try {
            c.backgroundColor = new fabric.Gradient(jsonToLoad.background);
          } catch (e) {
            console.warn("Background gradient error", e);
            c.backgroundColor = "#ffffff";
          }
        }
      }

      // 4. SAFELY LOAD OBJECTS
      const objects = jsonToLoad.objects || [];

      const enlivenPromises = objects.map(async (obj: any) => {
        try {
          // --- CASE 1: IMAGES (Manual scaling & relative clipPath fix) ---
          if (obj.type === "image" || obj.type === "FabricImage") {
            return new Promise(async (resolve) => {
              const imgElement = new Image();
              imgElement.crossOrigin = "anonymous";
              imgElement.src = obj.src;

              imgElement.onload = async () => {
                // ROOT FIX: Destructure to remove raw JSON from constructor
                const { clipPath, shadow, type, ...safeProps } = obj;

                const realW = imgElement.naturalWidth;
                const realH = imgElement.naturalHeight;

                // Calculate correct scale based on source file vs JSON intent
                const scaleX = obj.width / realW;
                const scaleY = obj.height / realH;

                const fabricImg = new fabric.FabricImage(imgElement, {
                  ...safeProps,
                  width: realW,
                  height: realH,
                  scaleX: scaleX,
                  scaleY: scaleY,
                });

                // ✅ FIX: Relative Clipping (Moves with the image)
                if (clipPath) {
                  const enlivenedClipArr = await fabric.util.enlivenObjects([
                    clipPath,
                  ]);
                  if (enlivenedClipArr && enlivenedClipArr[0]) {
                    const liveClip: any = enlivenedClipArr[0];

                    liveClip.set({
                      absolutePositioned: false, // Fix: Don't lock to canvas coordinates
                      left: 0, // Fix: Center relative to the image
                      top: 0, // Fix: Center relative to the image
                      originX: "center",
                      originY: "center",
                    });

                    fabricImg.set("clipPath", liveClip);
                  }
                }

                // ROOT FIX: Explicitly enliven Shadow
                if (shadow) {
                  fabricImg.set("shadow", new fabric.Shadow(shadow));
                }

                resolve(fabricImg);
              };

              imgElement.onerror = () => {
                console.warn(`⚠️ Failed to load image: ${obj.src}`);
                resolve(null);
              };
            });
          }

          // --- CASE 2: TEXT & SHAPES (Standard enlivening + gradient fix) ---
          const enlivenedResults = await fabric.util.enlivenObjects([obj]);
          const fabricObj: any = enlivenedResults[0];

          if (fabricObj && obj.fill && typeof obj.fill === "object") {
            fabricObj.set("fill", new fabric.Gradient(obj.fill));
          }

          return fabricObj;
        } catch (error) {
          console.warn(`⚠️ Skipping broken object: ${obj.type}`, error);
          return null;
        }
      });

      // 5. RENDER PHASE
      const results = await Promise.all(enlivenPromises);

      results.forEach((obj) => {
        if (obj) {
          c.add(obj);
        }
      });

      c.requestRenderAll();

      console.log(
        `✅ Canvas loaded: ${c.getObjects().length} valid objects (${
          objects.length - c.getObjects().length
        } skipped)`
      );

      // Recalculate container scale after layout is ready
      setTimeout(() => calculateScale(), 150);
    },
    [calculateScale]
  );
  // ---------------------------------------------------------
  // SAVE CANVAS
  // ---------------------------------------------------------
  const saveCanvas = useCallback(async () => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;

    try {
      const json = c.toJSON();

      // Handle Thumbnail Generation Safely
      let thumbnailDataUrl = "";
      try {
        thumbnailDataUrl = c.toDataURL({
          format: "png",
          quality: 0.8,
          multiplier: 0.5,
        });
      } catch (err) {
        console.warn("⚠️ Canvas tainted, skipping thumbnail generation.");
        thumbnailDataUrl = "";
      }

      const payload = {
        canvasData: {
          version: "6.0.2",
          ...json,
          width: c.width,
          height: c.height,
        },
        thumbnail: thumbnailDataUrl,
      };

      console.log("💾 Saving payload...", payload);

      const response = await fetch(`/api/canvas/${canvasId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Save failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Save successful:", result);
    } catch (error) {
      console.error("❌ Save error:", error);
      alert(`Save failed: ${error}`);
    }
  }, [canvasId]);

  // ---------------------------------------------------------
  // ACTIONS (Shapes, Text, etc.)
  // ---------------------------------------------------------
  const addShape = useCallback((config: any) => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;
    const { type, points, path, ...props } = config;
    let shape: any = null;

    switch (type) {
      case "rect":
        shape = new fabric.Rect(props);
        break;
      case "circle":
        shape = new fabric.Circle(props);
        break;
      case "triangle":
        shape = new fabric.Triangle(props);
        break;
      case "ellipse":
        shape = new fabric.Ellipse(props);
        break;
      case "line":
        shape = new fabric.Line(points || [0, 0, 100, 100], props);
        break;
      case "polygon":
        shape = new fabric.Polygon(points || [], props);
        break;
      case "path":
        shape = new fabric.Path(path || "", props);
        break;
    }

    if (shape) {
      c.add(shape);
      c.setActiveObject(shape);
      c.renderAll();
    }
  }, []);

  const addText = useCallback((fontSize = 32, fontFamily = "Arial") => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;
    const text = new fabric.Textbox("Double click to edit", {
      left: 100,
      top: 100,
      fontSize,
      fontFamily,
      width: 300,
    });
    c.add(text);
    c.setActiveObject(text);
    c.renderAll();
  }, []);

  const addStyledText = useCallback((config: any) => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;
    const { text, shadow, gradient, ...props } = config;

    const textObj = new fabric.IText(text || "Text", {
      ...props,
      left: props.left || 100,
      top: props.top || 100,
    });

    //  Convert gradient config to Fabric.js Gradient object
    if (gradient) {
      const fabricGradient = new fabric.Gradient({
        type: gradient.type || "linear",
        coords: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: textObj.height || 100,
        },
        colorStops: gradient.colors.map((color: string, index: number) => ({
          offset: index / (gradient.colors.length - 1),
          color: color,
        })),
      });
      textObj.set("fill", fabricGradient);
    }

    // Apply shadow if exists
    if (shadow) {
      textObj.shadow = new fabric.Shadow(shadow);
    }

    c.add(textObj);
    c.setActiveObject(textObj);
    c.renderAll();
  }, []);

  const addImage = useCallback((url: string) => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;

    fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then(
      (img) => {
        if (!img) return;
        if (img.width && img.width > 400) {
          img.scaleToWidth(400);
        }
        c.add(img);
        c.centerObject(img);
        c.setActiveObject(img);
        c.renderAll();
      }
    );
  }, []);

  const applyImageTransformation = useCallback(
    (transformation: string) => {
      if (!fabricCanvasRef.current) return;
      const c = fabricCanvasRef.current;
      const activeObject: any = c.getActiveObject();

      if (!activeObject || activeObject.type !== "image") return;

      const currentSrc =
        activeObject._element?.currentSrc || activeObject._element?.src;
      if (!currentSrc) return;

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

      fabric.FabricImage.fromURL(transformedUrl, {
        crossOrigin: "anonymous",
      }).then((newImg) => {
        if (!newImg) return;
        newImg.set({
          left: activeObject.left,
          top: activeObject.top,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          angle: activeObject.angle,
          flipX: activeObject.flipX,
          flipY: activeObject.flipY,
        });
        c.remove(activeObject);
        c.add(newImg);
        c.setActiveObject(newImg);
        c.renderAll();
        setSelectedObject(newImg);
      });
    },
    [setSelectedObject]
  );

  const changeBackground = useCallback((value: any) => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;

    if (typeof value === "string") {
      c.backgroundColor = value;
    } else if (value && (value.type || value.colorStops)) {
      const gradient = new fabric.Gradient(value);
      c.backgroundColor = gradient;
    }

    c.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;
    const activeObjects = c.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => c.remove(obj));
      c.discardActiveObject();
      c.renderAll();
      setSelectedObject(null);
    }
  }, [setSelectedObject]);

  const updateSelectedObject = useCallback(
    (props: any) => {
      if (!fabricCanvasRef.current) return;
      const c = fabricCanvasRef.current;
      const active = c.getActiveObject();
      if (active) {
        active.set(props);
        if (active.type === "textbox" || active.type === "i-text") {
          active.setCoords();
        }
        c.renderAll();
        setSelectedObject(active);
      }
    },
    [setSelectedObject]
  );

  const duplicateSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;
    const active = c.getActiveObject();
    if (!active) return;

    active.clone().then((cloned: any) => {
      c.discardActiveObject();
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        evented: true,
      });

      if (cloned.type === "activeSelection") {
        cloned.canvas = c;
        cloned.forEachObject((o: any) => c.add(o));
        cloned.setCoords();
      } else {
        c.add(cloned);
      }

      c.setActiveObject(cloned);
      c.requestRenderAll();
    });
  }, []);

  const bringForward = useCallback(() => {
    const c = fabricCanvasRef.current;
    const a = c?.getActiveObject();
    if (c && a) {
      c.bringObjectForward(a);
      c.renderAll();
    }
  }, []);

  const sendBackward = useCallback(() => {
    const c = fabricCanvasRef.current;
    const a = c?.getActiveObject();
    if (c && a) {
      c.sendObjectBackwards(a);
      c.renderAll();
    }
  }, []);

  const bringToFront = useCallback(() => {
    const c = fabricCanvasRef.current;
    const a = c?.getActiveObject();
    if (c && a) {
      c.bringObjectToFront(a);
      c.renderAll();
    }
  }, []);

  const sendToBack = useCallback(() => {
    const c = fabricCanvasRef.current;
    const a = c?.getActiveObject();
    if (c && a) {
      c.sendObjectToBack(a);
      c.renderAll();
    }
  }, []);

  const getCanvasJSON = useCallback(() => {
    if (!fabricCanvasRef.current) return null;
    try {
      const json = fabricCanvasRef.current.toJSON();
      return {
        ...json,
        width: fabricCanvasRef.current.width,
        height: fabricCanvasRef.current.height,
      };
    } catch (e) {
      console.error("Error exporting JSON:", e);
      return null;
    }
  }, []);

  // INIT

  useEffect(() => {
    if (!canvasRef.current || !canvasData || fabricCanvasRef.current) return;

    console.log("🎨 Initializing Fabric v6...");

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      allowTouchScrolling: false,
    });

    fabricCanvasRef.current = fabricCanvas;

    if (typeof window !== "undefined") {
      (window as any).__fabricCanvas = fabricCanvas;
    }

    fabricCanvas.on("selection:created", (e: any) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:updated", (e: any) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    fabricCanvas.on("object:modified", (e: any) => {
      setSelectedObject(e.target || null);
    });

    loadCanvasJSON(canvasData);

    return () => {
      fabricCanvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [canvasData, loadCanvasJSON, setSelectedObject]);

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
      getCanvasJSON,
      loadCanvasJSON,
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
    getCanvasJSON,
    loadCanvasJSON,
  ]);

  return { canvasRef, fabricCanvasRef, containerRef, scale };
};
