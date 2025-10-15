INSERT INTO kollapp_user(id, username, email, is_activated, password)
VALUES (1, 'erika', 'erika@test.de', true, 'test');
INSERT INTO kollapp_user(id, username, email, is_activated, password)
VALUES (2, 'heinz', 'heinz@test.de', true, 'test');
INSERT INTO organization(id, name)
VALUES (1, 'NMS');
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status)
VALUES ('ROLE_ORGANIZATION_MANAGER', 1, 1, 1, 'APPROVED');
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status)
VALUES ('ROLE_ORGANIZATION_MEMBER', 2, 2, 1, 'APPROVED');
