import axios from "axios";

const $api = axios.create({
  baseURL: "https://plony.ru", // !! Server URL
});

/*
...axios.interceports если понадобяться
*/

export default $api;
