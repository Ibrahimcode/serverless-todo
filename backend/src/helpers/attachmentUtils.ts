import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

// import { bucketName } from './todosAccess'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function storeS3Attachment(todoId: string, file: Buffer) {
    console.log("Putting object into s3")
    await s3.putObject({
            Bucket: bucketName,
            Key: `${todoId}.jpeg`,
            Body: file
    }).promise()
    
    console.log("finished putting object into s3")
    
}