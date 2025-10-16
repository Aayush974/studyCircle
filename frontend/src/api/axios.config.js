import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL,
    timeout: 2000
})

export  {api}