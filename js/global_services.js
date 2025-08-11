// Global Services Admin Page Logic
(function(){
  console.log('[GlobalServices] script loaded');
  const API_BASE = 'http://localhost:8001/api';
  // Support existing token storage key used elsewhere (access_token) with fallback
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if(!token){
    console.warn('No auth token found; page will show empty results.');
  }
  const headers = () => ({
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  });
  const tableBody = document.querySelector('#servicesTable tbody');
  const searchBox = document.getElementById('searchBox');
  const statusArea = document.getElementById('statusArea');
  const btnAdd = document.getElementById('btnAdd');
  const btnBulk = document.getElementById('btnBulk');
  const btnTemplate = document.getElementById('btnTemplate');
  const serviceModalEl = document.getElementById('serviceModal');
  const bulkModalEl = document.getElementById('bulkModal');
  const serviceModal = serviceModalEl ? new bootstrap.Modal(serviceModalEl) : null;
  const bulkModal = bulkModalEl ? new bootstrap.Modal(bulkModalEl) : null;
  const btnSaveService = document.getElementById('btnSaveService');
  let editingId = null; // service_id reference

  function templateCsv(){
    const header = 'service_id,service_name,main_category,time_takes,price,description\n';
    const sample = 'oil_change,Engine Oil & Filter Change,Maintenance,45,79.99,Replace engine oil and filter\n';
    const blob = new Blob([header+sample], {type:'text/csv'});
    btnTemplate.href = URL.createObjectURL(blob);
    btnTemplate.download = 'global_services_template.csv';
  }

  async function fetchServices(){
    const q = searchBox.value.trim();
    const url = new URL(API_BASE + '/global-services');
    if(q) url.searchParams.set('q', q);
    statusArea.textContent = 'Loading...';
    try{
      const res = await fetch(url, { headers: token ? { 'Authorization':'Bearer '+token } : {} });
      if(res.status === 401){
        statusArea.textContent = 'Unauthorized. Please sign in.';
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Sign in required</td></tr>';
        return;
      }
      if(!res.ok) throw new Error('Load failed '+res.status);
      const data = await res.json();
      renderRows(data.items || []);
      statusArea.textContent = `${data.items.length} services loaded`;
    }catch(err){
      console.error(err);
      statusArea.textContent = 'Error loading services';
    }
  }

  function renderRows(items){
    tableBody.innerHTML = '';
    if(!items.length){
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No services found</td></tr>';
      return;
    }
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(item.service_id)}</td>
        <td>${escapeHtml(item.service_name)}</td>
        <td>${escapeHtml(item.main_category || '')}</td>
        <td>${item.time_takes ?? ''}</td>
        <td>${item.price != null ? ('$'+item.price.toFixed(2)) : ''}</td>
        <td>${escapeHtml(item.description || '')}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" data-action="edit" data-id="${item.service_id}">Edit</button>
            <button class="btn btn-outline-danger" data-action="del" data-id="${item.service_id}">Del</button>
          </div>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  function escapeHtml(str){
    return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async function saveService(){
    const payload = {
      service_id: document.getElementById('svc_service_id').value.trim(),
      service_name: document.getElementById('svc_service_name').value.trim(),
      main_category: document.getElementById('svc_main_category').value.trim(),
      time_takes: toInt(document.getElementById('svc_time_takes').value),
      price: toFloat(document.getElementById('svc_price').value),
      description: document.getElementById('svc_description').value.trim()
    };
    const isEdit = !!editingId;
    const method = isEdit ? 'PUT' : 'POST';
    const endpoint = isEdit ? `/global-services/${encodeURIComponent(editingId)}` : '/global-services';
    try{
      btnSaveService.disabled = true;
      const res = await fetch(API_BASE + endpoint, { method, headers: headers(), body: JSON.stringify(isEdit ? omit(payload,'service_id') : payload)});
      if(!res.ok) throw new Error(await res.text());
      await fetchServices();
      serviceModal.hide();
    }catch(err){
      alert('Save failed: '+err.message);
    }finally{ btnSaveService.disabled = false; }
  }

  function omit(obj, key){ const c={}; Object.keys(obj).forEach(k=>{ if(k!==key) c[k]=obj[k];}); return c; }
  function toInt(v){ return v? parseInt(v,10): null; }
  function toFloat(v){ return v? parseFloat(v): null; }

  function openAdd(){
    editingId = null;
    document.getElementById('serviceModalLabel').textContent = 'Add Service';
    document.getElementById('svc_service_id').disabled = false;
    ['svc_service_id','svc_service_name','svc_main_category','svc_time_takes','svc_price','svc_description'].forEach(id=>document.getElementById(id).value='');
    serviceModal.show();
  }

  function openEdit(item){
    editingId = item.service_id;
    document.getElementById('serviceModalLabel').textContent = 'Edit Service';
    document.getElementById('svc_service_id').value = item.service_id;
    document.getElementById('svc_service_id').disabled = true;
    document.getElementById('svc_service_name').value = item.service_name;
    document.getElementById('svc_main_category').value = item.main_category || '';
    document.getElementById('svc_time_takes').value = item.time_takes ?? '';
    document.getElementById('svc_price').value = item.price ?? '';
    document.getElementById('svc_description').value = item.description || '';
    serviceModal.show();
  }

  async function deleteService(id){
    if(!confirm('Delete service '+id+'?')) return;
    try{
      const res = await fetch(API_BASE + '/global-services/' + encodeURIComponent(id), { method:'DELETE', headers: { 'Authorization':'Bearer '+token }});
      if(!res.ok) throw new Error(await res.text());
      fetchServices();
    }catch(err){
      alert('Delete failed: '+err.message);
    }
  }

  tableBody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    if(btn.dataset.action==='edit'){
      // find item
      const row = btn.closest('tr');
      const cells = row.querySelectorAll('td');
      const item = {
        service_id: cells[0].textContent.trim(),
        service_name: cells[1].textContent.trim(),
        main_category: cells[2].textContent.trim(),
        time_takes: cells[3].textContent.trim() ? parseInt(cells[3].textContent.trim(),10) : null,
        price: cells[4].textContent.trim().replace('$',''),
        description: cells[5].textContent.trim()
      };
      openEdit(item);
    } else if(btn.dataset.action==='del'){
      deleteService(id);
    }
  });

  searchBox.addEventListener('input', debounce(fetchServices, 400));
  btnAdd.addEventListener('click', openAdd);
  btnBulk.addEventListener('click', ()=>{ document.getElementById('bulkFile').value=''; document.getElementById('bulkStatus').textContent=''; bulkModal.show(); });
  btnSaveService.addEventListener('click', saveService);

  document.getElementById('btnUploadCsv').addEventListener('click', async ()=>{
    const fileInput = document.getElementById('bulkFile');
    if(!fileInput.files.length){ alert('Choose a CSV file first'); return; }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const bulkStatus = document.getElementById('bulkStatus');
    bulkStatus.textContent = 'Uploading...';
    try{
      const res = await fetch(API_BASE + '/global-services/bulk-upload', { method:'POST', headers:{ 'Authorization':'Bearer '+token }, body: formData });
      const data = await res.json();
      if(!res.ok) throw new Error(data.detail || 'Upload failed');
      bulkStatus.textContent = `Inserted: ${data.inserted}, Updated: ${data.updated}`;
      fetchServices();
    }catch(err){
      bulkStatus.textContent = 'Error: ' + err.message;
    }
  });

  function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); } }

  function init(){
    console.log('[GlobalServices] init called');
    templateCsv();
    fetchServices();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
