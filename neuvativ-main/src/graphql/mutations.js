/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCalVarPubSubMsg = /* GraphQL */ `
  mutation CreateCalVarPubSubMsg(
    $projectId: String!
    $elevatorId: String!
    $calibrationValue: String!
  ) {
    createCalVarPubSubMsg(
      projectId: $projectId
      elevatorId: $elevatorId
      calibrationValue: $calibrationValue
    ) {
      projectId
      elevatorId
      calibrationValue
    }
  }
`;
export const createProject = /* GraphQL */ `
  mutation CreateProject(
    $input: CreateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    createProject(input: $input, condition: $condition) {
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
export const updateProject = /* GraphQL */ `
  mutation UpdateProject(
    $input: UpdateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    updateProject(input: $input, condition: $condition) {
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
export const deleteProject = /* GraphQL */ `
  mutation DeleteProject(
    $input: DeleteProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    deleteProject(input: $input, condition: $condition) {
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
export const createGuestCode = /* GraphQL */ `
  mutation CreateGuestCode(
    $input: CreateGuestCodeInput!
    $condition: ModelGuestCodeConditionInput
  ) {
    createGuestCode(input: $input, condition: $condition) {
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
export const updateGuestCode = /* GraphQL */ `
  mutation UpdateGuestCode(
    $input: UpdateGuestCodeInput!
    $condition: ModelGuestCodeConditionInput
  ) {
    updateGuestCode(input: $input, condition: $condition) {
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
export const deleteGuestCode = /* GraphQL */ `
  mutation DeleteGuestCode(
    $input: DeleteGuestCodeInput!
    $condition: ModelGuestCodeConditionInput
  ) {
    deleteGuestCode(input: $input, condition: $condition) {
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
export const createSigUpCodeTable = /* GraphQL */ `
  mutation CreateSigUpCodeTable(
    $input: CreateSigUpCodeTableInput!
    $condition: ModelSigUpCodeTableConditionInput
  ) {
    createSigUpCodeTable(input: $input, condition: $condition) {
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
export const updateSigUpCodeTable = /* GraphQL */ `
  mutation UpdateSigUpCodeTable(
    $input: UpdateSigUpCodeTableInput!
    $condition: ModelSigUpCodeTableConditionInput
  ) {
    updateSigUpCodeTable(input: $input, condition: $condition) {
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
export const deleteSigUpCodeTable = /* GraphQL */ `
  mutation DeleteSigUpCodeTable(
    $input: DeleteSigUpCodeTableInput!
    $condition: ModelSigUpCodeTableConditionInput
  ) {
    deleteSigUpCodeTable(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createAlerts = /* GraphQL */ `
  mutation CreateAlerts(
    $input: CreateAlertsInput!
    $condition: ModelAlertsConditionInput
  ) {
    createAlerts(input: $input, condition: $condition) {
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
export const updateAlerts = /* GraphQL */ `
  mutation UpdateAlerts(
    $input: UpdateAlertsInput!
    $condition: ModelAlertsConditionInput
  ) {
    updateAlerts(input: $input, condition: $condition) {
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
export const deleteAlerts = /* GraphQL */ `
  mutation DeleteAlerts(
    $input: DeleteAlertsInput!
    $condition: ModelAlertsConditionInput
  ) {
    deleteAlerts(input: $input, condition: $condition) {
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
export const createProjectGuestGuestCode = /* GraphQL */ `
  mutation CreateProjectGuestGuestCode(
    $input: CreateProjectGuestGuestCodeInput!
    $condition: ModelProjectGuestGuestCodeConditionInput
  ) {
    createProjectGuestGuestCode(input: $input, condition: $condition) {
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
export const updateProjectGuestGuestCode = /* GraphQL */ `
  mutation UpdateProjectGuestGuestCode(
    $input: UpdateProjectGuestGuestCodeInput!
    $condition: ModelProjectGuestGuestCodeConditionInput
  ) {
    updateProjectGuestGuestCode(input: $input, condition: $condition) {
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
export const deleteProjectGuestGuestCode = /* GraphQL */ `
  mutation DeleteProjectGuestGuestCode(
    $input: DeleteProjectGuestGuestCodeInput!
    $condition: ModelProjectGuestGuestCodeConditionInput
  ) {
    deleteProjectGuestGuestCode(input: $input, condition: $condition) {
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
