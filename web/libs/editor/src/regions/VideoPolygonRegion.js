import { types } from "mobx-state-tree";
import { interpolateProp } from "../utils/props";
import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import Registry from "../core/Registry";
import { AreaMixin } from "../mixins/AreaMixin";
import { onlyProps, VideoRegion } from "./VideoRegion";
import { guidGenerator } from "../core/Helpers";
import { FF_DEV_3793, isFF } from "../utils/feature-flags";

const Model = types
  .model("VideoPolygonRegionModel", {
    type: "videopolygonregion",
    points: types.array(types.array(types.number)),
  })
  .volatile(() => ({
    props: ["points", "rotation"],
    closed: true,
    mouseOverStartPoint: false,
    selectedPoint: null,
  }))
  .views((self) => ({
    getShape(frame) {
      let prev;
      let next;

      for (const item of self.sequence) {
        if (item.frame === frame) {
          return onlyProps(self.props, item);
        }

        if (item.frame > frame) {
          next = item;
          break;
        }
        prev = item;
      }

      if (!prev) return null;
      if (!next) return onlyProps(self.props, prev);

      // Interpolate points between keyframes
      const points = prev.points.map((point, idx) => {
        const nextPoint = next.points[idx];
        return [
          interpolateProp(prev, next, frame, `points.${idx}.0`),
          interpolateProp(prev, next, frame, `points.${idx}.1`),
        ];
      });

      return {
        ...onlyProps(self.props, prev),
        points,
        rotation: interpolateProp(prev, next, frame, "rotation"),
      };
    },

    getVisibility() {
      return true;
    },
  }))
  .actions((self) => ({
    updateShape(data, frame) {
      const newItem = {
        ...data,
        frame,
        enabled: true,
      };

      const kp = self.closestKeypoint(frame);
      const index = self.sequence.findIndex((item) => item.frame >= frame);

      if (index < 0) {
        self.sequence = [...self.sequence, newItem];
      } else {
        const keypoint = {
          ...(self.sequence[index] ?? {}),
          ...data,
          enabled: kp?.enabled ?? true,
          frame,
        };

        self.sequence = [
          ...self.sequence.slice(0, index),
          keypoint,
          ...self.sequence.slice(index + (self.sequence[index].frame === frame)),
        ];
      }
    },

    addPoint(point, frame) {
      const shape = self.getShape(frame);
      const points = shape ? [...shape.points, point] : [point];

      self.updateShape({ points, rotation: shape?.rotation ?? 0 }, frame);
    },

    removePoint(idx, frame) {
      const shape = self.getShape(frame);
      if (!shape) return;

      const points = shape.points.filter((_, index) => index !== idx);
      self.updateShape({ points, rotation: shape.rotation }, frame);
    },

    insertPoint(idx, point, frame) {
      const shape = self.getShape(frame);
      if (!shape) return;

      const points = [
        ...shape.points.slice(0, idx),
        point,
        ...shape.points.slice(idx),
      ];
      self.updateShape({ points, rotation: shape.rotation }, frame);
    },
  }));

const VideoPolygonRegionModel = types.compose(
  "VideoPolygonRegionModel",
  RegionsMixin,
  VideoRegion,
  AreaMixin,
  NormalizationMixin,
  Model,
);

Registry.addRegionType(VideoPolygonRegionModel, "video");

export { VideoPolygonRegionModel }; 