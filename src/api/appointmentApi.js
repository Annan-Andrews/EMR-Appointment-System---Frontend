import api from "./axios";

export const getAppointmentsApi   = (params) => api.get("/appointments", { params });
export const getAppointmentApi    = (id)     => api.get(`/appointments/${id}`);
export const createAppointmentApi = (data)   => api.post("/appointments", data);
export const updateAppointmentApi = (id, data) => api.put(`/appointments/${id}`, data);
export const deleteAppointmentApi = (id)     => api.delete(`/appointments/${id}`);
export const markArrivedApi       = (id)     => api.post(`/appointments/${id}/arrive`);