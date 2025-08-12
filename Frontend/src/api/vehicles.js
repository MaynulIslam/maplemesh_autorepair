import api from './client';

export const listVehicles = () =>
  api.get('/api/customer/vehicles').then(r => r.data.vehicles || []);