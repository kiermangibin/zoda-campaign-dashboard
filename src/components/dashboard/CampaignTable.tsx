import type { ActionStatus, CampaignRow } from "@/types/dashboard";

const statusClasses: Record<ActionStatus, string> = {
  scale: "bg-zoda-mint text-zoda-black",
  fix: "bg-yellow-300 text-zoda-black",
  pause: "bg-red-400 text-zoda-black",
  watch: "bg-zoda-panel2 text-zoda-mint border border-zoda-line"
};

export function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <section className="zoda-card overflow-hidden">
      <div className="border-b border-zoda-line p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-zoda-mint">Campaign table</p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase leading-none">Signals and next moves</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[840px] w-full text-left">
          <thead className="bg-zoda-panel2/80 text-xs font-black uppercase tracking-[0.12em] text-zoda-muted">
            <tr>
              <th className="px-5 py-4">Campaign</th>
              <th className="px-5 py-4">Channel</th>
              <th className="px-5 py-4">Metric</th>
              <th className="px-5 py-4">Signal</th>
              <th className="px-5 py-4">Next Move</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.name} className="border-t border-zoda-line align-top">
                <td className="px-5 py-4 text-sm font-black uppercase text-zoda-text">{campaign.name}</td>
                <td className="px-5 py-4 text-sm font-semibold text-zoda-muted">{campaign.channel}</td>
                <td className="px-5 py-4 text-sm font-black text-zoda-mint">{campaign.metric}</td>
                <td className="px-5 py-4 text-sm font-semibold leading-relaxed text-zoda-muted">{campaign.signal}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-3 py-2 text-xs font-black uppercase tracking-[0.1em] ${statusClasses[campaign.status]}`}>
                    {campaign.nextMove}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
