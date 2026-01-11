// filepath: apps/backend/src/modules/routing/journey.service.ts
import { Task, Journey, PostWin, ExecutionBody } from "@posta/core";

export class JourneyService {
  private educationPath: Task[] = [
    { id: 'ENROLL', order: 1, label: 'School Enrollment', requiredForSdg: 'SDG_4', dependencies: [] },
    { id: 'ATTEND', order: 2, label: 'Consistent Attendance', requiredForSdg: 'SDG_4', dependencies: ['ENROLL'] },
    { id: 'MODULE_1', order: 3, label: 'Basic Literacy', requiredForSdg: 'SDG_4', dependencies: ['ATTEND'] }
  ];

  private journeys = new Map<string, Journey>();

  public getOrCreateJourney(beneficiaryId: string): Journey {
    if (!this.journeys.has(beneficiaryId)) {
      this.journeys.set(beneficiaryId, {
        id: 'journey_' + beneficiaryId,
        beneficiaryId,
        currentTaskId: this.educationPath[0].id,
        completedTaskIds: []
      });
    }
    return this.journeys.get(beneficiaryId)!;
  }

  public canAdvance(beneficiaryId: string, taskId: string): { allowed: boolean; reason?: string } {
    const journey = this.getOrCreateJourney(beneficiaryId);
    const task = this.educationPath.find(t => t.id === taskId);
    if (!task) return { allowed: false, reason: "Task not in SDG path" };
    for (const depId of task.dependencies) {
      if (!journey.completedTaskIds.includes(depId)) {
        const depTask = this.educationPath.find(t => t.id === depId);
        return { allowed: false, reason: `Prerequisite "${depTask?.label}" not met.` };
      }
    }
    return { allowed: true };
  }

  public completeTask(beneficiaryId: string, taskId: string) {
    const journey = this.getOrCreateJourney(beneficiaryId);
    if (!journey.completedTaskIds.includes(taskId)) {
      journey.completedTaskIds.push(taskId);
      const nextTask = this.educationPath.find(t => t.order > (this.educationPath.find(p => p.id === taskId)?.order || 0));
      if (nextTask) journey.currentTaskId = nextTask.id;
    }
  }

  public async routePostWin(postWin: PostWin, availableBodies: ExecutionBody[]): Promise<string> {
    // 1. Author's Choice
    if (postWin.preferredBodyId) {
      const preferred = availableBodies.find(b => b.id === postWin.preferredBodyId);
      if (preferred && this.isBodyCapable(preferred, postWin)) return preferred.id;
    }

    // 2. Filter by SDG Capability (Explicitly cast as string to avoid type mismatches)
    const matches = availableBodies.filter(body =>
      postWin.sdgGoals.every(goal => body.capabilities.includes(goal as any))
    );

    // Fallback if no matching capability found
    if (matches.length === 0) return 'Khalistar_Foundation';

    // 3. Sort by proximity and find high trust
    const bestMatch = matches
      .sort((a, b) => this.calculateProximity(a, postWin) - this.calculateProximity(b, postWin))
      .find(body => (body.trustScore || 0) >= 0.7);

    // CRITICAL: Force a string literal fallback to prevent undefined
    return bestMatch ? bestMatch.id : 'Khalistar_Foundation';
  }

  private isBodyCapable(body: ExecutionBody, postWin: PostWin): boolean {
    return postWin.sdgGoals.every(goal => body.capabilities.includes(goal));
  }

  private calculateProximity(body: ExecutionBody, postWin: PostWin): number {
    if (!postWin.location) return Infinity;
    return Math.sqrt(
      Math.pow(body.location.lat - postWin.location.lat, 2) +
      Math.pow(body.location.lng - postWin.location.lng, 2)
    );
  }
}
