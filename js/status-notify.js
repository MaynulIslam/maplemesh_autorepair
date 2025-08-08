(function(){
  if (window.statusNotify) return;

  const style = document.createElement('style');
  style.textContent = `
  .sn-container{position:fixed;top:16px;right:16px;z-index:1060;display:flex;flex-direction:column;gap:10px}
  .sn-toast{min-width:280px;max-width:360px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:12px 14px;display:flex;gap:10px;align-items:flex-start;opacity:0;transform:translateY(-6px);transition:opacity .18s ease, transform .18s ease}
  .sn-toast.show{opacity:1;transform:translateY(0)}
  .sn-icon{width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%}
  .sn-title{font-weight:600;font-size:14px;color:#111;margin:0}
  .sn-msg{font-size:13px;color:#444;margin:2px 0 0}
  .sn-close{margin-left:auto;border:none;background:transparent;color:#888;cursor:pointer;font-size:16px;line-height:1}
  .sn-row{display:flex;gap:10px;align-items:flex-start}
  .sn-col{flex:1}
  .sn-loading .sn-icon{background:#e8f0fe;color:#1a73e8}
  .sn-success .sn-icon{background:#e6f4ea;color:#137333}
  .sn-error .sn-icon{background:#fce8e6;color:#c5221f}
  .sn-info .sn-icon{background:#eef3f8;color:#1967d2}
  .sn-spinner{width:16px;height:16px;border:2px solid #c6dafc;border-top-color:#1a73e8;border-radius:50%;animation:snspin 1s linear infinite}
  @keyframes snspin {to {transform: rotate(360deg)}}
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.className = 'sn-container';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));

  const toasts = new Map();
  let idSeq = 1;

  function iconFor(type, loading){
    if (loading) return '<span class="sn-spinner"></span>';
    if (type==='success') return '<span>✔</span>';
    if (type==='error') return '<span>✖</span>';
    return '<span>ℹ</span>';
  }

  function createToast(message, opts={}){
    const id = 'sn_'+(idSeq++);
    const { title = '', type = 'info', loading = false, duration } = opts;
    const el = document.createElement('div');
    el.className = `sn-toast sn-${loading ? 'loading' : type}`;
    el.innerHTML = `
      <div class="sn-row">
        <div class="sn-icon">${iconFor(type, loading)}</div>
        <div class="sn-col">
          ${title ? `<div class="sn-title">${title}</div>` : ''}
          <div class="sn-msg">${message}</div>
        </div>
        <button class="sn-close" aria-label="Close">×</button>
      </div>`;

    el.querySelector('.sn-close').addEventListener('click', ()=> hide(id));
    container.appendChild(el);
    requestAnimationFrame(()=> el.classList.add('show'));

    let timer = null;
    if (!loading) {
      const t = typeof duration === 'number' ? duration : (type==='success' ? 1800 : 2800);
      timer = setTimeout(()=> hide(id), t);
    }

    toasts.set(id, {el, timer});
    return id;
  }

  function hide(id){
    const ref = toasts.get(id);
    if (!ref) return;
    const { el, timer } = ref;
    if (timer) clearTimeout(timer);
    el.classList.remove('show');
    setTimeout(()=>{
      if (el.parentNode) el.parentNode.removeChild(el);
      toasts.delete(id);
    }, 180);
  }

  function update(id, message, type='info', opts={}){
    const ref = toasts.get(id);
    if (!ref) return;
    const { el, timer } = ref;
    if (timer) clearTimeout(timer);

    const { title, duration } = opts;
    const iconWrap = el.querySelector('.sn-icon');
    const msg = el.querySelector('.sn-msg');
    const titleEl = el.querySelector('.sn-title');

    el.className = `sn-toast sn-${type}`;
    iconWrap.innerHTML = iconFor(type, false);
    if (titleEl && title !== undefined) titleEl.textContent = title || '';
    else if (!titleEl && title) {
      const before = msg.parentElement;
      const t = document.createElement('div');
      t.className = 'sn-title';
      t.textContent = title;
      before.insertBefore(t, msg);
    }
    msg.textContent = message;

    const t = typeof duration === 'number' ? duration : (type==='success' ? 1800 : 2800);
    ref.timer = setTimeout(()=> hide(id), t);
  }

  function loading(message, opts={}){ return createToast(message, {...opts, type:'info', loading:true, duration: undefined}); }
  function success(message, opts={}){ return createToast(message, {...opts, type:'success', loading:false}); }
  function error(message, opts={}){ return createToast(message, {...opts, type:'error', loading:false}); }
  function info(message, opts={}){ return createToast(message, {...opts, type:'info', loading:false}); }

  function setButtonLoading(btn, text='Saving...'){
    if (!btn || btn.dataset.snLoading==='1') return;
    btn.dataset.snLoading='1';
    btn.dataset.snHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="sn-spinner" style="vertical-align:-2px;margin-right:8px"></span>${text}`;
  }
  function removeButtonLoading(btn){
    if (!btn || btn.dataset.snLoading!=='1') return;
    btn.disabled = false;
    btn.innerHTML = btn.dataset.snHtml || btn.innerHTML;
    delete btn.dataset.snLoading;
    delete btn.dataset.snHtml;
  }

  window.statusNotify = { loading, success, error, info, hide, update, setButtonLoading, removeButtonLoading };
})();
