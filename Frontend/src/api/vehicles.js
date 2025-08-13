import api from './client';

export const listVehicles = () =>
  api.get('/api/customer/vehicles').then(r => r.data.vehicles || []);

export const createVehicle = (payload) =>
  api.post('/api/customer/vehicles', payload).then(r => r.data);

export const updateVehicle = (vehicle_id, payload) =>
  api.put(`/api/customer/vehicles/${vehicle_id}`, payload).then(r => r.data);

export const deleteVehicle = (vehicle_id) =>
  api.delete(`/api/customer/vehicles/${vehicle_id}`).then(r => r.data);