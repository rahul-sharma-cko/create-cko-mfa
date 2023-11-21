import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
  collectMetrics?: boolean;
  metricTags?: string[];
}
