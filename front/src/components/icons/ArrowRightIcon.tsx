import React, { FC } from "react";
import { IconProps } from "./types";

const ArrowRightIcon: FC<IconProps> = ({
  width = 24,
  height = 24,
  opacity = 1,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      opacity={opacity}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{
        transform: "rotate(-90deg)",
      }}
    >
      <path d="M15.793 9.4l1.414 1.414L12 16.024l-5.207-5.21L8.207 9.4 12 13.195z"></path>
    </svg>
  );
};

export default ArrowRightIcon;
