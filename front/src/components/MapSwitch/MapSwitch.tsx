import { useState } from "react";
import { useDispatch } from "react-redux";
import { setMapState } from "../../store/reducers/user/UserSlice";
import { MapStateType } from "../../types/mapStateTypes";

import ArrowRightIcon from "../icons/ArrowRightIcon";

import "./MapSwitch.css";

const MapSwitch = () => {
  const dispatch = useDispatch();

  const switchItems = [
    {
      label: "Точки",
      value: "Points" as MapStateType,
    },
    {
      label: "Heatmap",
      value: "Heatmap" as MapStateType,
    },
  ];

  const [activeItem, setActiveItem] = useState<{
    label: string;
    value: MapStateType;
  }>(switchItems[0]);

  const handleLeftClick = () => {
    const currItem = switchItems.find((el) => el.value === activeItem.value);
    if (!currItem) return;

    const nextIndex = switchItems.indexOf(currItem) - 1;

    if (nextIndex < 0) {
      setActiveItem(switchItems[switchItems.length - 1]);
      dispatch(setMapState(switchItems[switchItems.length - 1].value));
    } else {
      setActiveItem(switchItems[nextIndex]);
      dispatch(setMapState(switchItems[nextIndex].value));
    }
  };

  const handleRightClick = () => {
    const currItem = switchItems.find((el) => el.value === activeItem.value);
    if (!currItem) return;

    const nextIndex = switchItems.indexOf(currItem) + 1;

    if (nextIndex > switchItems.length - 1) {
      setActiveItem(switchItems[0]);
      dispatch(setMapState(switchItems[0].value));
    } else {
      setActiveItem(switchItems[nextIndex]);
      dispatch(setMapState(switchItems[nextIndex].value));
    }
  };

  return (
    <div className="map-switch-container">
      <button className="arrow-left" onClick={handleLeftClick}>
        <ArrowRightIcon />
      </button>

      <div className="map-switch-item">{activeItem.label}</div>

      <button className="arrow-right" onClick={handleRightClick}>
        <ArrowRightIcon />
      </button>
    </div>
  );
};

export default MapSwitch;
