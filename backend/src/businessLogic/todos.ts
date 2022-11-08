import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
// import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
// import * as uuid from 'uuid'
// import * as createError from 'http-errors'


import * as AWS from 'aws-sdk'

// TODO: Implement businessLogic
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const todosAccess = new TodosAccess();
export async function createTodo(newTodo: CreateTodoRequest, userId: string) {

    return await todosAccess.createTodo(newTodo, userId)

}
export async function deleteTodo(todoId: string, userId: string) {

    return await todosAccess.deleteTodo(todoId, userId)
}

export async function getTodos(userId: string) {

    return await todosAccess.getTodos(userId)

}
export async function updateTodo(todoId: string, updateTodo: UpdateTodoRequest, userId: string) {

    return await todosAccess.updateTodo( updateTodo, todoId, userId)

}
export const createAttachmentPresignedUrl = async function (todoId: string) {

    let signedUrl: string;
    try {
        signedUrl = s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: +urlExpiration
        })

        console.log("signedUrl: " + signedUrl)
    } catch (error) {
        console.log("< ==== Error: ===== >\n", error.stack)
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            uploadUrl: signedUrl
        })
    };
}