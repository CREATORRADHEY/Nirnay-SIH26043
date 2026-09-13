from datetime import datetime, timezone
import unittest
import uuid

from app.models.actor import Actor
from app.models.base import Base
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership


class TestIdentityModels(unittest.TestCase):

    def test_models_import_without_side_effects(self) -> None:
        """Models can be imported without connecting to database or executing DDL."""
        self.assertEqual(Organization.__tablename__, "organizations")
        self.assertEqual(Actor.__tablename__, "actors")
        self.assertEqual(OrganizationMembership.__tablename__, "organization_memberships")

    def test_organization_instantiation(self) -> None:
        """Organization model can be instantiated with valid attributes and defaults."""
        org_id = uuid.uuid4()
        org = Organization(
            id=org_id,
            name="BIT Mesra Ranchi",
            organization_type="HEI",
            district="Ranchi",
            state="Jharkhand",
            is_active=True,
        )

        self.assertEqual(org.id, org_id)
        self.assertEqual(org.name, "BIT Mesra Ranchi")
        self.assertEqual(org.organization_type, "HEI")
        self.assertEqual(org.district, "Ranchi")
        self.assertEqual(org.state, "Jharkhand")
        self.assertTrue(org.is_active)

    def test_actor_instantiation_without_auth_fields(self) -> None:
        """Actor model represents auditable identity without auth credentials."""
        actor_id = uuid.uuid4()
        actor = Actor(
            id=actor_id,
            display_name="Dr. Rajesh Kumar",
            is_active=True,
        )

        self.assertEqual(actor.id, actor_id)
        self.assertEqual(actor.display_name, "Dr. Rajesh Kumar")
        self.assertTrue(actor.is_active)

        # Confirm no authentication fields exist
        self.assertFalse(hasattr(actor, "password"))
        self.assertFalse(hasattr(actor, "password_hash"))
        self.assertFalse(hasattr(actor, "email"))
        self.assertFalse(hasattr(actor, "aadhaar"))

    def test_organization_membership_relationship(self) -> None:
        """OrganizationMembership links Actor and Organization."""
        actor_id = uuid.uuid4()
        org_id = uuid.uuid4()

        actor = Actor(id=actor_id, display_name="Prof. Anita Sharma")
        org = Organization(id=org_id, name="Ranchi University", organization_type="HEI")

        membership = OrganizationMembership(
            id=uuid.uuid4(),
            actor_id=actor.id,
            organization_id=org.id,
            affiliation_label="Faculty Coordinator",
            is_primary=True,
        )

        actor.memberships.append(membership)
        org.memberships.append(membership)

        self.assertEqual(len(actor.memberships), 1)
        self.assertEqual(len(org.memberships), 1)
        self.assertEqual(actor.memberships[0].affiliation_label, "Faculty Coordinator")
        self.assertTrue(actor.memberships[0].is_primary)
        self.assertEqual(actor.memberships[0].actor_id, actor_id)
        self.assertEqual(actor.memberships[0].organization_id, org_id)

    def test_foreign_key_restrict_behavior(self) -> None:
        """Foreign keys use non-cascading ON DELETE RESTRICT policies."""
        actor_fk = [fk for fk in OrganizationMembership.__table__.foreign_keys if fk.column.table.name == "actors"]
        org_fk = [fk for fk in OrganizationMembership.__table__.foreign_keys if fk.column.table.name == "organizations"]

        self.assertEqual(len(actor_fk), 1)
        self.assertEqual(actor_fk[0].ondelete, "RESTRICT")

        self.assertEqual(len(org_fk), 1)
        self.assertEqual(org_fk[0].ondelete, "RESTRICT")

    def test_metadata_tables_contain_identity_tables(self) -> None:
        """Base.metadata contains identity tables and no premature decision tables."""
        table_names = set(Base.metadata.tables.keys())
        expected_identity_tables = {"organizations", "actors", "organization_memberships"}

        self.assertTrue(expected_identity_tables.issubset(table_names))
        self.assertNotIn("challenge_validations", table_names)
        self.assertNotIn("readiness_decisions", table_names)
        self.assertNotIn("readiness_conditions", table_names)
        self.assertNotIn("pilots", table_names)


if __name__ == "__main__":
    unittest.main()
