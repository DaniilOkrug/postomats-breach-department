import { memo } from "react";
import Slider from "@mui/material/Slider";

const DiscreteSlider = () => {
  function getSliderValue(value: number) {
    return String(value);
  }

  return (
    <div className="pr-2">
      <Slider
        aria-label="Distance"
        defaultValue={250}
        getAriaValueText={getSliderValue}
        valueLabelDisplay="auto"
        step={100}
        marks
        min={100}
        max={400}
      />
    </div>
  );
};

export default memo(DiscreteSlider);
