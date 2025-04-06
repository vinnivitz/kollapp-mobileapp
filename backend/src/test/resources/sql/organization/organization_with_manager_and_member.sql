INSERT INTO organization(id, name)
VALUES (1, 'NMS');
INSERT INTO person_of_organization(role, id, user_id, organization_id)
VALUES ('manager', 1, 1, 1);
INSERT INTO person_of_organization(role, id, user_id, organization_id)
VALUES ('member', 2, 2, 1);
