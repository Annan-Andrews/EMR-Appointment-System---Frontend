import api from "./axios";

export const getPatientsApi  = (params) => api.get("/patients", { params });
export const getPatientApi   = (id)     => api.get(`/patients/${id}`);
export const createPatientApi = (data)  => api.post("/patients", data);
export const updatePatientApi = (id, data) => api.put(`/patients/${id}`, data);