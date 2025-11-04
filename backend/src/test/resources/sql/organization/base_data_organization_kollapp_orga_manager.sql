INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (2, 'member', 'member@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (3, 'manager', 'manager@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO organization(id, name)
VALUES (1, 'NMS');

INSERT INTO organization(id, name)
VALUES (2, 'Frequenzfamilie');

INSERT INTO organization(id, name)
VALUES (3, 'Glitzerglanz');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status)
VALUES ('ROLE_ORGANIZATION_MANAGER', 1, 1, 1, 'APPROVED');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 2, 2, 1, 'PENDING', 'orgamember');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 3, 3, 1, 'APPROVED', 'orgamanager');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 4, 2, 2, 'APPROVED', 'orgamember');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status)
VALUES ('ROLE_ORGANIZATION_MANAGER', 5, 1, 3, 'APPROVED');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 6, 2, 3, 'APPROVED', 'orgamember');

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(1, 'asdfjklo', '2099-08-15', 2);

INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(2, 'asdfjkloe', '2099-08-15', 1);

INSERT INTO activity(id, name, location, organization_id)
VALUES(1, 'Halloween-Party', 'Soderso', 1);

INSERT INTO activity(id, name, location, organization_id)
VALUES(2, 'Halloween-Party', 'Soderso', 2);