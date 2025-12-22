INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (2, 'orgamanager', 'manager@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO organization(id, name, place)
VALUES (200, 'NMS', 'Test City');

INSERT INTO organization(id, name, place)
VALUES (201, 'Frequenzfamilie', 'Hamburg');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 1, 1, 200, 'APPROVED', 'nina');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 2, 2, 200, 'APPROVED', 'orgamanager');

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(200, 'membrapp', '2099-08-15', 200);

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(201, 'membrfrq', '2099-08-15', 201);

INSERT INTO activity(id, name, location, organization_id)
VALUES(1, 'Halloween-Party', 'Soderso', 200);

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id)
VALUES(1, 'activity', 10000, '2025-09-11', 'Test', 'CREDIT', 1, null);