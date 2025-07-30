from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from models import CustomerRegistration, TechnicianRegistration, UserLogin, UserResponse, Token
from auth_utils import hash_password, verify_password, create_access_token, verify_token
from db_config import user_auth_collection, customer_profile_collection, technician_profile_collection, client
from datetime import datetime, timezone
from bson import ObjectId
import logging
from pydantic import BaseModel

app = FastAPI(title="MapleMesh AutoRepair API", version="1.0.0")

# Database connection verification
def verify_db_connection():
    print("Connecting to Database...")
    try:
        # Try a simple command to check connection
        client.admin.command('ping')
        print("Database Connection successful.")
    except Exception as e:
        print(f"Database Connection failed: {e}")

# Call verification at startup
verify_db_connection()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

@app.get("/")
async def root():
    return {"message": "MapleMesh AutoRepair API is running!"}

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
        user = user_auth_collection.find_one({"_id": ObjectId(current_user["sub"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            user_type=user["user_type"],
            created_at=user["created_at"]
        )
    except Exception as e:
        logging.error(f"Get user info error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Add these new models at the top of your file
class EmailCheckRequest(BaseModel):
    email: str

class UsernameCheckRequest(BaseModel):
    username: str

class CheckResponse(BaseModel):
    exists: bool

# Add these endpoints before your existing endpoints
@app.post("/api/auth/check-email", response_model=CheckResponse)
async def check_email_exists(request: EmailCheckRequest):
    """Check if email already exists in database"""
    try:
        existing_user = user_auth_collection.find_one({"email": request.email})
        return CheckResponse(exists=existing_user is not None)
    except Exception as e:
        logging.error(f"Email check error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/check-username", response_model=CheckResponse)
async def check_username_exists(request: UsernameCheckRequest):
    """Check if username already exists in database"""
    try:
        existing_user = user_auth_collection.find_one({"username": request.username})
        return CheckResponse(exists=existing_user is not None)
    except Exception as e:
        logging.error(f"Username check error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Change port to 8001