import { useState, useMemo } from 'react';
import {
  Grid, TextField, Button, Stack, Paper, Typography, Alert, Divider, IconButton, Autocomplete, Stepper, Step, StepLabel, StepContent, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

// Lightweight static datasets for instant suggestions (can be expanded later)
const CAR_MAKES = [
  'Toyota','Honda','Ford','Chevrolet','Nissan','BMW','Mercedes-Benz','Volkswagen','Hyundai','Kia',
  'Audi','Lexus','Subaru','Mazda','Jeep','Dodge','Ram','GMC','Volvo','Porsche','Jaguar','Land Rover',
  'Tesla','Mitsubishi','Infiniti','Acura','Mini','Chrysler','Buick','Cadillac','Ferrari','Lamborghini',
  'Bentley','Rolls-Royce','Aston Martin','Alfa Romeo','Peugeot','Renault','Citroën','Skoda'
];
// Popular models subset (not exhaustive). Keys lowercase make.
const CAR_MODELS = {
  'toyota':['Corolla','Camry','RAV4','Highlander','Prius','Tacoma','Tundra','Yaris'],
  'honda':['Civic','Accord','CR-V','Pilot','Fit','HR-V','Odyssey'],
  'ford':['F-150','Mustang','Explorer','Escape','Focus','Edge','Ranger','Bronco'],
  'chevrolet':['Silverado','Equinox','Malibu','Tahoe','Camaro','Traverse','Trailblazer'],
  'nissan':['Altima','Sentra','Rogue','Pathfinder','Frontier','Murano'],
  'bmw':['3 Series','5 Series','X3','X5','X1','4 Series'],
  'mercedes-benz':['C-Class','E-Class','GLC','GLE','A-Class','S-Class'],
  'volkswagen':['Golf','Jetta','Passat','Tiguan','Atlas','Polo'],
  'hyundai':['Elantra','Sonata','Tucson','Santa Fe','Kona','Palisade'],
  'kia':['Sorento','Sportage','Soul','Seltos','Telluride','Rio'],
  'audi':['A4','A6','Q5','Q7','A3','Q3'],
  'lexus':['RX','NX','ES','IS','UX','GX'],
  'subaru':['Outback','Forester','Impreza','Crosstrek','Legacy','Ascent'],
  'mazda':['CX-5','Mazda3','Mazda6','CX-30','CX-9'],
  'jeep':['Wrangler','Grand Cherokee','Cherokee','Compass','Renegade','Gladiator'],
  'tesla':['Model S','Model 3','Model X','Model Y'],
  'porsche':['911','Cayenne','Macan','Panamera','Taycan'],
  'volvo':['XC90','XC60','XC40','S60','V60'],
  'jaguar':['F-Pace','XE','XF','E-Pace','I-Pace'],
  'land rover':['Range Rover','Discovery','Defender','Range Rover Sport','Evoque']
};
const COLOR_OPTIONS = ['Black','White','Silver','Gray','Blue','Red','Green','Yellow','Orange','Brown','Beige','Gold','Purple','Maroon','Navy','Teal','Other'];
// Year options (current year back to 1980)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({length: CURRENT_YEAR - 1979}, (_,i)=> String(CURRENT_YEAR - i));

const CUSTOMER_STEPS = ['Personal','Address','Vehicle','Review'];

export default function RegisterCustomerForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
  first_name:'', last_name:'', username:'', email:'', password:'', confirm_password:'',
    phone:'', dob:'', address_line_1:'', address_line_2:'',
    city:'', province:'', postal_code:'', country:'',
    vehicle_make:'', vehicle_model:'', vehicle_year:'', vehicle_color:'',
    vehicle_description:''
  });
  const [err,setErr]=useState('');
  const [ok,setOk]=useState(false);
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState('idle'); // idle | success | error
  const [fieldErrors,setFieldErrors]=useState({}); // global snapshot when submitting
  const [emailCheck,setEmailCheck]=useState('idle'); // idle | checking | available | taken
  const [usernameCheck,setUsernameCheck]=useState('idle');
  const [debounceTimer,setDebounceTimer]=useState(null);
  const [activeStep,setActiveStep]=useState(0);
  const [attempted,setAttempted]=useState({}); // tracks steps user tried to advance
  const [completedSteps,setCompletedSteps]=useState({});

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  // Debounced availability checks
  const scheduleCheck = (field, value) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(async () => {
      try {
        if (!value) {
          field==='email' ? setEmailCheck('idle') : setUsernameCheck('idle');
          return;
        }
        field==='email' ? setEmailCheck('checking') : setUsernameCheck('checking');
        const endpoint = field==='email' ? '/api/auth/check-email' : '/api/auth/check-username';
        const payload = field==='email' ? { email:value } : { username:value };
        const { data } = await api.post(endpoint, payload);
        if (data.exists) {
          field==='email' ? setEmailCheck('taken') : setUsernameCheck('taken');
        } else {
          field==='email' ? setEmailCheck('available') : setUsernameCheck('available');
        }
      } catch {
        field==='email' ? setEmailCheck('idle') : setUsernameCheck('idle');
      }
    }, 500);
    setDebounceTimer(timer);
  };

  const onEmailChange = e => { set('email')(e); scheduleCheck('email', e.target.value.trim()); };
  const onUsernameChange = e => { set('username')(e); scheduleCheck('username', e.target.value.trim()); };

  // Step-level validation map
  const stepErrors = useMemo(()=>{
    const fe = {};
    // Personal (0)
    if(activeStep>=0){
      if(!form.first_name) fe.first_name='Required';
      if(!form.last_name) fe.last_name='Required';
      if(!form.username) fe.username='Required';
      if(!form.password) fe.password='Required';
      if(!form.confirm_password) fe.confirm_password='Required';
      if(form.password && form.confirm_password && form.password!==form.confirm_password) fe.confirm_password='Passwords do not match';
      if(!form.email) fe.email='Required';
      if(!form.phone) fe.phone='Required';
      if(!form.dob) fe.dob='Required';
    }
    // Address (1)
    if(activeStep>=1){
      if(!form.address_line_1) fe.address_line_1='Required';
      if(!form.city) fe.city='Required';
      if(!form.province) fe.province='Required';
      if(!form.postal_code) fe.postal_code='Required';
      if(!form.country) fe.country='Required';
    }
    // Vehicle (2)
    if(activeStep>=2){
      if(!form.vehicle_make) fe.vehicle_make='Required';
      if(!form.vehicle_model) fe.vehicle_model='Required';
      if(!form.vehicle_year) fe.vehicle_year='Required';
      const yearNum = parseInt(form.vehicle_year,10);
      if(form.vehicle_year && (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()+1)) fe.vehicle_year='Invalid year';
    }
    return fe;
  },[form,activeStep]);

  const stepValid = (step)=>{
    const keys = Object.keys(stepErrors);
    switch(step){
      case 0: return !keys.some(k=>['first_name','last_name','username','password','confirm_password','email','phone','dob'].includes(k));
      case 1: return !keys.some(k=>['address_line_1','city','province','postal_code','country'].includes(k));
      case 2: return !keys.some(k=>['vehicle_make','vehicle_model','vehicle_year'].includes(k));
      case 3: return stepValid(0)&&stepValid(1)&&stepValid(2); // review depends on all
      default: return true;
    }
  };

  const next = ()=>{
    if(!stepValid(activeStep)) { setAttempted(a=>({...a,[activeStep]:true})); return; }
    setCompletedSteps(cs=>({...cs,[activeStep]:true}));
    setActiveStep(s=>Math.min(s+1, CUSTOMER_STEPS.length-1));
  };
  const back = ()=> setActiveStep(s=>Math.max(0,s-1));

  const submit = async ()=>{
    setErr(''); setOk(false); setStatus('idle'); setLoading(true); setFieldErrors({});
    // final comprehensive validation
    const fe = {};
    Object.assign(fe, stepErrors);
    if(Object.keys(fe).length){
      setFieldErrors(fe); setStatus('error'); setErr('Please fix highlighted fields.'); setLoading(false); return; }
    try {
      const yearNum = parseInt(form.vehicle_year,10);
      const payload = { ...form, vehicle_year: yearNum };
      await api.post('/api/auth/register/customer', payload);
      setOk(true); setStatus('success');
      setTimeout(()=>nav('/login'), 1200);
    } catch(ex){
      const detail = ex.response?.data?.detail;
      setErr(detail ? (typeof detail==='string'? detail : JSON.stringify(detail)) : 'Registration failed');
      setStatus('error');
    } finally { setLoading(false); }
  };

  return (
    <Stack alignItems="center" sx={{ mt:6, px:2 }}>
      <Paper sx={{ p:5, width:'100%', maxWidth:1000, position:'relative' }}>
        <IconButton aria-label="Close" onClick={()=>nav('/login')} size="small" sx={{ position:'absolute', top:12, right:12 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" fontWeight={600} mb={1}>Customer Registration</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">
          Provide your information to get started.
        </Typography>
        <Stack spacing={3}>
          {status==='error' && err && <Alert severity="error">Registration Unsuccessful: {err}</Alert>}
          {status==='success' && ok && <Alert severity="success">Registration Successful. Redirecting...</Alert>}
          <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
            {/* Step 0 Personal */}
            <Step completed={!!completedSteps[0]}>
              <StepLabel StepIconComponent={CustomerStepIcon}>Personal Information</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}><TextField label="First Name" value={form.first_name} onChange={set('first_name')} size="small" fullWidth error={attempted[0] && !!stepErrors.first_name} helperText={attempted[0] && stepErrors.first_name}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Last Name" value={form.last_name} onChange={set('last_name')} size="small" fullWidth error={attempted[0] && !!stepErrors.last_name} helperText={attempted[0] && stepErrors.last_name}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Username" value={form.username} onChange={onUsernameChange} size="small" fullWidth error={(attempted[0] && !!stepErrors.username) || usernameCheck==='taken'} helperText={(attempted[0] && stepErrors.username) || (usernameCheck==='taken' ? 'Username already registered' : usernameCheck==='checking' ? 'Checking...' : usernameCheck==='available' ? 'Username available' : '')}/></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Password" type="password" value={form.password} onChange={set('password')} size="small" fullWidth error={attempted[0] && !!stepErrors.password} helperText={attempted[0] && stepErrors.password}/></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Confirm Password" type="password" value={form.confirm_password} onChange={set('confirm_password')} size="small" fullWidth error={attempted[0] && !!stepErrors.confirm_password} helperText={attempted[0] && stepErrors.confirm_password}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Email" type="email" value={form.email} onChange={onEmailChange} size="small" fullWidth error={(attempted[0] && !!stepErrors.email) || emailCheck==='taken'} helperText={(attempted[0] && stepErrors.email) || (emailCheck==='taken' ? 'Email already registered' : emailCheck==='checking' ? 'Checking...' : emailCheck==='available' ? 'Email available' : '')}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Phone" value={form.phone} onChange={set('phone')} size="small" fullWidth error={attempted[0] && !!stepErrors.phone} helperText={attempted[0] && stepErrors.phone}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Date of Birth" type="date" value={form.dob} onChange={set('dob')} size="small" fullWidth InputLabelProps={{ shrink:true }} error={attempted[0] && !!stepErrors.dob} helperText={attempted[0] && stepErrors.dob}/></Grid>
                </Grid>
                <StepNav next={next} disableNext={!stepValid(0)} />
              </StepContent>
            </Step>
            {/* Step 1 Address */}
            <Step completed={!!completedSteps[1]}>
              <StepLabel StepIconComponent={CustomerStepIcon}>Address</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}><TextField label="Address Line 1" value={form.address_line_1} onChange={set('address_line_1')} size="small" fullWidth error={attempted[1] && !!stepErrors.address_line_1} helperText={attempted[1] && stepErrors.address_line_1}/></Grid>
                  <Grid item xs={12}><TextField label="Address Line 2" value={form.address_line_2} onChange={set('address_line_2')} size="small" fullWidth /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="City" value={form.city} onChange={set('city')} size="small" fullWidth error={attempted[1] && !!stepErrors.city} helperText={attempted[1] && stepErrors.city}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Province/State" value={form.province} onChange={set('province')} size="small" fullWidth error={attempted[1] && !!stepErrors.province} helperText={attempted[1] && stepErrors.province}/></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Postal Code" value={form.postal_code} onChange={set('postal_code')} size="small" fullWidth error={attempted[1] && !!stepErrors.postal_code} helperText={attempted[1] && stepErrors.postal_code}/></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Country" value={form.country} onChange={set('country')} size="small" fullWidth error={attempted[1] && !!stepErrors.country} helperText={attempted[1] && stepErrors.country}/></Grid>
                </Grid>
                <StepNav back={back} next={next} disableNext={!stepValid(1)} />
              </StepContent>
            </Step>
            {/* Step 2 Vehicle */}
            <Step completed={!!completedSteps[2]}>
              <StepLabel StepIconComponent={CustomerStepIcon}>Vehicle</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      size="small"
                      freeSolo
                      options={CAR_MAKES}
                      value={form.vehicle_make}
                      onInputChange={(e,v)=>setForm(f=>({...f, vehicle_make:v, vehicle_model:''}))}
                      onChange={(e,v)=>setForm(f=>({...f, vehicle_make:v||'', vehicle_model:''}))}
                      filterOptions={(opts, state)=>{
                        const q = state.inputValue.toLowerCase();
                        return opts.filter(o=>o.toLowerCase().includes(q)).slice(0,20);
                      }}
                      renderInput={(params)=><TextField {...params} label="Make" error={attempted[2] && !!stepErrors.vehicle_make} helperText={attempted[2] && stepErrors.vehicle_make}/>}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      size="small"
                      freeSolo
                      disabled={!form.vehicle_make}
                      options={(CAR_MODELS[form.vehicle_make?.toLowerCase()]||[])}
                      value={form.vehicle_model}
                      onInputChange={(e,v)=>setForm(f=>({...f, vehicle_model:v}))}
                      onChange={(e,v)=>setForm(f=>({...f, vehicle_model:v||''}))}
                      filterOptions={(opts, state)=>{
                        const q = state.inputValue.toLowerCase();
                        return opts.filter(o=>o.toLowerCase().includes(q)).slice(0,25);
                      }}
                      renderInput={(params)=><TextField {...params} label="Model" error={attempted[2] && !!stepErrors.vehicle_model} helperText={attempted[2] && stepErrors.vehicle_model}/>}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      size="small"
                      options={YEARS}
                      value={form.vehicle_year || ''}
                      onChange={(e,v)=>setForm(f=>({...f, vehicle_year: v||''}))}
                      renderInput={(params)=><TextField {...params} label="Year" error={attempted[2] && !!stepErrors.vehicle_year} helperText={attempted[2] && stepErrors.vehicle_year}/>}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      size="small"
                      freeSolo
                      options={COLOR_OPTIONS}
                      value={form.vehicle_color}
                      onInputChange={(e,v)=>setForm(f=>({...f, vehicle_color:v}))}
                      onChange={(e,v)=>setForm(f=>({...f, vehicle_color:v||''}))}
                      filterOptions={(opts, state)=>{
                        const q = state.inputValue.toLowerCase();
                        return opts.filter(o=>o.toLowerCase().includes(q)).slice(0,25);
                      }}
                      renderInput={(params)=><TextField {...params} label="Color" />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Vehicle Description"
                      value={form.vehicle_description}
                      onChange={(e)=>{
                        const v = e.target.value.slice(0,200);
                        setForm(f=>({...f, vehicle_description:v}));
                      }}
                      multiline
                      rows={3}
                      fullWidth
                      size="small"
                      inputProps={{maxLength:200}}
                      helperText={`${(form.vehicle_description||'').length}/200`}
                    />
                  </Grid>
                </Grid>
                <StepNav back={back} next={next} disableNext={!stepValid(2)} />
              </StepContent>
            </Step>
            {/* Step 3 Review */}
            <Step completed={ok}>
              <StepLabel StepIconComponent={CustomerStepIcon}>Review & Submit</StepLabel>
              <StepContent>
                <Paper variant="outlined" sx={{p:2, mb:2}}>
                  <Typography variant="subtitle2" gutterBottom>Summary</Typography>
                  <Grid container spacing={1}>
                    {Object.entries({
                      'Name': form.first_name+" "+form.last_name,
                      'Username': form.username,
                      'Email': form.email,
                      'Phone': form.phone,
                      'DOB': form.dob,
                      'City': form.city,
                      'Country': form.country,
                      'Vehicle': [form.vehicle_year, form.vehicle_make, form.vehicle_model].filter(Boolean).join(' ')
                    }).map(([k,v])=> (
                      <Grid key={k} item xs={12} sm={6}><Typography variant="caption"><strong>{k}:</strong> {v || '—'}</Typography></Grid>
                    ))}
                  </Grid>
                </Paper>
                {Object.keys(fieldErrors).length>0 && <Alert severity='error' sx={{mb:2}}>Please resolve remaining errors.</Alert>}
                <Box sx={{display:'flex', gap:1}}>
                  <Button onClick={back} disabled={loading}>Back</Button>
                  <Button variant='contained' disabled={loading || emailCheck==='taken' || usernameCheck==='taken' || emailCheck==='checking' || usernameCheck==='checking'} onClick={submit}>{loading? 'Submitting...' : 'Create Account'}</Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Stack>
      </Paper>
    </Stack>
  );
}

// Step navigation component
function StepNav({ back, next, disableNext }) {
  return (
    <Box sx={{mt:2, display:'flex', gap:1}}>
      {back && <Button onClick={back}>Back</Button>}
      {next && <Button variant='contained' onClick={next} disabled={disableNext}>Next</Button>}
    </Box>
  );
}

// Custom numbered icon (gray until completed, green after)
function CustomerStepIcon(props){
  const { active, completed, className, icon } = props;
  return (
    <Box className={className} sx={{
      width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:14, fontWeight:600,
      bgcolor: completed ? 'success.main' : 'grey.300',
      color: completed ? '#fff' : 'text.primary',
      border: active && !completed ? '2px solid' : '1px solid',
      borderColor: active && !completed ? 'primary.main' : 'grey.400',
      transition:'all .25s'
    }}>{icon}</Box>
  );
}