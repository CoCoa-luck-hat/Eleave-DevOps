import { jwtDecode } from "jwt-decode";

export function getUserRole(token){
    try{
        const decoded = jwtDecode(token)
        return decoded.role
    }catch (error){
        return null
    }
}

export function isTokenExpired(token){
    try{
        const decoded = jwtDecode(token)
        const currentTime = Date.now()/1000
        return decoded.exp < currentTime
    } catch (error){
        return true
    }
}