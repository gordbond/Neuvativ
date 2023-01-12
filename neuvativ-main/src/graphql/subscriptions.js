/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject {
    onCreateProject {
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
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject {
    onUpdateProject {
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
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject {
    onDeleteProject {
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
export const onCreateGuestCode = /* GraphQL */ `
  subscription OnCreateGuestCode {
    onCreateGuestCode {
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
export const onUpdateGuestCode = /* GraphQL */ `
  subscription OnUpdateGuestCode {
    onUpdateGuestCode {
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
export const onDeleteGuestCode = /* GraphQL */ `
  subscription OnDeleteGuestCode {
    onDeleteGuestCode {
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
export const onCreateSigUpCodeTable = /* GraphQL */ `
  subscription OnCreateSigUpCodeTable {
    onCreateSigUpCodeTable {
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
export const onUpdateSigUpCodeTable = /* GraphQL */ `
  subscription OnUpdateSigUpCodeTable {
    onUpdateSigUpCodeTable {
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
export const onDeleteSigUpCodeTable = /* GraphQL */ `
  subscription OnDeleteSigUpCodeTable {
    onDeleteSigUpCodeTable {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($username: String) {
    onCreateUser(username: $username) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($username: String) {
    onUpdateUser(username: $username) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($username: String) {
    onDeleteUser(username: $username) {
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
export const onCreateAlerts = /* GraphQL */ `
  subscription OnCreateAlerts {
    onCreateAlerts {
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
export const onUpdateAlerts = /* GraphQL */ `
  subscription OnUpdateAlerts {
    onUpdateAlerts {
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
export const onDeleteAlerts = /* GraphQL */ `
  subscription OnDeleteAlerts {
    onDeleteAlerts {
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
export const onCreateProjectGuestGuestCode = /* GraphQL */ `
  subscription OnCreateProjectGuestGuestCode {
    onCreateProjectGuestGuestCode {
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
export const onUpdateProjectGuestGuestCode = /* GraphQL */ `
  subscription OnUpdateProjectGuestGuestCode {
    onUpdateProjectGuestGuestCode {
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
export const onDeleteProjectGuestGuestCode = /* GraphQL */ `
  subscription OnDeleteProjectGuestGuestCode {
    onDeleteProjectGuestGuestCode {
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
