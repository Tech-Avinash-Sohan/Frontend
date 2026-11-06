// crud("/learning/homework/") -> { list, get, save, remove, action }
// save() does PATCH when data.id is set, POST otherwise. action(id, "approve", body) -> POST {base}{id}/approve/
import { api } from "./api_client";

export const crud = (base) => ({
  list: (params = {}) => api.get(base, { params: { page_size: 100, ...params } }),
  get: (id) => api.get(`${base}${id}/`),
  save: (data) => {
    const { id, ...body } = data;
    return id ? api.patch(`${base}${id}/`, body) : api.post(base, body);
  },
  remove: (id) => api.delete(`${base}${id}/`),
  action: (id, name, body = {}) => api.post(id ? `${base}${id}/${name}/` : `${base}${name}/`, body),
  view: (id, name, params) => api.get(id ? `${base}${id}/${name}/` : `${base}${name}/`, { params }),
});

/** [{value,label}] from a Django TextChoices-like list of [value, label] pairs */
export const opts = (pairs) => pairs.map(([value, label]) => ({ value, label }));
