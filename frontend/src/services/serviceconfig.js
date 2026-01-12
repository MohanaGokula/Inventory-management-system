import axios from 'axios';

export function getApiBaseUrl() {
   // console.log(process.env.REACT_APP_API_BASE_URL+"process.env.REACT_APP_API_BASE_URL");    
   // return process.env.REACT_APP_API_BASE_URL;
    return 'http://localhost:8000/api';
}

export function getApiClient(cookies) {

    const axiosClient = axios.create({
        headers: {
            'Authorization': `Token ${cookies['myToken']}`,
            'Content-Type': "application/json",
        }
    })
    
    return axiosClient;
}