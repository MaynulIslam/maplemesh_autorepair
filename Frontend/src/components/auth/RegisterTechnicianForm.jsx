import { useState, useMemo } from 'react';
import {
  Grid, TextField, Button, Stack, Paper, Typography, Alert, Divider, FormControlLabel, Checkbox, IconButton, MenuItem, Select, InputLabel, FormControl, Chip, Box, RadioGroup, Radio, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../api/client';
import { useToastCtx } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  'Personal',
  'Account',
  'Business',
  'Professional',
  'Review'
];

export default function RegisterTechnicianForm() {
  const nav = useNavigate();
  const toast = useToastCtx();
  const [form, setForm] = useState({
    first_name:'', last_name:'', dob:'', phone:'', username:'',
    email:'', password:'', confirm_password:'',
    business_name:'', years_experience:'', business_address:'', postal_code:'', city:'', province:'', country:'',
    is_certified:'no', certification_number:'', certification_authority:'', certification_expiry:'',
    areas_of_expertise:[], service_radius:'', terms:false
  });
  const [err,setErr]=useState('');
  const [ok,setOk]=useState(false);
  const [loading,setLoading]=useState(false);
  const [activeStep,setActiveStep]=useState(0);
  const [attempted,setAttempted]=useState({});
  const [completedSteps,setCompletedSteps]=useState({}); // marks steps only after user advances
  const [emailCheck,setEmailCheck]=useState('idle');
  const [usernameCheck,setUsernameCheck]=useState('idle');
  const [debounceTimer,setDebounceTimer]=useState(null);
  const set = k => e => setForm(f=>({...f,[k]: e.target.type==='checkbox'? e.target.checked : e.target.value}));
  const scheduleCheck = (field, value) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(async () => {
      try {
        if (!value) { field==='email'?setEmailCheck('idle'):setUsernameCheck('idle'); return; }
        field==='email'?setEmailCheck('checking'):setUsernameCheck('checking');
        const endpoint = field==='email' ? '/api/auth/check-email' : '/api/auth/check-username';
        const payload = field==='email' ? { email:value } : { username:value };
        const { data } = await api.post(endpoint, payload);
        if (data.exists) { field==='email'?setEmailCheck('taken'):setUsernameCheck('taken'); }
        else { field==='email'?setEmailCheck('available'):setUsernameCheck('available'); }
      } catch { field==='email'?setEmailCheck('idle'):setUsernameCheck('idle'); }
    }, 500);
    setDebounceTimer(timer);
  };
  const onEmailChange = e => { set('email')(e); scheduleCheck('email', e.target.value.trim()); };
  const onUsernameChange = e => { set('username')(e); scheduleCheck('username', e.target.value.trim()); };

  const passwordStrength = (pwd) => {
    if(!pwd) return {label:'Too weak', score:0};
    let score = 0;
    if(pwd.length >= 8) score++;
    if(/[A-Z]/.test(pwd)) score++;
    if(/[0-9]/.test(pwd)) score++;
    if(/[^A-Za-z0-9]/.test(pwd)) score++;
    const labels = ['Too weak','Weak','Fair','Good','Strong'];
    return {label: labels[score] || 'Too weak', score};
  };
  const strength = passwordStrength(form.password);

  const errors = useMemo(()=>{
    const e = {};
    if(activeStep>=0){
      if(!form.first_name) e.first_name='Required';
      if(!form.last_name) e.last_name='Required';
      if(!form.dob) e.dob='Required';
      if(!form.phone) e.phone='Required';
      if(!form.username) e.username='Required';
    }
    if(activeStep>=1){
      if(!form.email) e.email='Required';
      if(!form.password) e.password='Required';
      if(!form.confirm_password) e.confirm_password='Required';
      if(form.password && form.confirm_password && form.password!==form.confirm_password) e.confirm_password='Passwords do not match';
    }
    if(activeStep>=2){
      if(!form.business_name) e.business_name='Required';
      if(!form.years_experience) e.years_experience='Required';
      if(!form.business_address) e.business_address='Required';
      if(!form.city) e.city='Required';
      if(!form.province) e.province='Required';
      if(!form.postal_code) e.postal_code='Required';
      if(!form.country) e.country='Required';
    }
    if(activeStep>=3){
      if(form.is_certified==='yes' && !form.certification_number) e.certification_number='Required';
    }
    if(activeStep>=4){
      if(!form.terms) e.terms='You must agree to the terms';
    }
    return e;
  },[form,activeStep]);

  const stepValid = (step)=>{
    const keys = Object.keys(errors);
    switch(step){
      case 0: return !keys.some(k=>['first_name','last_name','dob','phone','username'].includes(k));
      case 1: return !keys.some(k=>['email','password','confirm_password'].includes(k));
      case 2: return !keys.some(k=>['business_name','years_experience','business_address','city','province','postal_code','country'].includes(k));
      case 3: return !keys.some(k=>['certification_number'].includes(k));
      case 4: return !keys.some(k=>['terms'].includes(k));
      default: return true;
    }
  };

  const next = ()=>{
    if(!stepValid(activeStep)) { setAttempted(a=>({...a,[activeStep]:true})); return; }
    setCompletedSteps(cs=>({...cs,[activeStep]:true}));
    setActiveStep(s=>Math.min(s+1, STEPS.length-1));
  };
  const back = ()=> setActiveStep(s=>Math.max(0,s-1));

  const submit = async ()=>{
    setErr(''); setOk(false); setLoading(true);
    if(!stepValid(4)){ setErr('Please fix validation errors'); setLoading(false); return; }
    try {
      const payload = {
        ...form,
        years_experience: form.years_experience ? parseInt(form.years_experience,10) : 0,
        service_radius: form.service_radius ? parseInt(form.service_radius,10) : 0,
        areas_of_expertise: form.areas_of_expertise,
        is_certified: form.is_certified === 'yes' ? 'true' : 'false'
      };
  await api.post('/api/auth/register/technician', payload);
      setOk(true);
  toast?.success('Registration submitted');
      setTimeout(()=>nav('/login'), 1300);
    } catch (ex) {
  const msg = ex.response?.data?.detail || 'Registration failed';
  setErr(msg);
  toast?.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <Stack alignItems="center" sx={{ mt:6, px:2 }}>
      <Paper sx={{ p:5, width:'100%', maxWidth:1100, position:'relative' }}>
        <IconButton aria-label="Close" onClick={()=>nav('/login')} size="small" sx={{ position:'absolute', top:12, right:12 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" fontWeight={600} mb={1}>Technician Registration</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">
          Provide professional and business details for approval.
        </Typography>
        <Stack spacing={3}>
          {err && <Alert severity="error">{err}</Alert>}
          {ok && <Alert severity="success">Submitted. You will be redirected...</Alert>}
          <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
            {/* Step 0 Personal */}
            <Step completed={!!completedSteps[0]}>
              <StepLabel StepIconComponent={CustomStepIcon}>Personal Information</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
      <Grid item xs={12} sm={6}><TextField label="First Name" value={form.first_name} onChange={set('first_name')} fullWidth size="small" error={attempted[0] && !!errors.first_name} helperText={attempted[0] && errors.first_name}/></Grid>
      <Grid item xs={12} sm={6}><TextField label="Last Name" value={form.last_name} onChange={set('last_name')} fullWidth size="small" error={attempted[0] && !!errors.last_name} helperText={attempted[0] && errors.last_name}/></Grid>
      <Grid item xs={12} sm={4}><TextField label="Date of Birth" type="date" value={form.dob} onChange={set('dob')} InputLabelProps={{ shrink: true }} fullWidth size="small" error={attempted[0] && !!errors.dob} helperText={attempted[0] && errors.dob}/></Grid>
      <Grid item xs={12} sm={4}><TextField label="Phone" value={form.phone} onChange={set('phone')} fullWidth size="small" error={attempted[0] && !!errors.phone} helperText={attempted[0] && errors.phone}/></Grid>
      <Grid item xs={12} sm={4}><TextField label="Username" value={form.username} onChange={onUsernameChange} fullWidth size="small" error={(attempted[0] && !!errors.username) || usernameCheck==='taken'} helperText={(attempted[0] && errors.username) || (usernameCheck==='taken' ? 'Username already registered' : usernameCheck==='checking' ? 'Checking...' : usernameCheck==='available' ? 'Username available' : '')}/></Grid>
                </Grid>
                <StepNav next={next} disableNext={!stepValid(0)} />
              </StepContent>
            </Step>
            {/* Step 1 Account */}
            <Step completed={!!completedSteps[1]}>
              <StepLabel StepIconComponent={CustomStepIcon}>Account Credentials</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
      <Grid item xs={12} sm={6}><TextField label="Email" type="email" value={form.email} onChange={onEmailChange} fullWidth size="small" error={(attempted[1] && !!errors.email) || emailCheck==='taken'} helperText={(attempted[1] && errors.email) || (emailCheck==='taken' ? 'Email already registered' : emailCheck==='checking' ? 'Checking...' : emailCheck==='available' ? 'Email available' : '')}/></Grid>
      <Grid item xs={12} sm={3}><TextField label="Password" type="password" value={form.password} onChange={set('password')} fullWidth size="small" error={attempted[1] && !!errors.password} helperText={attempted[1] && errors.password}/></Grid>
      <Grid item xs={12} sm={3}><TextField label="Confirm" type="password" value={form.confirm_password} onChange={set('confirm_password')} fullWidth size="small" error={attempted[1] && !!errors.confirm_password} helperText={attempted[1] && errors.confirm_password}/></Grid>
                  {form.password && <Grid item xs={12}><Typography variant="caption" color={strength.score<2?'error.main':'text.secondary'}>Strength: {strength.label}</Typography></Grid>}
                </Grid>
                <StepNav back={back} next={next} disableNext={!stepValid(1)} />
              </StepContent>
            </Step>
            {/* Step 2 Business */}
            <Step completed={!!completedSteps[2]}>
              <StepLabel StepIconComponent={CustomStepIcon}>Business Information</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField label="Business Name" value={form.business_name} onChange={set('business_name')} fullWidth size="small" error={attempted[2] && !!errors.business_name} helperText={attempted[2] && errors.business_name}/></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Years Experience" value={form.years_experience} onChange={set('years_experience')} fullWidth size="small" error={attempted[2] && !!errors.years_experience} helperText={attempted[2] && errors.years_experience}/></Grid>
                  <Grid item xs={12}><TextField label="Business Address" value={form.business_address} onChange={set('business_address')} fullWidth size="small" error={attempted[2] && !!errors.business_address} helperText={attempted[2] && errors.business_address}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="City" value={form.city} onChange={set('city')} fullWidth size="small" error={attempted[2] && !!errors.city} helperText={attempted[2] && errors.city}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Province/State" value={form.province} onChange={set('province')} fullWidth size="small" error={attempted[2] && !!errors.province} helperText={attempted[2] && errors.province}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Postal Code" value={form.postal_code} onChange={set('postal_code')} fullWidth size="small" error={attempted[2] && !!errors.postal_code} helperText={attempted[2] && errors.postal_code}/></Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" error={attempted[2] && !!errors.country}>
                      <InputLabel id="country-label">Country</InputLabel>
                      <Select labelId="country-label" label="Country" value={form.country} onChange={set('country')}>
                        {['Canada','United States','Mexico','United Kingdom','Australia'].map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                      {attempted[2] && errors.country && <Typography variant="caption" color="error">{errors.country}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="radius-label">Service Radius (km)</InputLabel>
                      <Select labelId="radius-label" label="Service Radius (km)" value={form.service_radius} onChange={set('service_radius')}>
                        {['10','25','50','75','100','150'].map(r=> <MenuItem key={r} value={r}>{r}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <StepNav back={back} next={next} disableNext={!stepValid(2)} />
              </StepContent>
            </Step>
            {/* Step 3 Professional */}
            <Step completed={!!completedSteps[3]}>
              <StepLabel StepIconComponent={CustomStepIcon}>Professional Information</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{mb:1}}>Are you a certified technician?</Typography>
                    <RadioGroup row value={form.is_certified} onChange={set('is_certified')}>
                      <FormControlLabel value="yes" control={<Radio size="small"/>} label="Yes" />
                      <FormControlLabel value="no" control={<Radio size="small"/>} label="No" />
                    </RadioGroup>
                  </Grid>
          {form.is_certified==='yes' && (
                    <>
            <Grid item xs={12} sm={4}><TextField label="Certification #" value={form.certification_number} onChange={set('certification_number')} fullWidth size="small" error={attempted[3] && !!errors.certification_number} helperText={attempted[3] && errors.certification_number}/></Grid>
                      <Grid item xs={12} sm={4}><TextField label="Authority" value={form.certification_authority} onChange={set('certification_authority')} fullWidth size="small"/></Grid>
                      <Grid item xs={12} sm={4}><TextField label="Expiry" type="date" value={form.certification_expiry} onChange={set('certification_expiry')} InputLabelProps={{ shrink: true }} fullWidth size="small"/></Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="expertise-label">Select Areas of Expertise</InputLabel>
                      <Select
                        labelId="expertise-label"
                        multiple
                        value={form.areas_of_expertise}
                        label="Select Areas of Expertise"
                        onChange={e=> setForm(f=>({...f, areas_of_expertise: e.target.value}))}
                        renderValue={(selected)=> (
                          <Box sx={{display:'flex', flexWrap:'wrap', gap:0.5}}>
                            {selected.map((v)=><Chip key={v} label={v} size="small"/>) }
                          </Box>
                        )}
                      >
                        {['Engine','Brakes','Diagnostics','Electrical','Tires','Suspension','Transmission','HVAC'].map(opt=> <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Removed summary Paper showing duplicate expertise list */}
                </Grid>
                <StepNav back={back} next={next} disableNext={!stepValid(3)} />
              </StepContent>
            </Step>
            {/* Step 4 Review */}
            <Step completed={ok}>
              <StepLabel StepIconComponent={CustomStepIcon}>Review & Submit</StepLabel>
              <StepContent>
                <Paper variant="outlined" sx={{p:2, mb:2}}>
                  <Typography variant="subtitle2" gutterBottom>Summary</Typography>
                  <Grid container spacing={1}>
                    {Object.entries({
                      'Name': form.first_name+" "+form.last_name,
                      'Username': form.username,
                      'Email': form.email,
                      'Phone': form.phone,
                      'Business': form.business_name,
                      'Experience (yrs)': form.years_experience,
                      'City': form.city,
                      'Province': form.province,
                      'Country': form.country,
                      'Certified': form.is_certified,
                      'Expertise': form.areas_of_expertise.join(', ') || '—'
                    }).map(([k,v])=> (
                      <Grid key={k} item xs={12} sm={6}><Typography variant="caption"><strong>{k}:</strong> {v || '—'}</Typography></Grid>
                    ))}
                  </Grid>
                </Paper>
                <FormControlLabel control={<Checkbox checked={form.terms} onChange={set('terms')} />} label={<Typography variant="caption">I agree to the <u>Terms of Service</u>, <u>Privacy Policy</u> and <u>Service Provider Guidelines</u></Typography>} />
                {errors.terms && <Typography variant="caption" color="error" display="block" sx={{mt:0.5}}>{errors.terms}</Typography>}
                <Box sx={{mt:2, display:'flex', gap:1}}>
                  <Button onClick={back} disabled={loading}>Back</Button>
                  <Button variant="contained" disabled={loading || emailCheck==='taken' || usernameCheck==='taken' || emailCheck==='checking' || usernameCheck==='checking'} onClick={submit}>{loading? 'Submitting...' : 'Submit Registration'}</Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Stack>
      </Paper>
    </Stack>
  );
}

function Section({ title, children }) {
  return (
    <Stack spacing={1}>
      <Divider textAlign="left">
        <Typography variant="subtitle2" color="text.secondary">{title.toUpperCase()}</Typography>
      </Divider>
      {children}
    </Stack>
  );
}

// Reusable mini section (kept for potential reuse inside steps)
function InnerSection({ title, children }) {
  return (
    <Paper variant="outlined" sx={{p:2, mb:2}}>
      <Typography variant="subtitle2" sx={{mb:1, fontWeight:600, color:'text.secondary'}}>{title}</Typography>
      <Divider sx={{mb:2}} />
      {children}
    </Paper>
  );
}

function StepNav({ back, next, disableNext }) {
  return (
    <Box sx={{mt:2, display:'flex', gap:1}}>
      {back && <Button onClick={back}>Back</Button>}
      {next && <Button variant="contained" onClick={next} disabled={disableNext}>Next</Button>}
    </Box>
  );
}

// Custom step icon: gray circle with number, turns green when completed
function CustomStepIcon(props){
  const { active, completed, className, icon } = props;
  return (
    <Box className={className} sx={{
      width:32, height:32, borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:14, fontWeight:600,
      bgcolor: completed ? 'success.main' : 'grey.300',
      color: completed ? '#fff' : 'text.primary',
      border: active && !completed ? '2px solid' : '1px solid',
      borderColor: active && !completed ? 'primary.main' : 'grey.400',
      transition:'all .25s'
    }}>
      {icon}
    </Box>
  );
}