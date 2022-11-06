import { AxiosResponse } from "axios";

import $api from "../axios/axios.config";

import { pointResponse } from "../types/getPointsResponse";

export default class UserService {
  static async requestData(): Promise<AxiosResponse<any>> {
    return $api.get<any>("/geo/ao.json");
  }

  static async getPoints(): Promise<AxiosResponse<pointResponse[]>> {
    return $api.get<pointResponse[]>("/postomats");
  }

  static async getHeatmap(data: any): Promise<AxiosResponse<pointResponse[]>> {
    let params = "?";
    for (const item of data.mo) {
      params += `mo=${item}&`;
    }
    for (const item of data.scoreRange) {
      params += `scoreRange=${item}&`;
    }
    for (const item of data.type) {
      if (data.scoreRange.indexOf(item) === data.scoreRange.length - 1) {
        params += `type=${item}`;
        continue;
      }
      params += `type=${item}&`;
    }

    // params += `dictance=${data.distance}`;
    return $api.get<pointResponse[]>("/score/heatmap" + params);
  }

  static async exportData(data: any): Promise<AxiosResponse<any>> {
    let params = "?";
    for (const item of data.mo) {
      params += `mo=${item}&`;
    }
    for (const item of data.scoreRange) {
      params += `scoreRange=${item}&`;
    }
    for (const item of data.type) {
      if (data.scoreRange.indexOf(item) === data.scoreRange.length - 1) {
        params += `type=${item}`;
        continue;
      }
      params += `type=${item}&`;
    }

    return $api.get<any>("/score/export.xlsx" + params);
  }
}
