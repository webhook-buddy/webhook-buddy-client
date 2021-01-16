import { gql, useQuery, useMutation } from '@apollo/client';
import { ForwardUrlPayload } from 'schema/types';
import { distinct } from 'services/ids';

const FORWARD_URL_FRAGMENT = gql`
  fragment ForwardUrl on ForwardUrl {
    url
  }
`;

const GET_FORWARD_URLS = gql`
  query GetForwardUrls($endpointId: ID!) {
    forwardUrls(endpointId: $endpointId) {
      ...ForwardUrl
    }
  }
  ${FORWARD_URL_FRAGMENT}
`;

const ADD_FORWARD_URL = gql`
  mutation AddForwardUrl($input: AddForwardUrlInput!) {
    addForwardUrl(input: $input) {
      forwardUrl {
        ...ForwardUrl
      }
    }
  }
  ${FORWARD_URL_FRAGMENT}
`;

const useForwardUrls = (endpointId: string) => {
  const { data } = useQuery<ForwardUrlPayload>(GET_FORWARD_URLS, {
    variables: {
      endpointId,
    },
  });

  const [mutate] = useMutation(ADD_FORWARD_URL, {
    onError: () => {}, // Handle error to avoid unhandled rejection: https://github.com/apollographql/apollo-client/issues/6070
  });

  const addForwardUrl = (url: string) =>
    mutate({
      variables: {
        input: {
          endpointId,
          url,
        },
      },
      update: (
        cache,
        {
          data: {
            addForwardUrl: { forwardUrl },
          },
        },
      ) => {
        const data = cache.readQuery<ForwardUrlPayload>({
          query: GET_FORWARD_URLS,
          variables: {
            endpointId,
          },
        });

        cache.writeQuery({
          query: GET_FORWARD_URLS,
          variables: {
            endpointId,
          },
          data: {
            ...data,
            forwardUrls: [forwardUrl, ...(data?.forwardUrls ?? [])],
          },
        });
      },
      optimisticResponse: {
        addForwardUrl: {
          __typename: 'AddForwardUrlPayload',
          forwardUrl: { url, __typename: 'ForwardUrl' },
        },
      },
    });

  return {
    forwardUrls: distinct(data?.forwardUrls.map(f => f.url) || []),
    addForwardUrl,
  };
};

export default useForwardUrls;
