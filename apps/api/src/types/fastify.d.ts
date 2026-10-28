import '@fastify/session';

declare module 'fastify' {
  interface FastifyRequest {
    sessionUser?: {
      id: string;
      email: string;
      plan: string;
    } | null;
  }
}

declare module '@fastify/session' {
  interface FastifySessionObject {
    userId?: string;
  }
}
