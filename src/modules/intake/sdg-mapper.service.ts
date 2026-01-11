import { PostWin, SDG_TARGETS } from "@posta/core";

export class SdgMapperService {
  /**
   * Section O.1: Automatically tags PostWins for institutional reporting
   */
  async mapImpact(postWin: PostWin): Promise<string[]> {
    const tags: string[] = [];
    const text = postWin.description.toLowerCase();

    // Map to SDG 4 Targets
    if (text.includes('school') || text.includes('uniform')) tags.push(SDG_TARGETS.SDG_4.PRIMARY);
    if (text.includes('read') || text.includes('write')) tags.push(SDG_TARGETS.SDG_4.LITERACY);

    // Map to SDG 5 Targets
    if (text.includes('girl') || text.includes('woman')) tags.push(SDG_TARGETS.SDG_5.EMPOWERMENT);

    return tags;
  }
}
