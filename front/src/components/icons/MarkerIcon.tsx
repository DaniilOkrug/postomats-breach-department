import { FC } from "react";
import { IconProps } from "./types";

const MarkerIcon: FC<IconProps> = ({ width = 20, height = 35 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="-96 0 464 464"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m272 428c0-19.882812-60.890625-36-136-36s-136 16.117188-136 36 60.890625 36 136 36 136-16.117188 136-36zm0 0"
        fill="#adabac"
      ></path>
      <path
        d="m120 160h32v256c0 8.835938-7.164062 16-16 16s-16-7.164062-16-16zm0 0"
        fill="#494342"
      ></path>
      <path
        d="m232 96c0 53.019531-42.980469 96-96 96s-96-42.980469-96-96 42.980469-96 96-96 96 42.980469 96 96zm0 0"
        fill="#ad2943"
      ></path>
      <path
        d="m200 96c0 35.347656-28.652344 64-64 64s-64-28.652344-64-64 28.652344-64 64-64 64 28.652344 64 64zm0 0"
        fill="#ee3446"
      ></path>
    </svg>
  );
};

export default MarkerIcon;
