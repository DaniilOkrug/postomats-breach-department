import { memo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { exportData } from "../../store/reducers/user/UserActionCreator";

const DownloadSection = () => {
  const dispatch = useAppDispatch();
  const { filter } = useAppSelector((state) => state.userReducer);

  return (
    <section className="mt-3">
      <hr />
      <p className="text-2xl py-2">Скачать файл</p>
      <div className="flex flex-row justify-center items-center gap-4">
        <button
          className="extract-btn"
          onClick={() => dispatch(exportData(filter))}
        >
          Excel
        </button>
        {/* <button className="extract-btn">PDF</button> */}
      </div>
    </section>
  );
};

export default memo(DownloadSection);
