import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { findAdmin, listAdminInvites, listAdmins, listCallbackRequests } from "@/lib/admins";
import { inviteAdmin } from "@/app/admin/actions";

function formatDate(value: string | null) {
  if (!value) {
    return "None";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/admin/sign-in");
  }

  const admin = findAdmin(email);
  if (!admin) {
    redirect("/admin/sign-in?error=AccessDenied");
  }

  const callbacks = listCallbackRequests();
  const admins = listAdmins();
  const invites = listAdminInvites();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/40 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin portal</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">AI Consultation Debug Center</h1>
            <p className="mt-2 text-slate-300">Signed in as {email}</p>
          </div>
          <a
            href="/api/auth/signout?callbackUrl=/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign out
          </a>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Callbacks</p>
                <h2 className="mt-2 text-2xl font-semibold">Recent callback jobs</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {callbacks.length} shown
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Scheduled</th>
                    <th className="py-3 pr-4">Updated</th>
                    <th className="py-3 pr-4">Last error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {callbacks.map((callback) => (
                    <tr key={callback.id}>
                      <td className="py-4 pr-4 font-semibold">{callback.phone_number}</td>
                      <td className="py-4 pr-4">{callback.request_type}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {callback.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4">{formatDate(callback.scheduled_for)}</td>
                      <td className="py-4 pr-4">{formatDate(callback.updated_at)}</td>
                      <td className="max-w-xs py-4 pr-4 text-red-700">{callback.last_error || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Invite admins</p>
              <h2 className="mt-2 text-2xl font-semibold">Send invite</h2>
              <form action={inviteAdmin} className="mt-5 space-y-3">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="teammate@example.com"
                  className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Send Gmail invite
                </button>
              </form>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Admins</p>
              <div className="mt-5 space-y-3">
                {admins.map((adminRecord) => (
                  <div key={adminRecord.email} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold">{adminRecord.email}</p>
                    <p className="mt-1 text-sm text-slate-500">Last login: {formatDate(adminRecord.lastLoginAt)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Invites</p>
              <div className="mt-5 space-y-3">
                {invites.map((invite) => (
                  <div key={invite.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold">{invite.email}</p>
                    <p className="mt-1 text-sm text-slate-500">Status: {invite.status}</p>
                    <p className="mt-1 text-sm text-slate-500">Expires: {formatDate(invite.expiresAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
