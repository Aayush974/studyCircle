import { api } from "./axios.config.js"

const registerUser = async function(data) {
    try {
        console.log(import.meta.env.BACKEND_URL)
        const user = await api.post(`/users/register`,data,{
            headers: { "Content-Type": "multipart/form-data" }
        })
        return user.data
    } catch (error) {
        console.error(error)
    }
}

export {
    registerUser
}