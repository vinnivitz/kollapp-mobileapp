INSERT INTO organization(id,name) VALUES (1, 'NMS');
INSERT INTO person_of_organization(role,id,name,surname,user_id,organization_id)
    VALUES ('manager', 1, 'Max', 'Mustermann', 1, 1);
INSERT INTO person_of_organization(role, id, name, surname, user_id, organization_id)
    VALUES ('member', 2, 'Erika', 'Musterfrau', 2, 1);
