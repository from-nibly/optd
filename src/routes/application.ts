import { Elysia } from 'elysia';
import { DefinitionsRoute } from './definitions';

export const app = new Elysia().use(DefinitionsRoute({}));
