import { request } from "graphql-request";

export const graphqlRequest = async <T>(query: string, variables: Record<string, any> = {}): Promise<T> => {
  return await request<T>(process.env.REACT_APP_SUBGRAPH_FUTURES_URL, query, { ...variables });
};
