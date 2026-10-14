import { redirect } from "next/navigation";

/**
 * Meetings live in Communications → Meetings (live DB). This old static page
 * now just forwards there so existing links keep working.
 */
export default function MeetingSchedulePage() {
  redirect("/admin-dashboard/connect/meetings");
}
