// ESM
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  console.log(request, reply)
  return { hello: 'world' }
})

/**
 * Run the server!
 */
const startBackend = async (): Promise<void> => {
  try {
    await fastify.listen({ port: 3000 })
    console.log('Fastify server started on port 3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

export default startBackend
