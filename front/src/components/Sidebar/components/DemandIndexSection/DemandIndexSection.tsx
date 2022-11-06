import { FC, memo, useEffect, useState } from "react";
import { useAppSelector } from "../../../../hooks/redux";

interface DemandIndexSectionProps {
  onChange: (val: number[]) => void;
}

const DemandIndexSection: FC<DemandIndexSectionProps> = ({ onChange }) => {
  const { heatmap } = useAppSelector((state) => state.userReducer);

  const [fromValue, setFromValue] = useState<string>("0");
  const [toValue, setToValue] = useState<string>("100");

  useEffect(() => {
    if (heatmap.features) {
      const data = [...heatmap.features];

      data.sort(
        (a: any, b: any) => a.properties.realScore - b.properties.realScore
      );

      setFromValue(data[0].properties.realScore.toFixed(2));
      setToValue(data[data.length - 1].properties.realScore.toFixed(2));
    }
  }, [heatmap]);

  useEffect(() => {
    onChange([Number(fromValue), Number(toValue)]);
  }, [toValue, fromValue, onChange]);

  return (
    <div className="mb-3">
      <p className="category-title py-1">Показатель востребованности:</p>
      <div className="flex flex-row align-center justify-between">
        <div className="flex flex-row align-center">
          <p>от</p>
          <input
            className="input-small w-full"
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
          />
        </div>
        <div className="flex flex-row align-center">
          <p>до</p>
          <input
            className="input-small w-full"
            type="number"
            value={toValue}
            onChange={(e) => setToValue(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(DemandIndexSection);
