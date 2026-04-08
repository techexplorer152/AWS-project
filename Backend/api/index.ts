import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { sendJob } from "./worker";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(express.json());

app.post("/task", async (req: Request, res: Response) => {
    const { task, payload } = req.body;

    if (!task) {
        return res.status(400).json({ error: "Task is required" });
    }

    try {
        const job = await sendJob(task, payload || {});

        console.log(JSON.stringify({
            level: "INFO",
            message: "Job dispatched to SQS",
            jobId: job.jobId,
            timestamp: job.createdAt
        }));

        res.status(202).json({
            message: "Task accepted",
            jobId: job.jobId
        });
    } catch (error) {
        console.error("Queue Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Worker API online on port ${PORT}`);
});