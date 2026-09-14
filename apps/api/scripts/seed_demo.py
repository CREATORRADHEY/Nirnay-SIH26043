"""Idempotent development & demo dataset seed script.

Run manually:
    python apps/api/scripts/seed_demo.py
"""
import os
import sys

# Ensure apps/api is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.hei_capability import HEICapability

def seed_demo_data():
    print("=== Starting NIRNAY Idempotent Demo Seed ===")
    db: Session = SessionLocal()
    try:
        # 1. Reviewer Actor
        reviewer = db.query(Actor).filter(Actor.display_name == "Nodal Reviewer (SIH Demo)").first()
        if not reviewer:
            reviewer = Actor(
                display_name="Nodal Reviewer (SIH Demo)",
                is_active=True,
            )
            db.add(reviewer)
            db.commit()
            db.refresh(reviewer)
            print(f"[CREATED] Reviewer Actor ID: {reviewer.id}")
        else:
            print(f"[EXISTING] Reviewer Actor ID: {reviewer.id}")

        # 2. HEI Organizations & Active Capabilities
        sample_heis = [
            {
                "name": "Birla Institute of Technology, Mesra",
                "type": "HEI",
                "district": "Ranchi",
                "state": "Jharkhand",
                "capabilities": [
                    {
                        "capability_type": "RESEARCH_LAB",
                        "name": "Water Quality & Hydrogeology Center",
                        "discipline": "Environmental Engineering",
                        "description": "Specialized laboratory for groundwater testing, aquifer modeling, and community water filtration.",
                    },
                    {
                        "capability_type": "INCUBATOR",
                        "name": "GreenTech Innovation Cell",
                        "discipline": "Sustainable Infrastructure",
                        "description": "Incubation support for low-cost rural water treatment hardware.",
                    },
                ],
            },
            {
                "name": "National Institute of Technology, Jamshedpur",
                "type": "HEI",
                "district": "East Singhbhum",
                "state": "Jharkhand",
                "capabilities": [
                    {
                        "capability_type": "FACULTY_EXPERTISE",
                        "name": "Renewable Energy & Solar Thermal Group",
                        "discipline": "Electrical Engineering",
                        "description": "R&D expertise in off-grid solar cold storage and thermal insulation for agricultural produce.",
                    },
                ],
            },
            {
                "name": "IIT (ISM) Dhanbad",
                "type": "HEI",
                "district": "Dhanbad",
                "state": "Jharkhand",
                "capabilities": [
                    {
                        "capability_type": "FIELD_CAPABILITY",
                        "name": "Geo-Spatial Aquifer Mapping Unit",
                        "discipline": "Geophysics",
                        "description": "Satellite & GIS subsurface water table mapping across semi-urban mining belts.",
                    },
                ],
            },
        ]

        for hei_data in sample_heis:
            org = db.query(Organization).filter(Organization.name == hei_data["name"]).first()
            if not org:
                org = Organization(
                    name=hei_data["name"],
                    organization_type=hei_data["type"],
                    district=hei_data["district"],
                    state=hei_data["state"],
                    is_active=True,
                )
                db.add(org)
                db.commit()
                db.refresh(org)
                print(f"[CREATED] HEI Organization: {org.name} ({org.id})")
            else:
                print(f"[EXISTING] HEI Organization: {org.name} ({org.id})")

            for cap_data in hei_data["capabilities"]:
                cap = db.query(HEICapability).filter(
                    HEICapability.organization_id == org.id,
                    HEICapability.name == cap_data["name"]
                ).first()
                if not cap:
                    cap = HEICapability(
                        organization_id=org.id,
                        capability_type=cap_data["capability_type"],
                        name=cap_data["name"],
                        discipline=cap_data["discipline"],
                        description=cap_data["description"],
                        is_active=True,
                    )
                    db.add(cap)
                    db.commit()
                    db.refresh(cap)
                    print(f"   └── [CREATED] Capability: {cap.name} ({cap.id})")
                else:
                    print(f"   └── [EXISTING] Capability: {cap.name} ({cap.id})")

        print("=== Seed Completed Successfully ===")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
