INSERT INTO organization(id, name)
VALUES (1, 'NMS');
INSERT INTO person_of_organization(role, id, name, surname, user_id, organization_id)
VALUES ('manager', 1, 'Max', 'Mustermann', 1, 1);
INSERT INTO activity(id, name, location, organization_id)
VALUES (1, 'Halloween', 'Kashay-Salon', 1);
INSERT INTO activity(id, name, location, organization_id)
VALUES (2, 'Silvester', 'SoOderSo', 1);
