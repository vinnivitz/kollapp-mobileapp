INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (1, 'nina', 'nina@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (2, 'orgamanager', 'manager@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (3, 'thirduser', 'third@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (4, 'fourthuser', 'fourth@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

INSERT INTO kollapp_user(id, username, email, is_activated, password, role)
VALUES (5, 'pendinguser', 'pending@test.de', true, 'test', 'ROLE_KOLLAPP_ORGANIZATION_MEMBER');

-- Organizations
INSERT INTO organization(id, name, place)
VALUES (1, 'NMS', 'Test City');

INSERT INTO organization(id, name, place)
VALUES (2, 'Frequenzfamilie', 'Hamburg');

INSERT INTO organization(id, name, place)
VALUES (3, 'Glitzerglanz', 'Berlin');

INSERT INTO organization(id, name, place)
VALUES (4, 'SoloOrg', 'Munich');

-- Organization memberships
-- nina (1) is approved in organizations 1 and 3
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 1, 1, 1, 'APPROVED', 'nina');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 2, 1, 3, 'APPROVED', 'nina');

-- orgamanager (2) is approved in organization 1
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MANAGER', 3, 2, 1, 'APPROVED', 'orgamanager');

-- thirduser (3) is approved in organizations 1 and 3 (shares both with nina)
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 4, 3, 1, 'APPROVED', 'thirduser');

INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 5, 3, 3, 'APPROVED', 'thirduser');

-- fourthuser (4) is approved in organization 4 only (shares no org with nina)
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 6, 4, 4, 'APPROVED', 'fourthuser');

-- pendinguser (5) is PENDING in organization 2
INSERT INTO person_of_organization(organization_role, id, user_id, organization_id, status, username)
VALUES ('ROLE_ORGANIZATION_MEMBER', 7, 5, 2, 'PENDING', 'pendinguser');
