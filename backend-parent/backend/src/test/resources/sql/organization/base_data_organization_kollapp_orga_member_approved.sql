INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (2, 'orgamanager', 'manager@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO organization(id, name)
VALUES (1, 'NMS');

INSERT INTO organization(id, name)
VALUES (2, 'Frequenzfamilie');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status)
VALUES ('ROLE_ORGANIZATION_MEMBER', 1, 1, 1, 'APPROVED');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 2, 2, 1, 'APPROVED', 'orgamanager');

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(1, 'asdfjklo', '2099-08-15', 2);

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(2, 'asdfjkloe', '2099-08-15', 1);

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id, person_of_organization_id)
VALUES(1, 'organization', 1000, '2025-09-11', 'Test', 'DEBIT', null, 1, 1);

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id, person_of_organization_id)
VALUES(3, 'organization', 1000, '2025-09-11', 'Test', 'DEBIT', null, 1, 2);

INSERT INTO activity(id, name, location, organization_id)
VALUES(1, 'Halloween-Party', 'Soderso', 1);

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id, person_of_organization_id)
VALUES(2, 'activity', 10000, '2025-09-11', 'Test', 'CREDIT', 1, null, 1);

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id, person_of_organization_id)
VALUES(4, 'activity', 10000, '2025-09-11', 'Test', 'CREDIT', 1, null, 2);
