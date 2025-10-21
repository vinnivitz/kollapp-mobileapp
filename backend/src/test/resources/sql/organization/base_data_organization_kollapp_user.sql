INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_USER');
INSERT INTO organization(id, name)
VALUES (1, 'NMS');
INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(1, 'asdfjklo', '2099-08-15', 1);