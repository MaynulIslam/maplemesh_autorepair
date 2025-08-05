from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserType(str, Enum):
    CUSTOMER = "customer"
    TECHNICIAN = "technician"

# Customer Registration Models
class CustomerRegistration(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str
    dob: str                        # ✓ matches frontend
    address_line_1: str             # ✓ matches frontend
    address_line_2: Optional[str] = None
    city: str
    province: str                   # ✓ matches frontend
    postal_code: str                # ✓ matches frontend
    country: str
    phone: str                      # ✓ matches frontend
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    vehicle_color: str              # ✓ matches frontend
    vehicle_description: str

# Technician Registration Models
class TechnicianRegistration(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str
    phone: str                      # ✓ matches frontend
    dob: str                        # ✓ matches frontend
    business_name: str
    business_address: str
    city: str
    province: str                   # ✓ matches frontend
    postal_code: str                # ✓ matches frontend
    country: str
    years_experience: int           # ✓ matches frontend
    is_certified: str
    certification_number: Optional[str] = None
    certification_authority: Optional[str] = None
    certification_expiry: Optional[str] = None
    areas_of_expertise: List[str] = []
    service_radius: int

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    user_type: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Google OAuth Models
class GoogleLoginRequest(BaseModel):
    credential: str

class GoogleSignupRequest(BaseModel):
    credential: str
    user_type: str

class ProfileUpdateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    province: str
    postal_code: str
    country: str

class ProfileResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    username: str
    email: str
    phone: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    province: str
    postal_code: str
    country: str
    member_since: str
    membership_level: str = "Bronze"
    loyalty_points: int = 0

# Vehicle Models
class VehicleCreate(BaseModel):
    make: str
    model: str
    year: int
    color: Optional[str] = None
    license_plate: Optional[str] = None
    last_service_date: Optional[str] = None
    description: Optional[str] = None

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    license_plate: Optional[str] = None
    last_service_date: Optional[str] = None
    description: Optional[str] = None

class VehicleResponse(BaseModel):
    vehicle_id: str
    make: str
    model: str
    year: int
    color: Optional[str] = None
    license_plate: Optional[str] = None
    last_service_date: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class VehicleListResponse(BaseModel):
    vehicles: List[VehicleResponse]