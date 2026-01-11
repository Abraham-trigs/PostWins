// filepath: apps/backend/src/modules/routing/mock-engine.ts
import { IntakeService } from "../intake/intake.service";
import { PostWinRoutingService } from "./postwin-routing.service";
import { VerificationService } from "../verification/verification.service";
import { PostWin, ExecutionBody } from "@posta/core";

export class PostaMockEngine {
  constructor(
    private intake: IntakeService,
    private router: PostWinRoutingService,
    private verifier: VerificationService
  ) {}

  async runSimulation() {
    console.log("🚀 Starting Mock Simulation: SDG 4 - Primary Education");

    // STEP 1: Intake
    const partialPW = await this.intake.handleIntake(
      "I need support for school enrollment",
      "device_rural_001"
    );

    // Mock execution bodies
    const bodies: ExecutionBody[] = [
      {
        id: "NGO_LOCAL",
        name: "Village Support",
        location: { lat: 5.1, lng: -0.1, radius: 10 },
        capabilities: ["SDG_4"],
        trustScore: 0.9
      }
    ];

    // Construct PostWin candidate
    // Note: taskId set to 'START' to pass TaskService validation
    const mockPostWin: PostWin = {
      ...partialPW,
      id: "pw_mock_123",
      beneficiaryId: "ben_001",
      taskId: "t1", 
      location: { lat: 5.101, lng: -0.101 },
      sdgGoals: ["SDG_4"],
      auditTrail: partialPW.auditTrail || [],
      verificationRecords: [], 
      routingStatus: "UNASSIGNED",
      verificationStatus: "PENDING",
      description: "School support"
    } as PostWin;

    // STEP 2: Routing
    console.log("Step 2: Routing to nearest Execution Body...");
    const fullPW = await this.router.processPostWin(
      mockPostWin,
      bodies,
      ["SDG_4"]
    );

    // Safety Check: If routing failed/blocked, stop before verification crash
    if (fullPW.routingStatus === "BLOCKED") {
      console.error(`❌ Routing Blocked: ${fullPW.notes}`);
      return;
    }

    // STEP 3: Logging
    console.log(
      `Step 3: Routed to ${fullPW.assignedBodyId}. Awaiting Multi-Verifier Consensus...`
    );

    // STEP 4: Multi-verifier consensus
    // VerificationService requires the key "SDG_4" to exist in fullPW.verificationRecords
    await this.verifier.recordVerification(
      fullPW,
      "community_leader_01",
      "SDG_4"
    );

    const finalState = await this.verifier.recordVerification(
      fullPW,
      "ngo_staff_01",
      "SDG_4"
    );

    // STEP 5: Results
    console.log("✅ Simulation Complete.");
    console.log("Final Verification Status:", finalState.verificationStatus);
    console.log("Audit Trail Entries:", finalState.auditTrail.length);
  }
}
