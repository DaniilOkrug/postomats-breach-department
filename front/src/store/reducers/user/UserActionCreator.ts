import { createAsyncThunk } from "@reduxjs/toolkit";

import UserService from "../../../services/UserService";
import { minmax } from "../../../util/minMax";

export const requestData = createAsyncThunk(
  "user/requestData",
  async (_, thunkAPI) => {
    try {
      const response = await UserService.requestData();

      console.log(response.data);

      const regions = response.data.features.filter(
        (feature: any) =>
          !feature.properties.parent_id && feature.properties.name !== "Троицкий"
      );

      const districts = response.data.features.filter(
        (feature: any) => feature.properties.parent_id
      );

      const regionsOptions = regions.map((feature: any) => {
        return {
          value: feature.properties.name,
          label: feature.properties.abbr,
        };
      });

      const districtsOptions = districts.map((feature: any) => {
        return {
          value: feature.properties.name,
          label: feature.properties.abbr,
        };
      });

      return {
        regions,
        districts,
        regionsOptions,
        districtsOptions,
      };
    } catch (err: any) {
      console.error(err.response.data.message);
      return thunkAPI.rejectWithValue("Не удалось получить данные!");
    }
  }
);

export const getPoints = createAsyncThunk(
  "user/getPoints",
  async (_, thunkAPI) => {
    try {
      const response = await UserService.getPoints();

      console.log(response.data);

      const result = {
        type: "FeatureCollection",
        features: response.data.map((feature) => {
          return {
            geometry: {
              type: "Point",
              coordinates: [feature.point.long, feature.point.lat],
            },
            properties: {
              score: feature.score,
            },
          };
        }),
      };

      return result;
    } catch (err: any) {
      console.error(err.response.data.message);
      return thunkAPI.rejectWithValue("Не удалось получить данные!");
    }
  }
);

export const getHeatmap = createAsyncThunk(
  "user/getHeatmap",
  async (
    data: {
      mo: number[];
      scoreRange: number[];
      type: any;
    },
    thunkAPI
  ) => {
    try {
      const response = await UserService.getHeatmap(data);

      console.log(response.data);

      const result = {
        type: "FeatureCollection",
        features: minmax(response.data).map((feature) => {
          return {
            geometry: {
              type: "Point",
              coordinates: [feature.point.long, feature.point.lat],
            },
            properties: {
              score: feature.score,
              realScore: feature.realScore,
            },
          };
        }),
      };

      return result;
    } catch (err: any) {
      console.error(err.response.data.message);
      return thunkAPI.rejectWithValue("Не удалось получить данные!");
    }
  }
);

export const exportData = createAsyncThunk(
  "user/exportData",
  async (
    data: {
      mo: number[];
      scoreRange: number[];
      type: any;
    },
    thunkAPI
  ) => {
    try {
      const response = await UserService.exportData(data);

      console.log(response.data);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();

      return response.data;
    } catch (err: any) {
      console.error(err.response.data.message);
      return thunkAPI.rejectWithValue("Не удалось получить данные!");
    }
  }
);
