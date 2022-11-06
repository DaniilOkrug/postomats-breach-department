import { Layer } from "react-map-gl";
import { heatmapLayer } from "../../../util/layers";

const HeatmapLayer = () => {
  return (
    <>
      <Layer {...heatmapLayer} />
    </>
  );
};

export default HeatmapLayer;
