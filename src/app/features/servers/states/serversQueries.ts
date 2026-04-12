import { gql } from 'apollo-angular';

export const GAME_SERVERS_QUERY = gql`
  query {
    gameServers {
      friendlyName
      status
      ampStatus
      image
      brandUrl
      uptime
      startedAt
      players
      maxPlayers
    }
  }
`;

