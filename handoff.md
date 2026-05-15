# Handoff

## Project

- Repository: `thedigitaladviser/voice-agent-demo`
- Local workspace: `/home/digitaladviser/voice-agent-demo`
- VPS deployment path: `/docker/agent-demo`
- Live URL: `https://agent.customaisolutions.cc/`

## Work Completed

- Updated the landing page hero copy to the revised 15-minute AI opportunity assessment positioning.
- Tightened hero spacing and card density so the main CTA and callback form sit higher above the fold.
- Updated the workflow snapshot copy in `components/hero.tsx`:
  - `Question 3`: `Which result would matter most right now: more leads, faster follow-up, less admin, or lower costs?`
  - `Outcome`: `A prioritized shortlist of AI opportunities, with expected impact, complexity, and the best first project to test.`
- Removed the old `Outcome (optional)` scheduling CTA block from the mock consultation panel.
- Confirmed the random bottom-right graphic shown in the screenshot was not present in the current repo code.
- Added Docker/VPS deployment support and related documentation already present in the repo.
- Staged, committed, and pushed the initial landing/deployment changes to GitHub.
  - Commit: `f89180a Update landing page content and deployment setup`
- Fixed local Node-version execution for Next scripts.
  - Commit: `66297e4 Fix local Node version for Next scripts`
- Published the latest landing-page consultation copy directly to GitHub because the local `.git` mount was read-only.
  - Commit: `feda33c Update landing page consultation copy`
- Added README documentation for the landing-page consultation copy and the rule that the `Outcome` row should describe an actual assessment deliverable, not another CTA.
  - Commit: `a0eb425 Document landing page consultation copy`
- Added this updated handoff file to GitHub.

## VPS Deployment

- Updated `/docker/agent-demo/components/hero.tsx` with the latest consultation-panel copy.
- Rebuilt the Docker image and recreated `agent-demo-app-1` with `docker compose up -d --build` from `/docker/agent-demo`.
- Build passed inside Docker with Next.js 16.2.2.
- Verified `agent-demo-app-1` restarted and is running.
- Re-applied/kept the VPS-specific `docker-compose.yml` shape because Hostinger Traefik runs in host mode, not through a shared `traefik-proxy` Docker network.
- Fixed the malformed `GMAIL_FROM` line in the VPS `.env` earlier in the deployment work.
- Verified the live site at `https://agent.customaisolutions.cc/` returns the latest copy, including:
  - `Get your AI opportunity report in less than 15 minutes.`
  - `Question 3`
  - `Which result would matter most right now: more leads, faster follow-up, less admin, or lower costs?`
  - `A prioritized shortlist of AI opportunities, with expected impact, complexity, and the best first project to test.`
- Mirrored the updated `README.md` to `/docker/agent-demo/README.md`.

## Notes

- The VPS repo currently has local deployment-only changes to `docker-compose.yml`; keep those unless the repo compose file is updated to support Hostinger's host-mode Traefik setup.
- SQLite data remains mounted under `/docker/agent-demo/data`.
- Local Codex workspace issue: `/home/digitaladviser/voice-agent-demo/.git` is mounted read-only and owned by `nobody:nogroup`, so normal local `git add`/`commit` may fail until the workspace is remounted/reopened.
- Local files such as `handoff.md` may also be owned by `nobody:nogroup`; attempts to patch the local handoff file and run `chmod g+w handoff.md` were refused with `Operation not permitted`.
- GitHub was updated through the connected GitHub API for the latest commits.
