import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";


dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(express.json());


const region = process.env.AWS_REGION;
const queueUrl = process.env.SQS_QUEUE_URL;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !queueUrl || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing AWS configuration in .env");
}


const sqsClient = new SQSClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

app.post("/task", async (req: Request, res: Response) => {
    const { task }: { task?: string } = req.body;

    if (!task) {
        return res.status(400).json({ error: "Task is required" });
    }


    const jobId = `${task}-${Date.now()}`;

    const messageBody = {
        jobId,
        type: task,
        payload: req.body.payload || {},
        createdAt: new Date().toISOString(),
    };

    console.log(JSON.stringify({
        level: "INFO",
        message: "Sending job to SQS",
        jobId,
        type: task,
        timestamp: new Date().toISOString(),
    }));

    try {
        await sqsClient.send(
            new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(messageBody),
            })
        );

        res.json({ message: "Task sent to queue successfully ", jobId });
    } catch (error) {
        console.error("SQS error:", error);
        res.status(500).json({ error: "Failed to send task" });
    }
});

app.get("/", (_req: Request, res: Response) => {
    res.send("API is running ");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});