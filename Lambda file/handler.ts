import { SQSEvent, SQSRecord } from "aws-lambda";

type JobType = "send_email" | "generate_report";

interface Job {
    jobId: string;
    type: JobType;
    payload: any;
}

const processedJobs = new Set<string>();

export const handler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        await processRecord(record);
    }
};

const processRecord = async (record: SQSRecord): Promise<void> => {
    try {
        const job: Job = JSON.parse(record.body);

        console.log(
            JSON.stringify({
                level: "INFO",
                message: "Processing job",
                jobId: job.jobId,
                jobType: job.type,
                payload: job.payload,
            })
        );

        if (processedJobs.has(job.jobId)) {
            console.log("Skipping already processed job:", job.jobId);
            return;
        }

        switch (job.type) {
            case "send_email":
                await handleSendEmail(job.payload);
                break;

            case "generate_report":
                await handleReport(job.payload);
                break;

            default:
                throw new Error(`Unknown job type: ${job.type}`);
        }

        processedJobs.add(job.jobId);

        console.log(
            JSON.stringify({
                level: "INFO",
                message: "Job completed",
                jobId: job.jobId,
                jobType: job.type,
            })
        );
    } catch (error: any) {
        console.error(
            JSON.stringify({
                level: "ERROR",
                message: "Job failed",
                error: error.message,
                stack: error.stack,
            })
        );

        throw error;
    }
};

const handleSendEmail = async (payload: { to: string }) => {
    console.log(
        JSON.stringify({
            level: "INFO",
            message: "Sending email",
            to: payload.to,
        })
    );

    await new Promise((r) => setTimeout(r, 1000));
};

const handleReport = async (payload: any) => {
    console.log(
        JSON.stringify({
            level: "INFO",
            message: "Generating report",
            payload,
        })
    );

    await new Promise((r) => setTimeout(r, 2000));
};