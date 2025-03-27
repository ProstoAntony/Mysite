import axios, {request} from "axios";
import { jwtDecode as jwt_decode } from "jwt-decode";
import dayjs from "dayjs";
import {useContext} from "react";
import AuthContext from "../context/AuthContext";

const baseURL = 'http://127.0.0.1:8000/api';

const useAxios = () => {
  const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);

  // Добавляем подробное логирование для отладки
  console.log("Creating axios instance with token:", authTokens?.access);
  
  // Проверяем наличие токена перед декодированием
  let currentUser = null;
  if (authTokens?.access) {
    try {
      currentUser = jwt_decode(authTokens.access);
      console.log("Current user in context:", currentUser);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  } else {
    console.log("No access token available");
  }

  const axiosInstance = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${authTokens?.access}` }
  });

  axiosInstance.interceptors.request.use(async req => {
    // Проверяем наличие токена
    if (!authTokens) {
      console.error("No auth tokens available");
      return req;
    }

    try {
      const user = jwt_decode(authTokens.access);
      const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
      console.log("Token expired?", isExpired);
      console.log("Token payload:", user);

      if (!isExpired) {
        console.log("Using existing token for request to:", req.url);
        return req;
      }

      console.log("Refreshing token...");
      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: authTokens.refresh
      });
      
      console.log("Token refresh response:", response.status);
      localStorage.setItem("authTokens", JSON.stringify(response.data));

      setAuthTokens(response.data);
      setUser(jwt_decode(response.data.access));

      req.headers.Authorization = `Bearer ${response.data.access}`;
      console.log("Request with new token:", req.url);
      return req;
    } catch (error) {
      console.error("Error in token refresh:", error);
      return req;
    }
  });

  // Добавляем перехватчик ответов для логирования
  axiosInstance.interceptors.response.use(
    response => {
      console.log(`Response from ${response.config.url}:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return response;
    },
    error => {
      console.error(`Error response from ${error.config?.url}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;

