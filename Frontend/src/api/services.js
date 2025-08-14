import api from './client';

export async function updateCustomerService(id, payload) {
  const { data } = await api.patch(`/api/customer/services/${id}`, payload);
  return data;
}

export async function fetchCustomerServices() {
  const { data } = await api.get('/api/customer/services');
  return data.services || [];
}

export async function fetchServiceCatalog() {
  const { data } = await api.get('/api/services/catalog');
  return data || [];
}

export async function fetchVehicles() {
  const { data } = await api.get('/api/customer/vehicles');
  return data.vehicles || [];
}

export async function createCustomerService(payload) {
  const { data } = await api.post('/api/customer/services', payload);
  return data;
}

export async function deleteCustomerService(id) {
  const { data } = await api.delete(`/api/customer/services/${id}`);
  return data;
}
