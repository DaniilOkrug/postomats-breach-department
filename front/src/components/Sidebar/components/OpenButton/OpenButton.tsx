import { FC, memo } from "react";
import ArrowRightIcon from "../../../icons/ArrowRightIcon";
import "./OpenButton.css";

interface OpenButtonProps {
  isOpen: boolean;
}

const OpenButton: FC<OpenButtonProps> = ({ isOpen }) => {
  return (
    <div className={"open-btn " + (isOpen ? "left" : "")}>
      <ArrowRightIcon />
    </div>
  );
};

export default memo(OpenButton);
