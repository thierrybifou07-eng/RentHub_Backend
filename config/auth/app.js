export const ROLES = Object.freeze({
    ADMIN: "ROLE_ADMIN",
    USER: "ROLE_USER",
    ROOT: "ROLE_ROOT",
    TENANT: "ROLE_TENANT",
    OWNER: "ROLE_OWNER",
    AGENCY: "ROLE_AGENCY",
})

export const ROLE_IDS = Object.freeze({
    USER: 1,
    ADMIN: 2,
    ROOT: 3,
    TENANT: 4,
    OWNER: 5,
    AGENCY: 6,
})

export const ROLE_NAMES = Object.freeze({
    [ROLE_IDS.USER]: ROLES.USER,
    [ROLE_IDS.ADMIN]: ROLES.ADMIN,
    [ROLE_IDS.ROOT]: ROLES.ROOT,
    [ROLE_IDS.TENANT]: ROLES.TENANT,
    [ROLE_IDS.OWNER]: ROLES.OWNER,
    [ROLE_IDS.AGENCY]: ROLES.AGENCY,
})