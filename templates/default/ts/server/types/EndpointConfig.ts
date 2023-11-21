export type EndpointMethod = 'GET' | 'POST' | 'PUT';

export interface EndpointConfig {
  name: string;
  path: string;
  method: EndpointMethod;
  permission: string;
  target: string;
}
