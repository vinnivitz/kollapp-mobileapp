SET
FOREIGN_KEY_CHECKS=0;
DELETE
FROM activity;
DELETE
FROM posting;
DELETE
FROM kollapp_user;
DELETE
FROM organization;
DELETE
FROM person_of_organization;
DELETE
FROM organization_invitation_code;
DELETE
FROM organization_budget_category;
SET
FOREIGN_KEY_CHECKS=1;
