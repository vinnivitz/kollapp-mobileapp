INSERT INTO organization(id, name)
VALUES (1, 'NMS');
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id)
VALUES ('ROLE_ORGANIZATION_MANAGER', 1, 1, 1);
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id)
VALUES ('ROLE_ORGANIZATION_MANAGER', 2, 2, 1);