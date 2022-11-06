import { Layer } from "react-map-gl";

import {
  clusterCountLayer,
  clusterLayer,
  unclusteredPointLayer,
} from "../../../util/layers";

const PointsLayer = () => {
  return (
    <>
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredPointLayer} />
    </>
  );
};

export default PointsLayer;
