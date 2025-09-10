import { request } from "graphql-request";

const headers = {
  Authorization: `Bearer ${process.env.REACT_APP_SUBGRAPH_API_KEY}`,
};

export const graphqlRequest = async <T>(query: string, variables: Record<string, any> = {}): Promise<T> => {
  return await request<T>(process.env.REACT_APP_SUBGRAPH_URL, query, { ...headers, ...variables });
};
