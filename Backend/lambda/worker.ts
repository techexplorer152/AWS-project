import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const client = new SQSClient({ region: "us-east-1" });

interface JobPayload {
    [key: string]: any;
}

interface Job {
    jobId?: string;
    type: string;
    payload: JobPayload;
    createdAt: string;
}

export const sendJob = async (type: string, payload: JobPayload) => {
    const job: Job = {
        jobId: Date.now().toString(),
        type,
        payload,
        createdAt: new Date().toISOString(),
    };

    const command = new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MessageBody: JSON.stringify(job),
    });

    await client.send(command);
    console.log("Job sent:", job);
};