import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_ENV === "development" ? "/api" : import.meta.env.VITE_BACKEND_URL,
    timeout: 60000
})

export  {api}