import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  exportData,
  getHeatmap,
  getPoints,
  requestData,
} from "./UserActionCreator";

import { seletOptionType } from "../../../types/seletOptionType";
import { MapStateType } from "../../../types/mapStateTypes";
import { pointResponse } from "../../../types/getPointsResponse";

interface UserState {
  regions: any;
  districts: any;
  regionsOptions: seletOptionType[];
  districtsOptions: seletOptionType[];
  mapState: MapStateType;
  points: any;
  heatmap: any;
  excel: any;
  filter: any;
  isLoading: boolean;
  userError: string;
}

const initialState: UserState = {
  regions: {},
  districts: {},
  regionsOptions: [],
  districtsOptions: [],
  points: [],
  heatmap: {},
  filter: {
    mo: [],
    scoreRange: [0, 1000],
    type: [],
  },
  excel: "",
  mapState: "Points",
  isLoading: false,
  userError: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMapState(state, action: PayloadAction<MapStateType>) {
      state.mapState = action.payload;
    },

    setFilter(state, action: PayloadAction<any>) {
      state.filter = action.payload;
    },
  },
  extraReducers: {
    // Getting regions and districts
    [requestData.fulfilled.type]: (state, action: PayloadAction<any>) => {
      state.regions = action.payload.regions;
      state.districts = action.payload.districts;
      state.regionsOptions = action.payload.regionsOptions;
      state.districtsOptions = action.payload.districtsOptions;
      state.isLoading = false;
      state.userError = "";
    },
    [requestData.pending.type]: (state) => {
      state.isLoading = true;
    },
    [requestData.rejected.type]: (state) => {
      state.regions = [];
      state.districts = [];
      state.regionsOptions = [];
      state.districtsOptions = [];
      state.isLoading = false;
    },
    //Getting points for postomats
    [getPoints.fulfilled.type]: (
      state,
      action: PayloadAction<pointResponse[]>
    ) => {
      state.points = action.payload;
      state.isLoading = false;
      state.userError = "";
    },
    [getPoints.pending.type]: (state) => {
      state.isLoading = true;
    },
    [getPoints.rejected.type]: (state) => {
      state.points = [];
      state.isLoading = false;
    },

    //Getting points for postomats
    [getHeatmap.fulfilled.type]: (
      state,
      action: PayloadAction<pointResponse[]>
    ) => {
      state.heatmap = action.payload;
      state.isLoading = false;
      state.userError = "";
    },
    [getHeatmap.pending.type]: (state) => {
      state.isLoading = true;
    },
    [getHeatmap.rejected.type]: (state) => {
      state.heatmap = [];
      state.isLoading = false;
    },

    [exportData.fulfilled.type]: (state, action: PayloadAction<any>) => {
      state.excel = action.payload;
      state.isLoading = false;
      state.userError = "";
    },
    [exportData.pending.type]: (state) => {
      state.isLoading = true;
    },
    [exportData.rejected.type]: (state) => {
      state.excel = "";
      state.isLoading = false;
    },
  },
});

export const { setMapState, setFilter } = userSlice.actions;

export default userSlice.reducer;
