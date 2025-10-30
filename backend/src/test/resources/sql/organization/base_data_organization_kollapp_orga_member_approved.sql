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