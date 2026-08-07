import type { ActionStatus, CampaignRow } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const statusClasses: Record<ActionStatus, string> = {
  scale: "bg-primary/15 text-primary",
  fix: "bg-yellow-300/15 text-yellow-200",
  pause: "bg-red-400/15 text-red-200",
  watch: "border-border bg-secondary text-secondary-foreground"
};

export function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-0">
        <CardTitle>Search opportunities</CardTitle>
        <p className="text-sm text-muted-foreground">Live Search Console query and page rows ranked by current demand.</p>
      </CardHeader>
      <CardContent className="pt-4">
        {campaigns.length === 0 ? (
          <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
            No Search Console rows returned for this range yet.
          </div>
        ) : (
        <div className="overflow-x-auto rounded-md border border-border">
        <Table className="min-w-[840px]">
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="px-3 text-xs text-muted-foreground">Query</TableHead>
              <TableHead className="px-3 text-xs text-muted-foreground">Channel</TableHead>
              <TableHead className="px-3 text-xs text-muted-foreground">Metric</TableHead>
              <TableHead className="px-3 text-xs text-muted-foreground">Page signal</TableHead>
              <TableHead className="px-3 text-xs text-muted-foreground">Next move</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.name} className="border-border align-top">
                <TableCell className="px-3 py-3 font-medium text-foreground">{campaign.name}</TableCell>
                <TableCell className="px-3 py-3 text-muted-foreground">{campaign.channel}</TableCell>
                <TableCell className="px-3 py-3 font-semibold text-primary">{campaign.metric}</TableCell>
                <TableCell className="max-w-[280px] whitespace-normal px-3 py-3 leading-6 text-muted-foreground">
                  {campaign.signal}
                </TableCell>
                <TableCell className="px-3 py-3">
                  <Badge className={statusClasses[campaign.status]}>
                    {campaign.nextMove}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
