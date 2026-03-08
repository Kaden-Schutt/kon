import type { PairResponse, ToolDetail } from "@gigai/shared";
import { addServer } from "./config.js";
import { getOrgUUID } from "./identity.js";
import { createHttpClient } from "./http.js";
import { connect } from "./connect.js";
import { fetchTools, fetchToolDetail } from "./discover.js";
import { generateSkillZip, writeSkillZip, hasExistingSkill } from "./skill.js";

export async function pair(code: string, serverUrl: string): Promise<void> {
  const orgUuid = getOrgUUID();
  const http = createHttpClient(serverUrl);

  const res = await http.post<PairResponse>("/auth/pair", {
    pairingCode: code,
    orgUuid,
  });

  await addServer(res.serverName, serverUrl, res.encryptedToken);
  console.log(`Paired with "${res.serverName}" successfully!`);

  // Connect to get a session, then fetch tool details for the skill zip
  let toolDetails: ToolDetail[] | undefined;
  try {
    const session = await connect();
    const authedHttp = createHttpClient(session.serverUrl, session.sessionToken);
    const tools = await fetchTools(authedHttp);
    toolDetails = await Promise.all(
      tools.map(async (t) => {
        const { tool } = await fetchToolDetail(authedHttp, t.name);
        return tool;
      }),
    );
  } catch {
    // Tool fetching is best-effort — skill zip still works without tool files
  }

  // Generate skill zip
  const existing = await hasExistingSkill();
  const zip = await generateSkillZip(res.serverName, serverUrl, res.encryptedToken, toolDetails);
  const outPath = await writeSkillZip(zip);

  console.log(`\nSkill zip written to: ${outPath}`);
  if (existing) {
    console.log("Skill file updated. Download and re-upload to Claude.");
  } else {
    console.log("Upload this file as a skill in Claude (Settings → Customize → Upload Skill).");
  }
}
