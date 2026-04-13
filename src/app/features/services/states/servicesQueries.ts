import { gql } from 'apollo-angular';

export const SERVICES_STATUS_QUERY = gql`
  query ServicesStatus {
    servicesStatus {
      name
      displayName
      url
      status
      responseMs
    }
  }
`;

