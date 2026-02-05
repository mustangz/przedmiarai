'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from 'react-konva';
import Konva from 'konva';

export interface Measurement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  areaM2: number;
}

export interface DetectedRoom {
  id: string;
  name: string;
  x: number;      // % of image width
  y: number;      // % of image height
  width: number;  // % of image width
  height: number; // % of image height
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
    
    // Click on stage background = start drawing
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
    
    // Minimum size check
    if (Math.abs(newRect.width) < 10 || Math.abs(newRect.height) < 10) {
      setNewRect(null);
      return;
    }

    // Normalize rect (handle negative dimensions)
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
    
    // Reset scale and apply to dimensions
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

  return (
    <div ref={containerRef} className="w-full h-full bg-neutral-900/50">
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

          {/* Existing measurements */}
          {measurements.map((m) => (
            <Rect
              key={m.id}
              id={m.id}
              x={m.x}
              y={m.y}
              width={m.width}
              height={m.height}
              fill={selectedId === m.id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}
              stroke={selectedId === m.id ? '#8B5CF6' : '#3B82F6'}
              strokeWidth={2}
              draggable={tool === 'select'}
              onClick={() => onSelect(m.id)}
              onTap={() => onSelect(m.id)}
              onDragEnd={(e) => handleDragEnd(m.id, e.target)}
              onTransformEnd={(e) => handleTransformEnd(m.id, e.target)}
            />
          ))}

          {/* Labels */}
          {measurements.map((m) => (
            <Text
              key={`label_${m.id}`}
              x={m.x}
              y={m.y - 20}
              text={`${m.name}: ${m.areaM2.toFixed(2)} m²`}
              fontSize={12}
              fill="#fff"
              padding={4}
            />
          ))}

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

          {/* AI-detected rooms (pending approval) */}
          {image && detectedRooms.map((room) => {
            const rx = imageX + (room.x / 100) * image.width * imageScale;
            const ry = imageY + (room.y / 100) * image.height * imageScale;
            const rw = (room.width / 100) * image.width * imageScale;
            const rh = (room.height / 100) * image.height * imageScale;
            return (
              <Rect
                key={room.id}
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                fill="rgba(34, 197, 94, 0.15)"
                stroke="#22C55E"
                strokeWidth={2}
                dash={[6, 4]}
              />
            );
          })}
          {image && detectedRooms.map((room) => {
            const rx = imageX + (room.x / 100) * image.width * imageScale;
            const ry = imageY + (room.y / 100) * image.height * imageScale;
            return (
              <Text
                key={`ai_label_${room.id}`}
                x={rx}
                y={ry - 18}
                text={`🤖 ${room.name}`}
                fontSize={12}
                fill="#22C55E"
                padding={3}
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
