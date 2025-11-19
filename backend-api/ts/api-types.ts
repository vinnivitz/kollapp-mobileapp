/* tslint:disable */
/* eslint-disable */

export interface BudgetAccountTO {
    id: number;
    postings: PostingTO[];
}

export interface PostingCreateUpdateRequestTO {
    type: PostingType;
    amountInCents: number;
    date: string;
    purpose: string;
    activityId: number;
}

export interface PostingTO {
    id: number;
    type: PostingType;
    amountInCents: number;
    date: string;
    purpose: string;
    activityId: number;
}

export interface ApiVersionTO {
    version: string;
}

export interface ErrorResponseTO extends ResponseTO {
    message: string;
}

export interface MessageResponseTO extends ResponseTO {
    message: string;
}

export interface ResponseTO {
}

export interface ValidationFailureResponseTO extends ResponseTO {
    message: string;
    validationField: string;
}

export interface ActivityCreationRequestTO {
    name: string;
    location: string;
}

export interface ActivityTO {
    id: number;
    name: string;
    location: string;
}

export interface ActivityUpdateRequestTO {
    name: string;
    location: string;
}

export interface OrganizationBaseTO {
    name: string;
    description: string;
    place: string;
}

export interface OrganizationCreationRequestTO {
    name: string;
    place: string;
    description: string;
}

export interface OrganizationInvitationCodeTO {
    code: string;
    expirationDate: string;
}

export interface OrganizationMinifiedTO {
    id: number;
    name: string;
    description: string;
    place: string;
}

export interface OrganizationTO {
    id: number;
    name: string;
    place: string;
    description: string;
    organizationInvitationCode: OrganizationInvitationCodeTO;
    personsOfOrganization: PersonOfOrganizationTO[];
    activities: ActivityTO[];
}

export interface OrganizationUpdateRequestTO {
    name: string;
    description: string;
    place: string;
}

export interface PersonOfOrganizationPatchRoleRequestTO {
    role: string;
}

export interface PersonOfOrganizationTO {
    id: number;
    userId: number;
    username: string;
    organizationRole: string;
    status: string;
}

export type PostingType = "DEBIT" | "CREDIT";
