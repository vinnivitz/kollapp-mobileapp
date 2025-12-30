INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (2, 'member', 'member@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (3, 'manager', 'manager@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO organization(id, name, place)
VALUES (1, 'NMS', 'Test City');

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id)
VALUES(2, 'organization', 10000, '2025-09-11', 'Test', 'CREDIT', null, 1);

INSERT INTO organization(id, name, place)
VALUES (2, 'Frequenzfamilie', 'Hamburg');

INSERT INTO organization(id, name, place)
VALUES (3, 'Glitzerglanz', 'Berlin');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 1, 1, 1, 'APPROVED', 'nina');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 2, 2, 1, 'PENDING', 'orgamember');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 3, 3, 1, 'APPROVED', 'orgamanager');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 4, 2, 2, 'APPROVED', 'orgamember');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 5, 1, 3, 'APPROVED', 'nina');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 6, 2, 3, 'APPROVED', 'orgamember');

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(1, 'asdfjk01', '2099-08-15', 1);

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(2, 'asdfjklo', '2099-08-15', 2);

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(5, 'mnopqr56', '2099-08-15', 3);

INSERT INTO activity(id, name, location, date, organization_id)
VALUES(1, 'Halloween-Party', 'Soderso', '2025-10-31', 1);

INSERT INTO posting(id, scope, amount_in_cents, date, purpose, type, activity_id, organization_id)
VALUES(1, 'activity', 10000, '2025-09-11', 'Test', 'CREDIT', 1, null);

INSERT INTO activity(id, name, location, date, organization_id)
VALUES(2, 'Halloween-Party', 'Soderso', '2025-10-31', 2);