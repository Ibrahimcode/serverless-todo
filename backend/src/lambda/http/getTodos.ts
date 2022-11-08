import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodos} from '../../helpers/todos'
import { getUserId } from '../utils';

import { createLogger } from '../../utils/logger'

const logger = createLogger("getTodosForUser");

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here

    logger.info("Getting all User's todo event", {
      event,
    })
    const userId = getUserId(event)

    const todos = await getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          items: todos
        },
        null,
        2
      )
    }
  }

  // XAWS.DynamoDB.DocumentClient()
)

handler.use(
  cors({
    credentials: true
  })
)
