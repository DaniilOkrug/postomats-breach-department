import { FC, useEffect } from "react";

import { MapGL, Sidebar } from "./components";
import MapSwitch from "./components/MapSwitch/MapSwitch";

import { mapStyle } from "./util/mapStyle";
import { initialMapViewState } from "./util/initialMapViewState";

import { Buffer } from "buffer";
import { useAppDispatch } from "./hooks/redux";
import {
  getHeatmap,
  requestData,
} from "./store/reducers/user/UserActionCreator";
global.Buffer = Buffer;

type Props = {};

const App: FC<Props> = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(requestData());
    dispatch(
      getHeatmap({
        mo: [],
        scoreRange: [0, 1000],
        type: [],
      })
    );
  }, [dispatch]);

  return (
    <>
      <Sidebar />
      <MapSwitch />
      <MapGL initialViewState={initialMapViewState} mapStyle={mapStyle} />
    </>
  );
};

export default App;
