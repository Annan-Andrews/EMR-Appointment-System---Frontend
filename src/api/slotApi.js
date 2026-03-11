import api from "./axios";

export const getSlotsApi          = (params) => api.get("/slots", { params });
export const getDoctorScheduleApi = (doctorId) => api.get(`/slots/schedule/${doctorId}`);
export const upsertScheduleApi    = (data)   => api.post("/slots/schedule", data);
export const deleteScheduleApi    = (id)     => api.delete(`/slots/schedule/${id}`);