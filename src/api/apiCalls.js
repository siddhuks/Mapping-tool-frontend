import axios from "axios";
import utils from "../utils";

const instance = axios.create({
    baseURL: 'http://localhost:5000/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json', // Example headers
        'Authorization': `Bearer ${sessionStorage.getItem(utils.constants.localStorageItem.TOKEN)}`,
    },
});

async function loginUser(body) {
    try {
        const response = await instance.post("api/auth/login", body);
        return response;
    } catch (e) {
        throw e;
    }
}

async function fetchHL7Message(messageType) {
    try {
        console.log("trying")
        const response = await instance.get(`api/messages/${messageType}`);
        console.log("res: ", response)
        return response.data;
    } catch (e) {
        console.error('Error fetching HL7 message:', e);
        throw e;
    }
}


async function uploadJSON(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await instance.post(`api/upload/json`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (e) {
        console.error('Error uploading JSON file:', e);
        throw e;
    }
}

async function createMappingData(body) {
    try {
        const response = await instance.post("api/mirth/create-channel", body);
        return response.data;
    } catch (e) {
        console.error("Error creating channel:", e);
        throw e;
    }
}

async function deployMappingData(body) {
    try {
        const response = await instance.post("api/mirth/deploy-channel", body);
        return response.data;
    } catch (e) {
        console.error("Error deploying channel:", e);
        throw e;
    }
}

async function uploadAndSendJSON(body) {
    try {
        const response = await instance.post("/api/mirth/send-json", body);
        return response.data;
    } catch (e) {
        console.error("Error sending JSON:", e);
        throw e;
    }
}

const api = {
    loginUser,
    fetchHL7Message,
    uploadJSON,
    createMappingData,
    deployMappingData,
    uploadAndSendJSON
}

export default api