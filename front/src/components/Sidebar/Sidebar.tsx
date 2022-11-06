import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

import { getHeatmap } from "../../store/reducers/user/UserActionCreator";

import DownloadSection from "../DownloadSection/DownloadSection";
import MultipleSelect from "../MultipleSelect/MultipleSelect";
import OpenButton from "./components/OpenButton/OpenButton";
import DemandIndexSection from "./components/DemandIndexSection/DemandIndexSection";

import { placeTypes } from "../../util/placeTypes";

import "./Sidebar.css";
import { setFilter } from "../../store/reducers/user/UserSlice";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { regionsOptions, districtsOptions, regions, districts, isLoading } =
    useAppSelector((state) => state.userReducer);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [disctrictFilterOptions, setDisctrictFilterOptions] = useState<any>([]);

  const [regionsFilter, setRegionsFilter] = useState<any[]>([]);
  const [disctrictFilter, setDisctrictFilter] = useState<any[]>([]);
  const [placesFilter, setPlacesFilter] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    if (regionsFilter.length === 0) setDisctrictFilterOptions(districtsOptions);

    const newDistricts = [];
    for (const regionFilter of regionsFilter) {
      for (const region of regions) {
        if (regionFilter.value === region.properties.name) {
          newDistricts.push(
            districts.find(
              (disctrict: any) =>
                disctrict.properties.parent_id === region.properties.id
            )
          );
          continue;
        }
      }
    }

    console.log("newDistricts", newDistricts);
  }, [regionsFilter, districts, districtsOptions, regions]);

  const handleApplyFilter = () => {
    let districtsIds = [];
    const regionsIds: any[] = [];

    if (regionsFilter.length > 0) {
      for (const regionFilter of regionsFilter) {
        for (const region of regions) {
          if (regionFilter.value === region.properties.name) {
            regionsIds.push(Number(region.properties.id));
            continue;
          }
        }
      }
    }

    if (disctrictFilter.length > 0) {
      for (const districtFilter of disctrictFilter) {
        for (const district of districts) {
          if (districtFilter.value === district.properties.name) {
            if (regionsIds.length === 0) {
              districtsIds.push(Number(district.properties.id));
            } else {
              if (regionsIds.includes(Number(district.properties.parent_id))) {
                districtsIds.push(Number(district.properties.id));
              }
            }

            continue;
          }
        }
      }

      if (districtsIds.length === 0) {
        for (const districtFilter of disctrictFilter) {
          for (const district of districts) {
            if (districtFilter.value === district.properties.name) {
              districtsIds.push(Number(district.properties.id));
              continue;
            }
          }
        }
      }
    } else {
      districtsIds = districts
        .filter((district: any) =>
          regionsIds.includes(Number(district.properties.parent_id))
        )
        .map((district: any) => district.properties.id);
    }

    console.log("regionsIds", regionsIds);

    console.log("districtsIds", districtsIds);

    console.log("placesFilter", placesFilter);

    dispatch(
      setFilter({
        mo: districtsIds,
        scoreRange: scores,
        type: placesFilter.map((item) => item.value),
      })
    );

    dispatch(
      getHeatmap({
        mo: districtsIds,
        scoreRange: scores,
        type: placesFilter.map((item) => item.value),
      })
    );
  };

  return (
    <div className={isOpen ? "sidebar-wrapper" : "sidebar-wrapper closed"}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <OpenButton isOpen={isOpen} />
      </div>

      <div className="sidebar-content">
        <section>
          <p className="text-2xl py-2">
            Фильтры {isLoading && <p className="text-xs">Загрузка</p>}
          </p>

          <hr className="py-2" />

          <MultipleSelect
            title="Административные округ(а):"
            options={regionsOptions}
            onChange={(val: any) => setRegionsFilter(val)}
          />

          <MultipleSelect
            title="Район(ы):"
            options={disctrictFilterOptions}
            onChange={(val: any) => setDisctrictFilter(val)}
          />

          <MultipleSelect
            title="Тип объекта размещения:"
            options={placeTypes}
            onChange={(val: any) => setPlacesFilter(val)}
          />

          <DemandIndexSection onChange={(val) => setScores(val)} />

          {/* <div className="flex flex-col">
            <p className="category-title py-1">Расстояние:</p>
            <DiscreteSlider />
          </div> */}

          <button className="extract-btn mt-3" onClick={handleApplyFilter}>
            Применить
          </button>
        </section>

        <DownloadSection />
      </div>
    </div>
  );
};

export default Sidebar;
