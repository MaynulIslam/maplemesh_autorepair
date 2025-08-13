import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'info', duration: 2500 });

  const close = useCallback(() => setState(s => ({ ...s, open: false })), []);

  const show = useCallback((message, severity = 'info', duration = 2500) => {
    setState({ open: true, message, severity, duration });
  }, []);

  const api = useMemo(() => ({
    show,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'error', duration),
    info: (msg, duration) => show(msg, 'info', duration),
    warning: (msg, duration) => show(msg, 'warning', duration)
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.duration}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={close} elevation={6} variant="filled" severity={state.severity} sx={{ width: '100%' }}>
          {state.message}
        </MuiAlert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToastCtx = () => useContext(ToastContext);
