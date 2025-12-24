INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (10, 'solo', 'solo@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO organization(id, name)
VALUES (10, 'SoloOrg');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 10, 10, 10, 'APPROVED', 'solo');
