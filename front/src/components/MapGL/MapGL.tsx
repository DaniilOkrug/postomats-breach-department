import { FC, useCallback, useRef, useState } from "react";
import Map, { MapRef, Source } from "react-map-gl";
import { useAppSelector } from "../../hooks/redux";
import HeatmapLayer from "../Layers/HeatmapLayer/HeatmapLayer";

import PointsLayer from "../Layers/PointsLayer/PointsLayer";

import { InitialViewStateType } from "./types";

import "./MapGl.css";

type Props = {
  initialViewState: InitialViewStateType;
  mapStyle: string;
};

const MapGL: FC<Props> = ({ initialViewState, mapStyle }) => {
  const { mapState, heatmap } = useAppSelector((state) => state.userReducer);

  const mapRef = useRef<MapRef>(null);

  const [hoverData, setHoverData] = useState<any>(null);

  const onHover = useCallback(
    (event: any) => {
      const {
        features,
        point: { x, y },
      } = event;
      const hoveredFeature = features && features[0];

      // prettier-ignore
      setHoverData(hoveredFeature && {feature: hoveredFeature, x, y});
    },
    []
  );

  console.log(heatmap);
  

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle={mapStyle}
      interactiveLayerIds={mapState === "Points" ? ["unclustered-point"] : []}
      onMouseMove={onHover}
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
    >
      {mapState === "Points" && (
        <>
          {hoverData && (
            <div
              className="tooltip"
              style={{ left: hoverData.x, top: hoverData.y }}
            >
              <div>
                Востребованность:{" "}
                {hoverData.feature.properties.realScore.toFixed(2)}
              </div>
            </div>
          )}
          <Source
            id="earthquakes"
            type="geojson"
            // data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
            data={heatmap}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            {PointsLayer()}
          </Source>
        </>
      )}

      {mapState === "Heatmap" && (
        <Source
          id="earthquakes"
          type="geojson"
          // data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
          data={heatmap}
        >
          {HeatmapLayer()}
        </Source>
      )}

      {mapState === "Sectors" && (
        <Source
          id="earthquakes"
          type="geojson"
          // data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
          data={heatmap}
        >
          {HeatmapLayer()}
        </Source>
      )}
    </Map>
  );
};

export default MapGL;
