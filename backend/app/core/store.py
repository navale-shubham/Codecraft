"""
In-memory seed store and runtime repository for CivicPulse API.
Enables reliable, rapid demo startup while matching the relational models.
"""
from datetime import datetime, timedelta

class SeedStore:
    def __init__(self):
        self.organization = {
            "id": "org_mmmc_01",
            "name": "Mumbai Metropolitan Municipal Corporation",
            "code": "MMMC",
            "description": "Apex municipal governing authority for civic infrastructure.",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "status": "ACTIVE"
        }
        self.departments = [
            {"id": "dept_roads", "name": "Roads & Bridges Department", "code": "ROADS", "description": "Responsible for asphalt roads, potholes, flyovers, and pedestrian footpaths.", "email": "roads@mmmc.gov.in", "phone": "+91 22 2269 1101", "status": "ACTIVE", "wardIds": ["w_12", "w_14", "w_7", "w_9", "w_18"]},
            {"id": "dept_water", "name": "Water Supply & Sewerage", "code": "WATER", "description": "Responsible for potable drinking water, pipelines, leaks, and drainage.", "email": "water@mmmc.gov.in", "phone": "+91 22 2269 1102", "status": "ACTIVE", "wardIds": ["w_12", "w_14", "w_7", "w_9", "w_18"]},
            {"id": "dept_waste", "name": "Solid Waste Management", "code": "WASTE", "description": "Collection, processing, street sweeping, and sanitary landfill operations.", "email": "waste@mmmc.gov.in", "phone": "+91 22 2269 1103", "status": "ACTIVE", "wardIds": ["w_12", "w_14", "w_7", "w_9", "w_18"]},
            {"id": "dept_power", "name": "Electricity & Street Lighting", "code": "LIGHT", "description": "Street lights, high mast towers, electrical safety, and signal poles.", "email": "lighting@mmmc.gov.in", "phone": "+91 22 2269 1104", "status": "ACTIVE", "wardIds": ["w_12", "w_14", "w_7", "w_9", "w_18"]},
            {"id": "dept_health", "name": "Public Health & Sanitation", "code": "HEALTH", "description": "Vector control, mosquito breeding prevention, food safety, and public hygiene.", "email": "health@mmmc.gov.in", "phone": "+91 22 2269 1105", "status": "ACTIVE", "wardIds": ["w_12", "w_14", "w_7", "w_9", "w_18"]}
        ]
        self.wards = [
            {"id": "w_12", "name": "Ward 12 - Bandra West", "code": "W12", "description": "Bandra, Khar, Linking Road & Carter Road coastal belt", "status": "ACTIVE"},
            {"id": "w_14", "name": "Ward 14 - Andheri East", "code": "W14", "description": "MIDC, Chakala, Marol Industrial & Metro transit zone", "status": "ACTIVE"},
            {"id": "w_7", "name": "Ward 7 - Dadar Central", "code": "W7", "description": "Shivaji Park, Gokhale Road & Commercial hubs", "status": "ACTIVE"},
            {"id": "w_9", "name": "Ward 9 - Colaba Waterfront", "code": "W9", "description": "Historic district, Cuffe Parade & Gateway of India", "status": "ACTIVE"},
            {"id": "w_18", "name": "Ward 18 - Powai Hills", "code": "W18", "description": "Lake promenade, Hiranandani & Tech corridor", "status": "ACTIVE"}
        ]
        self.categories = [
            {"id": "cat_pothole", "name": "Potholes & Road Cavity", "parentId": "cat_roads", "departmentId": "dept_roads", "departmentName": "Roads & Bridges Department", "icon": "Hammer", "status": "ACTIVE"},
            {"id": "cat_footpath", "name": "Damaged Footpath / Sidewalk", "parentId": "cat_roads", "departmentId": "dept_roads", "departmentName": "Roads & Bridges Department", "icon": "Footprints", "status": "ACTIVE"},
            {"id": "cat_waterleak", "name": "Pipeline Water Leakage", "parentId": "cat_water", "departmentId": "dept_water", "departmentName": "Water Supply & Sewerage", "icon": "Droplet", "status": "ACTIVE"},
            {"id": "cat_contaminated", "name": "Contaminated Drinking Water", "parentId": "cat_water", "departmentId": "dept_water", "departmentName": "Water Supply & Sewerage", "icon": "AlertTriangle", "status": "ACTIVE"},
            {"id": "cat_garbage", "name": "Overflowing Garbage Dumpster", "parentId": "cat_waste", "departmentId": "dept_waste", "departmentName": "Solid Waste Management", "icon": "Trash2", "status": "ACTIVE"},
            {"id": "cat_streetlight", "name": "Streetlight Not Working", "parentId": "cat_power", "departmentId": "dept_power", "departmentName": "Electricity & Street Lighting", "icon": "LightbulbOff", "status": "ACTIVE"},
            {"id": "cat_mosquito", "name": "Mosquito Stagnation & Dengue Risk", "parentId": "cat_health", "departmentId": "dept_health", "departmentName": "Public Health & Sanitation", "icon": "Bug", "status": "ACTIVE"}
        ]
        self.users = [
            {"id": "usr_citizen_01", "firstName": "Rahul", "lastName": "Sharma", "email": "rahul@example.com", "phone": "+91 98765 43210", "role": "CITIZEN", "wardId": "w_12", "status": "ACTIVE"},
            {"id": "usr_sup_roads", "firstName": "Priya", "lastName": "Deshmukh", "email": "priya.roads@mmmc.gov.in", "phone": "+91 98111 22334", "role": "SUPERVISOR", "departmentId": "dept_roads", "status": "ACTIVE"},
            {"id": "usr_field_roads", "firstName": "Amit", "lastName": "Patel", "email": "amit.patel@mmmc.gov.in", "phone": "+91 98222 33445", "role": "FIELD_STAFF", "departmentId": "dept_roads", "status": "ACTIVE"},
            {"id": "usr_sup_water", "firstName": "Rajesh", "lastName": "Varma", "email": "rajesh.water@mmmc.gov.in", "phone": "+91 98333 44556", "role": "SUPERVISOR", "departmentId": "dept_water", "status": "ACTIVE"},
            {"id": "usr_field_water", "firstName": "Sunita", "lastName": "Nair", "email": "sunita.water@mmmc.gov.in", "phone": "+91 98444 55667", "role": "FIELD_STAFF", "departmentId": "dept_water", "status": "ACTIVE"},
            {"id": "usr_admin_01", "firstName": "Dr. Sunita", "lastName": "Rao", "email": "commissioner@mmmc.gov.in", "phone": "+91 98000 11223", "role": "ORG_ADMIN", "organizationId": "org_mmmc_01", "status": "ACTIVE"}
        ]
        self.issues = [
            {
                "id": "iss_101",
                "issueNumber": "CIV-2026-001245",
                "title": "Severe crater-sized pothole on S.V. Road near National College",
                "description": "Massive pothole spanning half the vehicular lane, creating severe risk for two-wheelers and night traffic.",
                "status": "IN_PROGRESS",
                "priority": "HIGH",
                "categoryId": "cat_pothole",
                "categoryName": "Potholes & Road Cavity",
                "departmentId": "dept_roads",
                "departmentName": "Roads & Bridges Department",
                "wardId": "w_12",
                "wardName": "Ward 12 - Bandra West",
                "citizenId": "usr_citizen_01",
                "citizenName": "Rahul Sharma",
                "assignedTo": "usr_field_roads",
                "assigneeName": "Amit Patel",
                "latitude": 19.0622,
                "longitude": 72.8358,
                "address": "Opposite National College, S.V. Road, Bandra West, Mumbai 400050",
                "reportedAt": (datetime.utcnow() - timedelta(hours=14)),
                "dueAt": (datetime.utcnow() + timedelta(hours=10)),
                "media": [
                    {
                        "id": "med_1",
                        "mediaType": "IMAGE",
                        "fileUrl": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60",
                        "thumbnailUrl": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&auto=format&fit=crop&q=60",
                        "createdAt": datetime.utcnow() - timedelta(hours=14)
                    }
                ],
                "comments": [
                    {
                        "id": "comm_1",
                        "issueId": "iss_101",
                        "userId": "usr_sup_roads",
                        "userName": "Priya Deshmukh (Supervisor)",
                        "userRole": "SUPERVISOR",
                        "comment": "Assigned to road maintenance squad 4. Cold mix asphalt dispatched.",
                        "isInternal": False,
                        "createdAt": datetime.utcnow() - timedelta(hours=8)
                    }
                ],
                "timeline": [
                    {"oldStatus": None, "newStatus": "REPORTED", "changedBy": "usr_citizen_01", "changedByName": "Rahul Sharma", "reason": "Initial citizen complaint registered.", "createdAt": datetime.utcnow() - timedelta(hours=14)},
                    {"oldStatus": "REPORTED", "newStatus": "UNDER_REVIEW", "changedBy": "usr_sup_roads", "changedByName": "Priya Deshmukh", "reason": "Jurisdiction verified for Bandra maintenance crew.", "createdAt": datetime.utcnow() - timedelta(hours=10)},
                    {"oldStatus": "UNDER_REVIEW", "newStatus": "ASSIGNED", "changedBy": "usr_sup_roads", "changedByName": "Priya Deshmukh", "reason": "Assigned to Field Specialist Amit Patel.", "createdAt": datetime.utcnow() - timedelta(hours=8)},
                    {"oldStatus": "ASSIGNED", "newStatus": "IN_PROGRESS", "changedBy": "usr_field_roads", "changedByName": "Amit Patel", "reason": "Work crew arrived on site; cordoning lane.", "createdAt": datetime.utcnow() - timedelta(hours=4)}
                ]
            },
            {
                "id": "iss_102",
                "issueNumber": "CIV-2026-001246",
                "title": "Major potable water main leaking clean water onto pavement",
                "description": "High pressure pipe leakage flooding the pedestrian walkway and wasting thousands of liters of treated water.",
                "status": "RESOLUTION_PENDING",
                "priority": "CRITICAL",
                "categoryId": "cat_waterleak",
                "categoryName": "Pipeline Water Leakage",
                "departmentId": "dept_water",
                "departmentName": "Water Supply & Sewerage",
                "wardId": "w_14",
                "wardName": "Ward 14 - Andheri East",
                "citizenId": "usr_citizen_01",
                "citizenName": "Rahul Sharma",
                "assignedTo": "usr_field_water",
                "assigneeName": "Sunita Nair",
                "latitude": 19.1136,
                "longitude": 72.8697,
                "address": "Near Chakala Metro Station, Andheri-Kurla Road, Mumbai 400093",
                "reportedAt": (datetime.utcnow() - timedelta(hours=5)),
                "dueAt": (datetime.utcnow() - timedelta(hours=1)),
                "evidenceMediaUrl": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=60",
                "resolutionDescription": "Welded flange seal replaced on 300mm pipe; pressure tested stable.",
                "resolutionType": "REPAIRED",
                "media": [
                    {
                        "id": "med_2",
                        "mediaType": "IMAGE",
                        "fileUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=800&auto=format&fit=crop&q=60",
                        "createdAt": datetime.utcnow() - timedelta(hours=5)
                    }
                ],
                "comments": [],
                "timeline": [
                    {"oldStatus": None, "newStatus": "REPORTED", "changedBy": "usr_citizen_01", "changedByName": "Rahul Sharma", "reason": "Citizen reported water gushing onto road.", "createdAt": datetime.utcnow() - timedelta(hours=5)},
                    {"oldStatus": "REPORTED", "newStatus": "ASSIGNED", "changedBy": "usr_sup_water", "changedByName": "Rajesh Varma", "reason": "Emergency plumber team dispatched.", "createdAt": datetime.utcnow() - timedelta(hours=4)},
                    {"oldStatus": "ASSIGNED", "newStatus": "IN_PROGRESS", "changedBy": "usr_field_water", "changedByName": "Sunita Nair", "reason": "Excavation and valve isolation underway.", "createdAt": datetime.utcnow() - timedelta(hours=3)},
                    {"oldStatus": "IN_PROGRESS", "newStatus": "RESOLUTION_PENDING", "changedBy": "usr_field_water", "changedByName": "Sunita Nair", "reason": "Pipe joint repaired; awaiting supervisor audit.", "createdAt": datetime.utcnow() - timedelta(minutes=45)}
                ]
            },
            {
                "id": "iss_103",
                "issueNumber": "CIV-2026-001247",
                "title": "Overflowing waste dumpster attracting stray dogs & odor",
                "description": "Commercial waste container not emptied for 4 days, garbage spilling over road curb.",
                "status": "RESOLVED",
                "priority": "MEDIUM",
                "categoryId": "cat_garbage",
                "categoryName": "Overflowing Garbage Dumpster",
                "departmentId": "dept_waste",
                "departmentName": "Solid Waste Management",
                "wardId": "w_7",
                "wardName": "Ward 7 - Dadar Central",
                "citizenId": "usr_citizen_01",
                "citizenName": "Rahul Sharma",
                "latitude": 19.0178,
                "longitude": 72.8478,
                "address": "Gokhale Road North, near Shivaji Park gate 3, Dadar West",
                "reportedAt": (datetime.utcnow() - timedelta(days=2)),
                "resolvedAt": (datetime.utcnow() - timedelta(hours=6)),
                "evidenceMediaUrl": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60",
                "resolutionDescription": "Compactor truck cleared 3.5 metric tons. Bin disinfected with lime wash.",
                "resolutionType": "CLEANED",
                "citizenVerified": None,
                "media": [
                    {
                        "id": "med_3",
                        "mediaType": "IMAGE",
                        "fileUrl": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60",
                        "createdAt": datetime.utcnow() - timedelta(days=2)
                    }
                ],
                "comments": [],
                "timeline": [
                    {"oldStatus": None, "newStatus": "REPORTED", "changedBy": "usr_citizen_01", "changedByName": "Rahul Sharma", "reason": "Reported.", "createdAt": datetime.utcnow() - timedelta(days=2)},
                    {"oldStatus": "REPORTED", "newStatus": "IN_PROGRESS", "changedBy": "system", "changedByName": "Sanitation Fleet", "reason": "Vehicle assigned.", "createdAt": datetime.utcnow() - timedelta(days=1)},
                    {"oldStatus": "IN_PROGRESS", "newStatus": "RESOLVED", "changedBy": "system", "changedByName": "Sanitation Fleet", "reason": "Compactor truck completed clearance.", "createdAt": datetime.utcnow() - timedelta(hours=6)}
                ]
            }
        ]
        self.notifications = [
            {"id": "notif_1", "userId": "usr_citizen_01", "issueId": "iss_103", "title": "Issue Resolved", "message": "Your report CIV-2026-001247 has been marked Resolved. Please verify and confirm.", "type": "ISSUE_RESOLVED", "isRead": False, "createdAt": datetime.utcnow() - timedelta(hours=6)},
            {"id": "notif_2", "userId": "usr_citizen_01", "issueId": "iss_101", "title": "Field Work In Progress", "message": "Road maintenance crew has commenced repair on CIV-2026-001245.", "type": "ISSUE_STATUS_CHANGED", "isRead": True, "createdAt": datetime.utcnow() - timedelta(hours=4)},
            {"id": "notif_3", "userId": "usr_field_roads", "issueId": "iss_101", "title": "New Assignment", "message": "Pothole repair at Bandra West assigned to you by Priya Deshmukh.", "type": "ISSUE_ASSIGNED", "isRead": False, "createdAt": datetime.utcnow() - timedelta(hours=8)}
        ]

store = SeedStore()
