import { observer } from "mobx-react";
import { Group, Line } from "react-konva";
import type { FC } from "react";
import { useRegionStyles } from "../../../hooks/useRegionColor";
import { getNodeAbsoluteDimensions } from "./tools";
import type { WorkingArea } from "./types";
import { LabelOnVideoBbox } from "../../../components/ImageView/LabelOnRegion";
import { PolygonPoint } from "../../../regions/PolygonPoint";
import { MIN_SIZE } from "../../../tools/Base";

interface PolygonProps {
  reg: any;
  frame: number;
  selected: boolean;
  draggable: boolean;
  listening: boolean;
  points: number[][];
  workingArea: WorkingArea;
  onDragMove: (e: any) => void;
  onClick: (e: any) => void;
}

const PolygonPure: FC<PolygonProps> = ({
  reg,
  points,
  frame,
  workingArea,
  selected,
  draggable,
  listening,
  onDragMove,
}) => {
  const style = useRegionStyles(reg, { includeFill: true });
  const { realWidth: waWidth, realHeight: waHeight, scale: waScale } = workingArea;

  // Convert relative coordinates to absolute
  const absPoints = points.map(([x, y]) => [
    (x * waWidth) / 100,
    (y * waHeight) / 100,
  ]).flat();

  const bbox = {
    x: Math.min(...points.map(([x]) => (x * waWidth) / 100)),
    y: Math.min(...points.map(([_, y]) => (y * waHeight) / 100)),
    width: Math.max(...points.map(([x]) => (x * waWidth) / 100)) - Math.min(...points.map(([x]) => (x * waWidth) / 100)),
    height: Math.max(...points.map(([_, y]) => (y * waHeight) / 100)) - Math.min(...points.map(([_, y]) => (y * waHeight) / 100)),
  };

  const onTransform = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newPoints = points.map(([x, y]) => [
      Math.max(MIN_SIZE, x * scaleX),
      Math.max(MIN_SIZE, y * scaleY),
    ]);

    reg.updateShape({ points: newPoints, rotation: node.rotation() }, frame);
  };

  const onDragEnd = (e: any) => {
    const node = e.target;
    const { x, y } = getNodeAbsoluteDimensions(node, workingArea);
    const offsetX = (x * waWidth) / 100;
    const offsetY = (y * waHeight) / 100;

    const newPoints = points.map(([px, py]) => [
      px + offsetX,
      py + offsetY,
    ]);

    reg.updateShape({ points: newPoints, rotation: node.rotation() }, frame);
    node.x(0);
    node.y(0);
  };

  return (
    <Group>
      <LabelOnVideoBbox
        reg={reg}
        box={bbox}
        scale={waScale}
        color={style.strokeColor}
        strokeWidth={style.strokeWidth}
        adjacent
      />
      <Line
        points={absPoints}
        closed={reg.closed}
        fill={style.fillColor}
        stroke={style.strokeColor}
        strokeWidth={style.strokeWidth}
        draggable={draggable}
        listening={listening}
        onDragMove={onDragMove}
        onTransform={onTransform}
        onTransformEnd={onDragEnd}
        onDragEnd={onDragEnd}
      />
      {selected && points.map((point, idx) => (
        <PolygonPoint
          key={idx}
          name={`p${idx}`}
          index={idx}
          x={(point[0] * waWidth) / 100}
          y={(point[1] * waHeight) / 100}
          style={reg.pointStyle}
          size={reg.pointSize}
          draggable={!reg.isReadOnly()}
          onDragMove={(e: any) => {
            const { x, y } = e.target.position();
            const newPoints = [...points];
            newPoints[idx] = [
              (x / waWidth) * 100,
              (y / waHeight) * 100,
            ];
            reg.updateShape({ points: newPoints, rotation: reg.rotation }, frame);
          }}
        />
      ))}
    </Group>
  );
};

export const Polygon = observer(PolygonPure); 