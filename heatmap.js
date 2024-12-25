import React, { useRef, useEffect } from "react";
import { Image } from "react-konva";

const defaultConfig = {
  defaultRenderer: "canvas2d",
  radius: 25,
  maxOpacity: 0.5,
  minOpacity: 0.05,
  blur: 0.95,
  gradient: {
    0.1: "rgb(0,0,255)",
    0.4: "rgb(0,255,0)",
    0.6: "rgb(255,255,0)",
    0.8: "rgb(255,128,0)",
    1.0: "rgb(255,0,0)",
  },
};

const createPointTemplate = (radius, blur) => {
  const tplCanvas = document.createElement("canvas");
  const tplCtx = tplCanvas.getContext("2d");
  const diameter = radius * 2;

  // Make the template canvas larger to account for blur overflow
  const blurOffset = radius * blur;
  tplCanvas.width = tplCanvas.height = diameter + blurOffset * 2;

  const center = tplCanvas.width / 2;

  // Create a more sophisticated gradient
  const gradient = tplCtx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    radius,
  );

  // Add multiple stops for smoother falloff
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.2, "rgba(0,0,0,0.9)");
  gradient.addColorStop(0.4, "rgba(0,0,0,0.8)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0.6)");
  gradient.addColorStop(0.8, "rgba(0,0,0,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  tplCtx.fillStyle = gradient;
  tplCtx.fillRect(0, 0, tplCanvas.width, tplCanvas.height);

  return tplCanvas;
};

const Canvas2dRenderer = {
  create: (width, height) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: true });
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { canvas, ctx };
  },

  drawPoints: (ctx, points, config, min, max) => {
    const template = createPointTemplate(config.radius, config.blur);
    const blurOffset = config.radius * config.blur;

    // Sort points by value to render highest values last
    const sortedPoints = [...points].sort((a, b) => a.value - b.value);

    sortedPoints.forEach((point) => {
      const alpha = Math.min((point.value - min) / (max - min), 1);
      // Use a cubic easing function for smoother alpha transitions
      const easedAlpha = alpha * alpha * (3 - 2 * alpha);
      ctx.globalAlpha = easedAlpha < 0.01 ? 0.01 : easedAlpha;

      ctx.drawImage(
        template,
        point.x - config.radius - blurOffset,
        point.y - config.radius - blurOffset,
      );
    });
  },

  colorize: (ctx, width, height, config) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const gradientCanvas = document.createElement("canvas");
    const gradientCtx = gradientCanvas.getContext("2d");
    gradientCanvas.width = 256;
    gradientCanvas.height = 1;

    const linearGradient = gradientCtx.createLinearGradient(0, 0, 256, 1);
    Object.entries(config.gradient).forEach(([stop, color]) => {
      linearGradient.addColorStop(parseFloat(stop), color);
    });

    gradientCtx.fillStyle = linearGradient;
    gradientCtx.fillRect(0, 0, 256, 1);

    const palette = gradientCtx.getImageData(0, 0, 256, 1).data;

    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i];
      if (alpha === 0) continue;

      // Apply a smoothing function to the alpha value
      const normalizedAlpha = alpha / 255;
      let finalAlpha = normalizedAlpha;

      if (normalizedAlpha > config.minOpacity) {
        finalAlpha = Math.min(
          config.maxOpacity,
          normalizedAlpha * (1 + config.blur),
        );
      }

      const offset = Math.floor(normalizedAlpha * 255) * 4;

      data[i - 3] = palette[offset];
      data[i - 2] = palette[offset + 1];
      data[i - 1] = palette[offset + 2];
      data[i] = Math.floor(finalAlpha * 255);
    }

    ctx.putImageData(imageData, 0, 0);
  },
};

const getRenderer = (type) => {
  switch (type) {
    case "canvas2d":
    default:
      return Canvas2dRenderer;
  }
};

const createHeatmapData = (points, width, height, config) => {
  const renderer = getRenderer(config.defaultRenderer);
  const { canvas, ctx } = renderer.create(width, height);

  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  points.forEach((point) => {
    min = Math.min(min, point.value);
    max = Math.max(max, point.value);
  });

  renderer.drawPoints(ctx, points, config, min, max);
  renderer.colorize(ctx, width, height, config);

  return canvas;
};

const KonvaHeatmap = ({
  width = 800,
  height = 600,
  data = [],
  config = {},
}) => {
  const imageRef = useRef(null);
  const mergedConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    if (!imageRef.current) return;

    const canvas = createHeatmapData(data, width, height, mergedConfig);
    const image = new window.Image();
    image.src = canvas.toDataURL();

    image.onload = () => {
      if (imageRef.current) {
        imageRef.current.image(image);
        imageRef.current.getLayer().batchDraw();
      }
    };
  }, [data, width, height, mergedConfig]);

  return <Image ref={imageRef} width={width} height={height} />;
};

export default KonvaHeatmap;
