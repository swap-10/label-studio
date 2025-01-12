import { types } from "mobx-state-tree";
import { observer } from "mobx-react";
import Registry from "../../core/Registry";
import { guidGenerator } from "../../core/Helpers";
import ControlBase from "./Base";

/**
 * VideoPolygon tag brings polygon annotation capabilities to videos. It works in combination with the `<Video/>` tag.
 *
 * Use with the following data types: video
 * @example
 * <!--Video polygon annotation-->
 * <View>
 *   <Video name="video" value="$video" />
 *   <VideoPolygon name="videopoly" toName="video" />
 *
 *   <Labels name="labels" toName="video">
 *     <Label value="Person" background="#FF0000"/>
 *     <Label value="Animal" background="#0033FF"/>
 *   </Labels>
 * </View>
 * @name VideoPolygon
 * @meta_title Video Polygon Tag for Polygon Annotation in Videos
 * @meta_description Customize Label Studio with the VideoPolygon tag for polygon annotation tasks in videos for machine learning and data science projects.
 * @param {string} name Name of the element
 * @param {string} toName Name of the video element to annotate
 * @param {number} [opacity=0.6] Opacity of polygon
 * @param {string} [fillColor=#f48a42] Polygon fill color in hexadecimal
 * @param {string} [strokeColor=#f48a42] Stroke color in hexadecimal
 * @param {number} [strokeWidth=1] Width of stroke
 * @param {small|medium|large} [pointSize=small] Size of control points
 * @param {rectangle|circle} [pointStyle=circle] Style of control points
 */

const TagAttrs = types.model({
  name: types.identifier,
  toname: types.maybeNull(types.string),
  opacity: types.optional(types.string, "0.6"),
  fillcolor: types.optional(types.string, "#f48a42"),
  strokecolor: types.optional(types.string, "#f48a42"),
  strokewidth: types.optional(types.string, "1"),
  pointsize: types.optional(types.string, "small"),
  pointstyle: types.optional(types.string, "circle"),
});

const ModelAttrs = types.model({
  pid: types.optional(types.string, guidGenerator),
  type: "videopolygon",
});

const VideoPolygonModel = types.compose("VideoPolygonModel", ModelAttrs, TagAttrs, ControlBase);

const HtxVideoPolygon = observer(() => {
  return null;
});

Registry.addTag("videopolygon", VideoPolygonModel, HtxVideoPolygon);

export { HtxVideoPolygon, VideoPolygonModel }; 