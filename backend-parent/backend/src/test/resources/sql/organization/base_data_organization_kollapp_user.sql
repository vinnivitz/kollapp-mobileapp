INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_USER');
INSERT INTO organization(id, name, place)
VALUES (100, 'NMS', 'Test City');
INSERT INTO organization_invitation_code(id, code, expiration_date, organization_id)
VALUES(100, 'usertest', '2099-08-15', 100);