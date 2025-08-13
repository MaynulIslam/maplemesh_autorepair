from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import pathlib, os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
try:
    from Backend.models import CustomerRegistration, TechnicianRegistration, UserLogin, UserResponse, Token, VehicleCreate, VehicleUpdate, VehicleResponse, VehicleListResponse
    from Backend.auth_utils import hash_password, verify_password, create_access_token, verify_token
    from Backend.db_config import user_auth_collection, customer_profile_collection, technician_profile_collection, client, vehicles_collection, customer_service_list_collection, db
except ModuleNotFoundError:
    from models import CustomerRegistration, TechnicianRegistration, UserLogin, UserResponse, Token, VehicleCreate, VehicleUpdate, VehicleResponse, VehicleListResponse
    from auth_utils import hash_password, verify_password, create_access_token, verify_token
    from db_config import user_auth_collection, customer_profile_collection, technician_profile_collection, client, vehicles_collection, customer_service_list_collection, db
from datetime import datetime, timezone
from bson import ObjectId
import logging
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import csv, io
from pymongo import ReturnDocument

app = FastAPI(title="MapleMesh AutoRepair API", version="1.0.0")

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "Frontend" / "dist"
print(f"[Frontend] Dist path: {FRONTEND_DIST} exists? {FRONTEND_DIST.exists()}")

# REMOVE (or comment out) this old line:
# app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
else:
    print("[Frontend] Build not found. Run: cd Frontend && npm run build")

# Configure CORS (restrict to React dev + future production host)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# ===================== MODELS (Local to this file) =====================
class EmailCheckRequest(BaseModel):
    email: EmailStr

class UsernameCheckRequest(BaseModel):
    username: str

class CheckResponse(BaseModel):
    exists: bool

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

# ===================== AUTH UTILS / DEPENDENCIES =====================
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id}  # (Keep this shape consistently)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===================== AUTH ROUTES =====================

@app.post("/api/auth/check-email", response_model=CheckResponse)
async def check_email_exists(payload: EmailCheckRequest):
    exists = user_auth_collection.find_one({"email": payload.email}) is not None
    return CheckResponse(exists=exists)

@app.post("/api/auth/check-username", response_model=CheckResponse)
async def check_username_exists(payload: UsernameCheckRequest):
    exists = user_auth_collection.find_one({"username": payload.username}) is not None
    return CheckResponse(exists=exists)

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        # current_user has {'user_id': ...}
        user = user_auth_collection.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            user_type=user["user_type"],
            created_at=user["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get user info error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== CUSTOMER PROFILE ENDPOINTS =====================
@app.get("/api/customer/profile", response_model=ProfileResponse)
async def get_customer_profile(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["user_id"]
        auth_doc = user_auth_collection.find_one({"_id": ObjectId(user_id)})
        if not auth_doc:
            raise HTTPException(status_code=404, detail="User not found")
        if auth_doc.get("user_type") != "customer":
            raise HTTPException(status_code=403, detail="Not a customer account")

        profile_doc = customer_profile_collection.find_one({"user_id": user_id})
        # Auto-create minimal profile if missing to avoid 404 on first visit
        if not profile_doc:
            now = datetime.now(timezone.utc)
            empty_profile = {
                "user_id": user_id,
                "personal_information": {
                    "first_name": "",
                    "last_name": "",
                    "username": auth_doc.get("username", ""),
                    "phone_number": ""
                },
                "address_information": {
                    "address_line1": "",
                    "address_line2": None,
                    "city": "",
                    "province_state": "",
                    "postal_zip_code": "",
                    "country": ""
                },
                "created_at": now,
                "updated_at": now
            }
            customer_profile_collection.insert_one(empty_profile)
            profile_doc = empty_profile

        pi = profile_doc.get("personal_information", {})
        ai = profile_doc.get("address_information", {})
        member_since_dt = auth_doc.get("created_at") or profile_doc.get("created_at")
        if isinstance(member_since_dt, datetime):
            member_since = str(member_since_dt.year)
        else:
            member_since = datetime.now(timezone.utc).strftime("%Y")
        return ProfileResponse(
            user_id=user_id,
            first_name=pi.get("first_name", ""),
            last_name=pi.get("last_name", ""),
            username=pi.get("username", auth_doc.get("username", "")),
            email=auth_doc.get("email", ""),
            phone=pi.get("phone_number", ""),
            address_line_1=ai.get("address_line1", ""),
            address_line_2=ai.get("address_line2"),
            city=ai.get("city", ""),
            province=ai.get("province_state", ""),
            postal_code=ai.get("postal_zip_code", ""),
            country=ai.get("country", ""),
            member_since=member_since
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get customer profile error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/api/customer/profile", response_model=ProfileResponse)
async def update_customer_profile(payload: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["user_id"]
        auth_doc = user_auth_collection.find_one({"_id": ObjectId(user_id)})
        if not auth_doc:
            raise HTTPException(status_code=404, detail="User not found")
        if auth_doc.get("user_type") != "customer":
            raise HTTPException(status_code=403, detail="Not a customer account")

        # email change uniqueness check
        new_email = payload.email.strip().lower()
        old_email = (auth_doc.get("email", "") or "").lower()
        if new_email != old_email:
            if user_auth_collection.find_one({"email": new_email}):
                raise HTTPException(status_code=400, detail="Email already in use")
            user_auth_collection.update_one({"_id": auth_doc["_id"]}, {"$set": {"email": new_email, "updated_at": datetime.now(timezone.utc)}})

        # Ensure profile exists (create if missing)
        profile_doc = customer_profile_collection.find_one({"user_id": user_id})
        if not profile_doc:
            customer_profile_collection.insert_one({
                "user_id": user_id,
                "personal_information": {},
                "address_information": {},
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })

        # Update profile document
        customer_profile_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "personal_information.first_name": payload.first_name.strip(),
                "personal_information.last_name": payload.last_name.strip(),
                "personal_information.phone_number": payload.phone.strip(),
                # username immutable for now
                "address_information.address_line1": payload.address_line_1.strip(),
                "address_information.address_line2": payload.address_line_2.strip() if payload.address_line_2 else None,
                "address_information.city": payload.city.strip(),
                "address_information.province_state": payload.province.strip(),
                "address_information.postal_zip_code": payload.postal_code.strip(),
                "address_information.country": payload.country.strip(),
                "updated_at": datetime.now(timezone.utc)
            }}
        )

        # Return updated profile
        updated_profile = customer_profile_collection.find_one({"user_id": user_id})
        pi = updated_profile.get("personal_information", {})
        ai = updated_profile.get("address_information", {})
        member_since_dt = auth_doc.get("created_at") or updated_profile.get("created_at")
        if isinstance(member_since_dt, datetime):
            member_since = str(member_since_dt.year)
        else:
            member_since = datetime.now(timezone.utc).strftime("%Y")
        auth_doc = user_auth_collection.find_one({"_id": ObjectId(user_id)})  # refresh email
        return ProfileResponse(
            user_id=user_id,
            first_name=pi.get("first_name", ""),
            last_name=pi.get("last_name", ""),
            username=pi.get("username", auth_doc.get("username", "")),
            email=auth_doc.get("email", ""),
            phone=pi.get("phone_number", ""),
            address_line_1=ai.get("address_line1", ""),
            address_line_2=ai.get("address_line2"),
            city=ai.get("city", ""),
            province=ai.get("province_state", ""),
            postal_code=ai.get("postal_zip_code", ""),
            country=ai.get("country", ""),
            member_since=member_since
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Update customer profile error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/register/customer")
async def register_customer(customer_data: CustomerRegistration):
    print(f"Received customer registration request for email: {customer_data.email}")
    print(f"Customer data: {customer_data.dict()}")  # Add this line
    """Register a new customer"""
    try:
        # Check if user already exists
        existing_user = user_auth_collection.find_one({"email": customer_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Hash password
        hashed_password = hash_password(customer_data.password)
        
        # Create user authentication record
        user_auth_doc = {
            "email": customer_data.email,
            "username": customer_data.username,  # ✓ Add this line
            "password_hash": hashed_password,
            "user_type": "customer",
            "is_verified": False,
            "created_at": datetime.now(timezone.utc),  # ✓ Fixed
            "updated_at": datetime.now(timezone.utc),  # ✓ Fixed
            "last_login": None,
            "is_active": True
        }
        
        # Insert user authentication
        auth_result = user_auth_collection.insert_one(user_auth_doc)
        user_id = auth_result.inserted_id
        
        # Create customer profile
        customer_profile_doc = {
            "user_id": str(user_id),
            "personal_information": {
                "first_name": customer_data.first_name,
                "last_name": customer_data.last_name,
                "date_of_birth": customer_data.dob,              # ✓ Fixed
                "username": customer_data.username,              # ✓ Fixed
                "phone_number": customer_data.phone              # ✓ Fixed
            },
            "address_information": {
                "address_line1": customer_data.address_line_1,   # ✓ Fixed
                "address_line2": customer_data.address_line_2,   # ✓ Fixed
                "city": customer_data.city,
                "province_state": customer_data.province,        # ✓ Fixed
                "postal_zip_code": customer_data.postal_code,    # ✓ Fixed
                "country": customer_data.country
            },
            "vehicle_information": {
                "make": customer_data.vehicle_make,              # ✓ Fixed
                "model": customer_data.vehicle_model,            # ✓ Fixed
                "year": customer_data.vehicle_year,              # ✓ Fixed
                "color": customer_data.vehicle_color,            # ✓ Fixed
                "vehicle_description": customer_data.vehicle_description
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        customer_profile_collection.insert_one(customer_profile_doc)
        
        return {
            "message": "Customer registered successfully",
            "user_id": str(user_id),
            "user_type": "customer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Customer registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/register/technician")
async def register_technician(technician_data: TechnicianRegistration):
    print(f"Received technician registration request for email: {technician_data.email}")
    """Register a new technician"""
    try:
        # Check if user already exists
        existing_user = user_auth_collection.find_one({"email": technician_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Hash password
        hashed_password = hash_password(technician_data.password)
        
        # Create user authentication record
        user_auth_doc = {
            "email": technician_data.email,
            "username": technician_data.username,  # ✓ Add this line
            "password_hash": hashed_password,
            "user_type": "technician",
            "is_verified": False,
            "created_at": datetime.now(timezone.utc),  # ✓ Fixed
            "updated_at": datetime.now(timezone.utc),  # ✓ Fixed
            "last_login": None,
            "is_active": True
        }
        
        # Insert user authentication
        auth_result = user_auth_collection.insert_one(user_auth_doc)
        user_id = auth_result.inserted_id
        
        # Create technician profile
        technician_profile_doc = {
            "user_id": str(user_id),
            "personal_information": {
                "first_name": technician_data.first_name,
                "last_name": technician_data.last_name,
                "date_of_birth": technician_data.dob,            # ✓ Fixed
                "phone_number": technician_data.phone            # ✓ Fixed
            },
            "business_information": {
                "business_name": technician_data.business_name,
                "years_of_experience": technician_data.years_experience,  # ✓ Fixed
                "business_address": technician_data.business_address,
                "postal_zip_code": technician_data.postal_code,          # ✓ Fixed
                "city": technician_data.city,
                "province_state": technician_data.province,              # ✓ Fixed
                "country": technician_data.country
            },
            "professional_information": {
                "is_certified": technician_data.is_certified,
                "certification_number": technician_data.certification_number,
                "certification_authority": technician_data.certification_authority,
                "certification_expiry": technician_data.certification_expiry,
                "expertise_areas": technician_data.areas_of_expertise,
                "years_of_experience_auto": technician_data.years_experience,
                "service_radius": technician_data.service_radius
            },
            "business_metrics": {
                "rating": 0.0,
                "total_jobs": 0,
                "is_approved": False
            },
            "created_at": datetime.now(timezone.utc),  # ✓ Fixed
            "updated_at": datetime.now(timezone.utc)   # ✓ Fixed
        }
        
        technician_profile_collection.insert_one(technician_profile_doc)
        
        return {
            "message": "Technician registered successfully",
            "user_id": str(user_id),
            "user_type": "technician",
            "approval_required": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Technician registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    print(f"Login attempt for email: {user_credentials.email}")  # Add this line
    """Authenticate user and return token"""
    try:
        # Find user by email
        user = user_auth_collection.find_one({"email": user_credentials.email})
        
        if not user or not verify_password(user_credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        if not user["is_active"]:
            raise HTTPException(
                status_code=401,
                detail="Account is deactivated"
            )
        
        # Update last login
        user_auth_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}  # ✓ Fixed
        )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["_id"]), "email": user["email"], "user_type": user["user_type"]}
        )
        
        # Prepare user response
        user_response = UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            user_type=user["user_type"],
            created_at=user["created_at"]
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        # current_user has {'user_id': ...}
        user = user_auth_collection.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            user_type=user["user_type"],
            created_at=user["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get user info error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Vehicle Management Endpoints

@app.get("/api/customer/vehicles", response_model=VehicleListResponse)
async def get_customer_vehicles(current_user: dict = Depends(get_current_user)):
    """Get all vehicles for the current customer"""
    try:
        print(f"Getting vehicles for user ID: {current_user['user_id']}")
        
        # Find all vehicles for this user
        vehicles_cursor = vehicles_collection.find({"user_id": current_user["user_id"]})
        vehicles = []
        
        for vehicle in vehicles_cursor:
            vehicles.append(VehicleResponse(
                vehicle_id=str(vehicle["_id"]),
                make=vehicle["make"],
                model=vehicle["model"],
                year=vehicle["year"],
                color=vehicle.get("color"),
                license_plate=vehicle.get("license_plate"),
                last_service_date=vehicle.get("last_service_date"),
                description=vehicle.get("description"),
                created_at=vehicle["created_at"],
                updated_at=vehicle["updated_at"]
            ))
        
        return VehicleListResponse(vehicles=vehicles)
        
    except Exception as e:
        logging.error(f"Get vehicles error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/customer/vehicles")
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new vehicle for the current customer"""
    try:
        print(f"Creating vehicle for user ID: {current_user['user_id']}")
        print(f"Vehicle data: {vehicle_data.dict()}")
        
        # Create vehicle document
        vehicle_doc = {
            "user_id": current_user["user_id"],
            "make": vehicle_data.make,
            "model": vehicle_data.model,
            "year": vehicle_data.year,
            "color": vehicle_data.color,
            "license_plate": vehicle_data.license_plate,
            "last_service_date": vehicle_data.last_service_date,
            "description": vehicle_data.description,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Insert vehicle
        result = vehicles_collection.insert_one(vehicle_doc)
        
        return {
            "message": "Vehicle added successfully",
            "vehicle_id": str(result.inserted_id)
        }
        
    except Exception as e:
        logging.error(f"Create vehicle error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/api/customer/vehicles/{vehicle_id}")
async def update_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a vehicle for the current customer"""
    try:
        print(f"Updating vehicle {vehicle_id} for user ID: {current_user['user_id']}")
        
        # Check if vehicle exists and belongs to user
        vehicle = vehicles_collection.find_one({
            "_id": ObjectId(vehicle_id),
            "user_id": current_user["user_id"]
        })
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Build update data (only include non-None values)
        update_data = {"updated_at": datetime.now(timezone.utc)}
        
        for field, value in vehicle_data.dict().items():
            if value is not None:
                update_data[field] = value
        
        # Update vehicle
        vehicles_collection.update_one(
            {"_id": ObjectId(vehicle_id)},
            {"$set": update_data}
        )
        
        return {"message": "Vehicle updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Update vehicle error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/customer/vehicles/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a vehicle for the current customer"""
    try:
        print(f"Deleting vehicle {vehicle_id} for user ID: {current_user['user_id']}")
        
        # Check if vehicle exists and belongs to user
        vehicle = vehicles_collection.find_one({
            "_id": ObjectId(vehicle_id),
            "user_id": current_user["user_id"]
        })
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Delete vehicle
        vehicles_collection.delete_one({"_id": ObjectId(vehicle_id)})
        
        return {"message": "Vehicle deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Delete vehicle error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Models for Service Requests
class ServiceCatalogItem(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    estimated_minutes: Optional[int] = None

class ServiceRequestCreate(BaseModel):
    vehicle_id: str
    odometer_km: int
    services: List[str]  # list of catalog item ids or names
    description: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    id: str
    user_id: str
    vehicle_id: str
    odometer_km: int
    services: List[str]
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

class ServiceListResponse(BaseModel):
    services: List[ServiceRequestResponse]

# In-memory catalog for now (can be swapped to external API later)
SERVICE_CATALOG: List[ServiceCatalogItem] = [
    ServiceCatalogItem(id="oil_change", name="Engine Oil & Filter Change", category="Maintenance", estimated_minutes=45),
    ServiceCatalogItem(id="tire_rotation", name="Tire Rotation", category="Tires", estimated_minutes=30),
    ServiceCatalogItem(id="brake_inspection", name="Brake Inspection", category="Brakes", estimated_minutes=40),
    ServiceCatalogItem(id="brake_pads", name="Brake Pads Replacement", category="Brakes", estimated_minutes=90),
    ServiceCatalogItem(id="battery_check", name="Battery Test & Replacement", category="Electrical", estimated_minutes=30),
    ServiceCatalogItem(id="alignment", name="Wheel Alignment", category="Tires", estimated_minutes=60),
    ServiceCatalogItem(id="ac_service", name="A/C Service & Recharge", category="HVAC", estimated_minutes=60),
    ServiceCatalogItem(id="engine_diagnostics", name="Engine Diagnostics", category="Diagnostics", estimated_minutes=60),
    ServiceCatalogItem(id="transmission_service", name="Transmission Service", category="Powertrain", estimated_minutes=120),
    ServiceCatalogItem(id="coolant_flush", name="Coolant Flush", category="Fluids", estimated_minutes=60),
]

# ================= Global Services (Admin Catalog) =================
class GlobalServiceBase(BaseModel):
    service_id: str
    service_name: str
    main_category: str
    time_takes: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None

class GlobalServiceCreate(GlobalServiceBase):
    pass

class GlobalServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    main_category: Optional[str] = None
    time_takes: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None

class GlobalService(GlobalServiceBase):
    id: str

class GlobalServiceList(BaseModel):
    items: List[GlobalService]

global_services_collection = db.global_services
try:
    global_services_collection.create_index("service_id", unique=True)
except Exception as e:  # index may already exist
    logging.warning(f"Index creation on global_services failed or already exists: {e}")

def _doc_to_global_service(doc: dict) -> GlobalService:
    return GlobalService(
        id=str(doc.get("_id")),
        service_id=doc.get("service_id"),
        service_name=doc.get("service_name"),
        main_category=doc.get("main_category"),
        time_takes=doc.get("time_takes"),
        price=doc.get("price"),
        description=doc.get("description")
    )

@app.get("/api/global-services", response_model=GlobalServiceList)
async def list_global_services(q: Optional[str] = None, skip: int = 0, limit: int = 200, current_user: dict = Depends(get_current_user)):
    criteria = {}
    if q:
        regex = {"$regex": q, "$options": "i"}
        criteria = {"$or": [
            {"service_id": regex},
            {"service_name": regex},
            {"main_category": regex},
            {"description": regex}
        ]}
    cursor = global_services_collection.find(criteria).skip(max(skip, 0)).limit(min(limit, 500))
    items = [_doc_to_global_service(d) for d in cursor]
    return GlobalServiceList(items=items)

@app.post("/api/global-services", response_model=GlobalService)
async def create_global_service(payload: GlobalServiceCreate, current_user: dict = Depends(get_current_user)):
    if global_services_collection.find_one({"service_id": payload.service_id}):
        raise HTTPException(status_code=400, detail="service_id already exists")
    doc = payload.dict()
    global_services_collection.insert_one(doc)
    inserted = global_services_collection.find_one({"service_id": payload.service_id})
    return _doc_to_global_service(inserted)

@app.put("/api/global-services/{service_id}", response_model=GlobalService)
async def update_global_service(service_id: str, payload: GlobalServiceUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = global_services_collection.find_one_and_update(
        {"service_id": service_id}, {"$set": update_data}, return_document=ReturnDocument.AFTER
    )
    if not res:
        raise HTTPException(status_code=404, detail="Service not found")
    return _doc_to_global_service(res)

@app.delete("/api/global-services/{service_id}")
async def delete_global_service(service_id: str, current_user: dict = Depends(get_current_user)):
    res = global_services_collection.delete_one({"service_id": service_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Deleted"}

@app.post("/api/global-services/bulk-upload")
async def bulk_upload_global_services(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files are supported currently")
    content = await file.read()
    try:
        text = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        text = content.decode('latin-1')
    reader = csv.DictReader(io.StringIO(text))
    required_cols = {"service_id", "service_name", "main_category", "time_takes", "price", "description"}
    fieldnames_normalized = {c.strip(): c for c in (reader.fieldnames or [])}
    missing = required_cols - set(fieldnames_normalized.keys())
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(sorted(missing))}")
    inserted = 0
    updated = 0
    for row in reader:
        sid = (row.get('service_id') or '').strip()
        if not sid:
            continue
        try:
            time_val = row.get('time_takes')
            time_takes = int(time_val) if time_val and time_val.strip() else None
        except ValueError:
            time_takes = None
        try:
            price_val = row.get('price')
            price = float(price_val) if price_val and price_val.strip() else None
        except ValueError:
            price = None
        doc = {
            'service_id': sid,
            'service_name': (row.get('service_name') or '').strip(),
            'main_category': (row.get('main_category') or '').strip(),
            'time_takes': time_takes,
            'price': price,
            'description': (row.get('description') or '').strip() or None
        }
        existing = global_services_collection.find_one({'service_id': sid})
        if existing:
            global_services_collection.update_one({'service_id': sid}, {'$set': doc})
            updated += 1
        else:
            global_services_collection.insert_one(doc)
            inserted += 1
    return {"inserted": inserted, "updated": updated}

@app.get("/api/services/catalog", response_model=List[ServiceCatalogItem])
async def get_service_catalog():
    return SERVICE_CATALOG

@app.get("/api/customer/services", response_model=ServiceListResponse)
async def list_customer_services(current_user: dict = Depends(get_current_user)):
    try:
        cursor = customer_service_list_collection.find({"user_id": current_user["user_id"]}).sort("created_at", -1)
        items: List[ServiceRequestResponse] = []
        async_like_list = list(cursor)
        for doc in async_like_list:
            items.append(ServiceRequestResponse(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                vehicle_id=doc["vehicle_id"],
                odometer_km=doc.get("odometer_km", 0),
                services=doc.get("services", []),
                description=doc.get("description"),
                status=doc.get("status", "Pending"),
                created_at=doc.get("created_at", datetime.now(timezone.utc)),
                updated_at=doc.get("updated_at", datetime.now(timezone.utc))
            ))
        return ServiceListResponse(services=items)
    except Exception as e:
        logging.error(f"List services error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/customer/services", response_model=ServiceRequestResponse)
async def create_customer_service(req: ServiceRequestCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Validate vehicle belongs to user
        vehicle = vehicles_collection.find_one({"_id": ObjectId(req.vehicle_id), "user_id": current_user["user_id"]})
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        now = datetime.now(timezone.utc)
        doc = {
            "user_id": current_user["user_id"],
            "vehicle_id": req.vehicle_id,
            "odometer_km": req.odometer_km,
            "services": req.services,
            "description": req.description,
            "status": "Pending",
            "created_at": now,
            "updated_at": now
        }
        result = customer_service_list_collection.insert_one(doc)
        created = customer_service_list_collection.find_one({"_id": result.inserted_id})
        return ServiceRequestResponse(
            id=str(created["_id"]),
            user_id=created["user_id"],
            vehicle_id=created["vehicle_id"],
            odometer_km=created.get("odometer_km", 0),
            services=created.get("services", []),
            description=created.get("description"),
            status=created.get("status", "Pending"),
            created_at=created.get("created_at", now),
            updated_at=created.get("updated_at", now)
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Create service error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/logout")
async def logout():
    return {"message": "Logged out"}

@app.get("/")
def serve_index_root():
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Frontend build not found")

@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    if "." in full_path:  # e.g. missing asset
        raise HTTPException(status_code=404, detail="Asset not found")
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Frontend build not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)