import { inject, Provider } from '@angular/core';
import { InMemoryCache } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../environments/environment';

function apolloOptionsFactory() {
  const httpLink = inject(HttpLink);
  return {
    link: httpLink.create({ uri: environment.apiUrl }),
    cache: new InMemoryCache(),
  };
}

export function provideGraphQL(): Provider[] {
  return [
    Apollo,
    HttpLink,
    { provide: APOLLO_OPTIONS, useFactory: apolloOptionsFactory },
  ];
}


