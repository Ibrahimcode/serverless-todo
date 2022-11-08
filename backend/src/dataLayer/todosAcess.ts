import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

import * as uuid from 'uuid'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'

import { Types } from 'aws-sdk/clients/s3';

// const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('DynamoDB')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('getting todos for user', {
            userId
          })

        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        logger.info("Finished getting todos", result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async createTodo(todoItem: CreateTodoRequest, userId: string): Promise<TodoItem> {
        const todoId = uuid.v4()

        logger.info('Creating todo', {
            todoItem
          })

        // create todo item
        const todo: TodoItem = {
            ...todoItem,
            userId: userId,
            todoId: todoId,
            createdAt: new Date().toISOString(),
            done: false,
            attachmentUrl: `https://serverless-c4-todo-images-1108-dev.s3.amazonaws.com/${todoId}`
        }

        await this.docClient.put({
                TableName: this.todoTable,
                Item: todo,
            }).promise();

        logger.info('Todo created successfully', {
            todo
            })
        return todo as TodoItem;
    }

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        logger.info('Updating todo', {
            todoId
          })

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        console.log(result);
        const attributes = result.Attributes;

        logger.info('Todo updated successfully', {
            result
          })
        return attributes as TodoUpdate;
    }

    async deleteTodo(todoId: string, userId: string): Promise<string> {
        logger.info('Deleting todo by id', {
            todoId
          })

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        await this.docClient.delete(params).promise();
        logger.info('Todo deleted successfully', {
            todoId
          })

        return "" as string;
    }

    async generateUploadUrl(todoId: string): Promise<string> {

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 60000,
        });
        logger.info('Finished generating upload url', {
            url
          })
        console.log(url);

        return url as string;
    }
}