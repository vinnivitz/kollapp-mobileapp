INSERT INTO kollapp_user(id, username, email, is_activated, password)
VALUES (1, 'erika', 'erika@test.de', true, 'test');
INSERT INTO organization(id, name)
VALUES (1, 'NMS');
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status)
VALUES ('ROLE_ORGANIZATION_MANAGER', 1, 1, 1, 'APPROVED');
INSERT INTO activity(id, name, location, organization_id)
VALUES (1, 'Halloween', 'Kashay-Salon', 1);
INSERT INTO activity(id, name, location, organization_id)
VALUES (2, 'Silvester', 'SoOderSo', 1);
