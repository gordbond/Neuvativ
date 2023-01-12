/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listUrls = /* GraphQL */ `
  query ListUrls {
    listUrls {
      id
      data
      email
    }
  }
`;
export const getUrl = /* GraphQL */ `
  query GetUrl($id: ID!, $email: String!) {
    getUrl(id: $id, email: $email) {
      id
      data
      email
    }
  }
`;
export const getListOfAlerts = /* GraphQL */ `
  query GetListOfAlerts {
    getListOfAlerts {
      id
      elevator_id
      project_id
      status
      signal_type
      alert_type
      alert_message
      createdAt
      updatedAt
    }
  }
`;
export const getAlertById = /* GraphQL */ `
  query GetAlertById(
    $elevator_id: String!
    $project_id: String!
    $signal_type: String
    $email: String
    $userName: String
    $action: String
  ) {
    getAlertById(
      elevator_id: $elevator_id
      project_id: $project_id
      signal_type: $signal_type
      email: $email
      userName: $userName
      action: $action
    ) {
      id
      elevator_id
      project_id
      status
      signal_type
      alert_type
      alert_message
      createdAt
      updatedAt
    }
  }
`;
export const updateSubscriptionsByUser = /* GraphQL */ `
  query UpdateSubscriptionsByUser($id: ID!, $email: String, $userName: String) {
    updateSubscriptionsByUser(id: $id, email: $email, userName: $userName) {
      id
      username
      email
      preferred_username
      registration_code
      group
      sheetInformation
      embededUrl
      subscriptions
      pending_subscriptions
      createdAt
      updatedAt
    }
  }
`;
export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      projectId
      projectCreationDate
      projectOwnerName
      projectOwnerStNo
      projectOwnerStName
      projectOwnerCity
      projectOwnerState
      projectOwnerPostalCode
      projectOwnerAccountNo
      projectLocationofElevatingDevice
      projectElevatorContractor
      projectElevatorConsultant
      projectEC
      projectBM
      projectGuest {
        items {
          id
          projectID
          guestCodeID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectElevatorInfo
      createdAt
      updatedAt
    }
  }
`;
export const listProjects = /* GraphQL */ `
  query ListProjects(
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        projectId
        projectCreationDate
        projectOwnerName
        projectOwnerStNo
        projectOwnerStName
        projectOwnerCity
        projectOwnerState
        projectOwnerPostalCode
        projectOwnerAccountNo
        projectLocationofElevatingDevice
        projectElevatorContractor
        projectElevatorConsultant
        projectEC
        projectBM
        projectGuest {
          nextToken
        }
        projectElevatorInfo
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getGuestCode = /* GraphQL */ `
  query GetGuestCode($id: ID!) {
    getGuestCode(id: $id) {
      id
      code
      guestCode {
        items {
          id
          projectID
          guestCodeID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listGuestCodes = /* GraphQL */ `
  query ListGuestCodes(
    $filter: ModelGuestCodeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGuestCodes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        code
        guestCode {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getSigUpCodeTable = /* GraphQL */ `
  query GetSigUpCodeTable($id: ID!) {
    getSigUpCodeTable(id: $id) {
      id
      SignUpGroup
      SignUpCode
      CurrentlyAvailableCodes
      AssignedCodes
      createdAt
      updatedAt
    }
  }
`;
export const listSigUpCodeTables = /* GraphQL */ `
  query ListSigUpCodeTables(
    $filter: ModelSigUpCodeTableFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSigUpCodeTables(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        SignUpGroup
        SignUpCode
        CurrentlyAvailableCodes
        AssignedCodes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      preferred_username
      registration_code
      group
      sheetInformation
      embededUrl
      subscriptions
      pending_subscriptions
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        email
        preferred_username
        registration_code
        group
        sheetInformation
        embededUrl
        subscriptions
        pending_subscriptions
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getAlerts = /* GraphQL */ `
  query GetAlerts($id: ID!, $project_id: String!, $elevator_id: String!) {
    getAlerts(id: $id, project_id: $project_id, elevator_id: $elevator_id) {
      id
      elevator_id
      project_id
      status
      signal_type
      alert_type
      alert_message
      createdAt
      updatedAt
    }
  }
`;
export const listAlerts = /* GraphQL */ `
  query ListAlerts(
    $id: ID
    $project_idElevator_id: ModelAlertsPrimaryCompositeKeyConditionInput
    $filter: ModelAlertsFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAlerts(
      id: $id
      project_idElevator_id: $project_idElevator_id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        elevator_id
        project_id
        status
        signal_type
        alert_type
        alert_message
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getProjectGuestGuestCode = /* GraphQL */ `
  query GetProjectGuestGuestCode($id: ID!) {
    getProjectGuestGuestCode(id: $id) {
      id
      projectID
      guestCodeID
      project {
        id
        projectId
        projectCreationDate
        projectOwnerName
        projectOwnerStNo
        projectOwnerStName
        projectOwnerCity
        projectOwnerState
        projectOwnerPostalCode
        projectOwnerAccountNo
        projectLocationofElevatingDevice
        projectElevatorContractor
        projectElevatorConsultant
        projectEC
        projectBM
        projectGuest {
          nextToken
        }
        projectElevatorInfo
        createdAt
        updatedAt
      }
      guestCode {
        id
        code
        guestCode {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const listProjectGuestGuestCodes = /* GraphQL */ `
  query ListProjectGuestGuestCodes(
    $filter: ModelProjectGuestGuestCodeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProjectGuestGuestCodes(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        projectID
        guestCodeID
        project {
          id
          projectId
          projectCreationDate
          projectOwnerName
          projectOwnerStNo
          projectOwnerStName
          projectOwnerCity
          projectOwnerState
          projectOwnerPostalCode
          projectOwnerAccountNo
          projectLocationofElevatingDevice
          projectElevatorContractor
          projectElevatorConsultant
          projectEC
          projectBM
          projectElevatorInfo
          createdAt
          updatedAt
        }
        guestCode {
          id
          code
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const projectByEC = /* GraphQL */ `
  query ProjectByEC(
    $projectEC: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    projectByEC(
      projectEC: $projectEC
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        projectId
        projectCreationDate
        projectOwnerName
        projectOwnerStNo
        projectOwnerStName
        projectOwnerCity
        projectOwnerState
        projectOwnerPostalCode
        projectOwnerAccountNo
        projectLocationofElevatingDevice
        projectElevatorContractor
        projectElevatorConsultant
        projectEC
        projectBM
        projectGuest {
          nextToken
        }
        projectElevatorInfo
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const projectByBM = /* GraphQL */ `
  query ProjectByBM(
    $projectBM: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    projectByBM(
      projectBM: $projectBM
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        projectId
        projectCreationDate
        projectOwnerName
        projectOwnerStNo
        projectOwnerStName
        projectOwnerCity
        projectOwnerState
        projectOwnerPostalCode
        projectOwnerAccountNo
        projectLocationofElevatingDevice
        projectElevatorContractor
        projectElevatorConsultant
        projectEC
        projectBM
        projectGuest {
          nextToken
        }
        projectElevatorInfo
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const guestCodeByCode = /* GraphQL */ `
  query GuestCodeByCode(
    $code: String!
    $sortDirection: ModelSortDirection
    $filter: ModelGuestCodeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    guestCodeByCode(
      code: $code
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        code
        guestCode {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const userByGroup = /* GraphQL */ `
  query UserByGroup(
    $group: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userByGroup(
      group: $group
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        username
        email
        preferred_username
        registration_code
        group
        sheetInformation
        embededUrl
        subscriptions
        pending_subscriptions
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
