export type DisputeStatus =
  | "Active"
  | "Resolved"
  | "PendingEvidence"
  | "UnderReview"
  | "Closed";

export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  client: string;
  freelancer: string;
  amount: number;
  raisedBy: "client" | "freelancer";
  raisedAt: string;
  status: DisputeStatus;
  reason: string;
  evidence?: string;
  evidenceHash?: string;
  resolution?: {
    resolvedAt: string;
    clientShare: number;
    freelancerShare: number;
    note: string;
  };
}

export interface EligibleJob {
  id: string;
  title: string;
  counterparty: string;
  amount: number;
}

export type DisputesPageData = {
  disputes: Dispute[];
  eligibleJobs: EligibleJob[];
};

export async function loadDisputesPageData(
  wallet?: string
): Promise<DisputesPageData> {
  if (!wallet) {
    return {
      disputes: [],
      eligibleJobs: [],
    };
  }

  const { getJobCount, getJob, getDisputeEvidence } = await import("@/lib/contract");

  try {
    const jobCount = await getJobCount();
    const disputes: Dispute[] = [];
    const eligibleJobs: EligibleJob[] = [];

    // Fetch all jobs and filter for disputes and eligible jobs
    for (let i = 1; i <= jobCount; i++) {
      const jobId = String(i);
      const job = await getJob(jobId);

      if (!job) continue;

      // Check if job has a dispute
      if (job.status === "Disputed") {
        const evidence = await getDisputeEvidence(jobId);
        
        if (evidence) {
          // Determine who raised the dispute based on wallet address
          const raisedBy = job.client === wallet ? "client" : "freelancer";
          
          disputes.push({
            id: `D-${String(i).padStart(3, "0")}`,
            jobId,
            jobTitle: `Job #${jobId}`,
            client: job.client,
            freelancer: job.freelancer || "Pending",
            amount: Number(job.amount) / 10_000_000, // Convert from stroops to XLM
            raisedBy,
            raisedAt: evidence.raised_at,
            status: "Active",
            reason: evidence.reason_preview.replace(/\0/g, "").trim(),
            evidence: evidence.evidence_hash ? `Evidence hash: ${evidence.evidence_hash}` : undefined,
            evidenceHash: evidence.evidence_hash || undefined,
          });
        }
      }

      // Check if job is eligible for dispute (InProgress or SubmittedForReview)
      if (
        (job.status === "InProgress" || job.status === "SubmittedForReview") &&
        (job.client === wallet || job.freelancer === wallet)
      ) {
        const counterparty = job.client === wallet ? job.freelancer : job.client;
        eligibleJobs.push({
          id: jobId,
          title: `Job #${jobId}`,
          counterparty: counterparty || "Unknown",
          amount: Number(job.amount) / 10_000_000,
        });
      }
    }

    return {
      disputes,
      eligibleJobs,
    };
  } catch (error) {
    console.error("Error loading disputes data:", error);
    throw new Error("Failed to load disputes from contract");
  }
}
