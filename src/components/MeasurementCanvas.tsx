'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Line, Transformer, Text } from 'react-konva';
import Konva from 'konva';

export interface Measurement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  areaM2: number;
  points?: number[]; // Konva Line format: [x1,y1, x2,y2, ...] in px
}

export interface DetectedRoom {
  id: string;
  name: string;
  points: number[][]; // [[x1,y1], [x2,y2], ...] as % of image (0-100)
  areaMFromTable?: number;
}

export interface ImageTransform {
  imageScale: number;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
}

interface Props {
  imageUrl: string | null;
  measurements: Measurement[];
  onMeasurementsChange: (measurements: Measurement[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  tool: 'select' | 'measure';
  scale: number; // pixels per meter
  detectedRooms?: DetectedRoom[];
  hoveredId?: string | null;
  buildingOutline?: { x: number; y: number; width: number; height: number } | null;
  onImageTransform?: (transform: ImageTransform) => void;
}

/** Convert polygon points (% of image) to Konva flat array (px) */
function roomPointsToPx(
  points: number[][],
  imageX: number, imageY: number,
  iw: number, ih: number, is: number
): number[] {
  const flat: number[] = [];
  for (const [px, py] of points) {
    flat.push(imageX + (px / 100) * iw * is);
    flat.push(imageY + (py / 100) * ih * is);
  }
  return flat;
}

/** Centroid of a polygon from flat Konva points array */
function centroid(flatPoints: number[]): [number, number] {
  let cx = 0, cy = 0;
  const n = flatPoints.length / 2;
  for (let i = 0; i < flatPoints.length; i += 2) {
    cx += flatPoints[i];
    cy += flatPoints[i + 1];
  }
  return [cx / n, cy / n];
}

export default function MeasurementCanvas({
  imageUrl,
  measurements,
  onMeasurementsChange,
  selectedId,
  onSelect,
  tool,
  scale,
  detectedRooms = [],
  hoveredId,
  buildingOutline,
  onImageTransform,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRect, setNewRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Load image
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Resize stage to container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update transformer
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const tr = transformerRef.current;

    if (selectedId && tool === 'select') {
      const node = stage.findOne('#' + selectedId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, measurements, tool]);

  const calculateArea = useCallback((widthPx: number, heightPx: number) => {
    if (scale <= 0) return 0;
    const widthM = Math.abs(widthPx) / scale;
    const heightM = Math.abs(heightPx) / scale;
    return widthM * heightM;
  }, [scale]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== 'measure' || !imageUrl) return;

    const stage = e.target.getStage();
    if (!stage) return;

    if (e.target === stage || e.target.getClassName() === 'Image') {
      const pos = stage.getPointerPosition();
      if (!pos) return;

      setIsDrawing(true);
      setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      onSelect(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !newRect) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setNewRect({
      ...newRect,
      width: pos.x - newRect.x,
      height: pos.y - newRect.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newRect) return;

    setIsDrawing(false);

    if (Math.abs(newRect.width) < 10 || Math.abs(newRect.height) < 10) {
      setNewRect(null);
      return;
    }

    const x = newRect.width < 0 ? newRect.x + newRect.width : newRect.x;
    const y = newRect.height < 0 ? newRect.y + newRect.height : newRect.y;
    const width = Math.abs(newRect.width);
    const height = Math.abs(newRect.height);

    const newMeasurement: Measurement = {
      id: `m_${Date.now()}`,
      name: `Obszar ${measurements.length + 1}`,
      x,
      y,
      width,
      height,
      areaM2: calculateArea(width, height),
    };

    onMeasurementsChange([...measurements, newMeasurement]);
    onSelect(newMeasurement.id);
    setNewRect(null);
  };

  const handleTransformEnd = (id: string, node: Konva.Node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(10, node.width() * scaleX);
    const newHeight = Math.max(10, node.height() * scaleY);

    const updated = measurements.map(m => {
      if (m.id === id) {
        return {
          ...m,
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          areaM2: calculateArea(newWidth, newHeight),
        };
      }
      return m;
    });

    onMeasurementsChange(updated);
  };

  const handleDragEnd = (id: string, node: Konva.Node) => {
    const updated = measurements.map(m => {
      if (m.id === id) {
        return { ...m, x: node.x(), y: node.y() };
      }
      return m;
    });
    onMeasurementsChange(updated);
  };

  // Calculate image scale to fit
  let imageScale = 1;
  let imageX = 0;
  let imageY = 0;
  if (image) {
    const scaleX = stageSize.width / image.width;
    const scaleY = stageSize.height / image.height;
    imageScale = Math.min(scaleX, scaleY, 1);
    imageX = (stageSize.width - image.width * imageScale) / 2;
    imageY = (stageSize.height - image.height * imageScale) / 2;
  }

  // Report image transform to parent
  useEffect(() => {
    if (image && onImageTransform) {
      onImageTransform({ imageScale, imageX, imageY, imageWidth: image.width, imageHeight: image.height });
    }
  }, [image, imageScale, imageX, imageY, onImageTransform]);

  return (
    <div ref={containerRef} className="app-canvas-container">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Layer>
          {/* Background image */}
          {image && (
            <KonvaImage
              image={image}
              x={imageX}
              y={imageY}
              scaleX={imageScale}
              scaleY={imageScale}
            />
          )}

          {/* Building outline from AI */}
          {image && buildingOutline && (
            <Rect
              x={imageX + (buildingOutline.x / 100) * image.width * imageScale}
              y={imageY + (buildingOutline.y / 100) * image.height * imageScale}
              width={(buildingOutline.width / 100) * image.width * imageScale}
              height={(buildingOutline.height / 100) * image.height * imageScale}
              fill="rgba(251, 146, 60, 0.05)"
              stroke="#FB923C"
              strokeWidth={2}
              dash={[10, 6]}
              listening={false}
            />
          )}

          {/* Existing measurements */}
          {measurements.map((m) => {
            const isHovered = hoveredId === m.id;
            const isSelected = selectedId === m.id;

            // Polygon measurement (from AI)
            if (m.points && m.points.length >= 6) {
              return (
                <Line
                  key={m.id}
                  id={m.id}
                  points={m.points}
                  closed={true}
                  fill={
                    isSelected ? 'rgba(139, 92, 246, 0.3)'
                    : isHovered ? 'rgba(96, 165, 250, 0.35)'
                    : 'rgba(59, 130, 246, 0.2)'
                  }
                  stroke={
                    isSelected ? '#8B5CF6'
                    : isHovered ? '#60A5FA'
                    : '#3B82F6'
                  }
                  strokeWidth={isHovered ? 3 : 2}
                  draggable={tool === 'select'}
                  onClick={() => onSelect(m.id)}
                  onTap={() => onSelect(m.id)}
                  onDragEnd={(e) => handleDragEnd(m.id, e.target)}
                />
              );
            }

            // Rect measurement (manual drawing)
            return (
              <Rect
                key={m.id}
                id={m.id}
                x={m.x}
                y={m.y}
                width={m.width}
                height={m.height}
                fill={
                  isSelected ? 'rgba(139, 92, 246, 0.3)'
                  : isHovered ? 'rgba(96, 165, 250, 0.35)'
                  : 'rgba(59, 130, 246, 0.2)'
                }
                stroke={
                  isSelected ? '#8B5CF6'
                  : isHovered ? '#60A5FA'
                  : '#3B82F6'
                }
                strokeWidth={isHovered ? 3 : 2}
                draggable={tool === 'select'}
                onClick={() => onSelect(m.id)}
                onTap={() => onSelect(m.id)}
                onDragEnd={(e) => handleDragEnd(m.id, e.target)}
                onTransformEnd={(e) => handleTransformEnd(m.id, e.target)}
              />
            );
          })}

          {/* Labels */}
          {measurements.map((m) => {
            // Position label at centroid for polygon, or top-left for rect
            let lx = m.x;
            let ly = m.y - 20;
            if (m.points && m.points.length >= 6) {
              const [cx, cy] = centroid(m.points);
              lx = cx;
              ly = cy - 20;
            }
            return (
              <Text
                key={`label_${m.id}`}
                x={lx}
                y={ly}
                text={`${m.name}: ${m.areaM2.toFixed(2)} m²`}
                fontSize={12}
                fill="#fff"
                padding={4}
              />
            );
          })}

          {/* Currently drawing rect */}
          {newRect && (
            <Rect
              x={newRect.width < 0 ? newRect.x + newRect.width : newRect.x}
              y={newRect.height < 0 ? newRect.y + newRect.height : newRect.y}
              width={Math.abs(newRect.width)}
              height={Math.abs(newRect.height)}
              fill="rgba(139, 92, 246, 0.3)"
              stroke="#8B5CF6"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}

          {/* AI-detected rooms (pending approval) — polygons */}
          {image && detectedRooms.map((room) => {
            const flatPoints = roomPointsToPx(
              room.points, imageX, imageY,
              image.width, image.height, imageScale
            );
            const isHovered = hoveredId === room.id;
            return (
              <Line
                key={room.id}
                points={flatPoints}
                closed={true}
                fill={isHovered ? 'rgba(74, 222, 128, 0.3)' : 'rgba(34, 197, 94, 0.15)'}
                stroke={isHovered ? '#4ADE80' : '#22C55E'}
                strokeWidth={isHovered ? 3 : 2}
                dash={[6, 4]}
              />
            );
          })}
          {image && detectedRooms.map((room) => {
            const flatPoints = roomPointsToPx(
              room.points, imageX, imageY,
              image.width, image.height, imageScale
            );
            const [cx, cy] = centroid(flatPoints);
            const isHovered = hoveredId === room.id;
            return (
              <Text
                key={`ai_label_${room.id}`}
                x={cx - 30}
                y={cy - 10}
                text={room.name}
                fontSize={isHovered ? 14 : 12}
                fontStyle={isHovered ? 'bold' : 'normal'}
                fill={isHovered ? '#4ADE80' : '#22C55E'}
                padding={3}
                align="center"
              />
            );
          })}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
