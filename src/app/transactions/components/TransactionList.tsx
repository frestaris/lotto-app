"use client";

import * as Icons from "lucide-react";
import { UserTransaction } from "@/types/transaction";
import { getGameColor } from "@/utils/getGameColor";

interface Props {
  transactions: UserTransaction[];
}

export default function TransactionList({ transactions }: Props) {
  if (!transactions?.length) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        No transactions found.
      </p>
    );
  }

  // 🧮 Group TICKET_PURCHASE or DEBIT transactions by game + draw
  const groupedPurchases: UserTransaction[][] = [];
  const groupedMap: Record<string, UserTransaction[]> = {};
  const singles: UserTransaction[] = [];

  for (const tx of transactions) {
    if ((tx.type === "TICKET_PURCHASE" || tx.type === "DEBIT") && tx.game) {
      const drawInfo = (tx as UserTransaction & { draw?: { id?: string } })
        .draw;
      const key = `${tx.game.id}-${drawInfo?.id || "none"}`;
      if (!groupedMap[key]) groupedMap[key] = [];
      groupedMap[key].push(tx);
    } else {
      singles.push(tx);
    }
  }

  Object.values(groupedMap).forEach((group) => groupedPurchases.push(group));

  // 🧩 Build final unified list with explicit shape
  type Item =
    | { kind: "GROUP"; txs: UserTransaction[] }
    | { kind: "SINGLE"; tx: UserTransaction };

  const allItems: Item[] = [
    ...groupedPurchases.map((g) => ({ kind: "GROUP" as const, txs: g })),
    ...singles.map((t) => ({ kind: "SINGLE" as const, tx: t })),
  ];

  // ✅ Sort safely by date
  allItems.sort((a, b) => {
    const aDate =
      a.kind === "GROUP"
        ? new Date(a.txs[0].createdAt).getTime()
        : new Date(a.tx.createdAt).getTime();
    const bDate =
      b.kind === "GROUP"
        ? new Date(b.txs[0].createdAt).getTime()
        : new Date(b.tx.createdAt).getTime();
    return bDate - aDate;
  });
  console.log(transactions);
  return (
    <div className="divide-y divide-white/10 border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      {allItems.map((item) => {
        // GROUPED ticket purchases
        if (item.kind === "GROUP") {
          const group = item.txs;
          const first = group[0];
          const draw = (
            first as UserTransaction & {
              draw?: { drawNumber?: number; drawDate?: string };
            }
          ).draw;
          const total = group.reduce((s, t) => s + Math.abs(t.amountCents), 0);
          const count = group.length;
          const color = getGameColor(first.game?.slug);
          const Icon =
            (Icons[
              first.game?.iconName as keyof typeof Icons
            ] as React.ElementType) || Icons.Gamepad2;
          console.log(transactions);
          return (
            <div
              key={`${first.game?.id}-${draw?.drawNumber ?? "none"}`}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>

                <div>
                  <p className="font-medium text-yellow-400">
                    {first.game?.name || "Unknown Game"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {draw?.drawNumber ? `Draw ${draw.drawNumber}` : ""}
                    {draw?.drawDate
                      ? ` — ${new Date(draw.drawDate).toLocaleDateString(
                          "en-AU",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}`
                      : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {count} ticket{count > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="font-semibold text-red-400">
                -${(total / 100).toFixed(2)}
              </div>
            </div>
          );
        }

        // 🪙 SINGLE transaction (CREDIT / PAYOUT)
        const tx = item.tx;
        const isCredit =
          tx.type === "PAYOUT" || tx.type === "CREDIT" || tx.amountCents > 0;
        const formattedDate = new Intl.DateTimeFormat("en-AU", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(tx.createdAt));

        let displayName = tx.description || tx.type.replace(/_/g, " ");
        let iconName = tx.game?.iconName ?? "Coins";
        let displayColor = getGameColor(tx.game?.slug ?? "");

        if (!tx.game) {
          switch (tx.type) {
            case "CREDIT":
              displayName = "Manual Top-Up";
              iconName = "Coins";
              displayColor = "text-yellow-400";
              break;
            case "PAYOUT":
              displayName = "Win Payout";
              iconName = "Coins";
              displayColor = "text-green-400";
              break;
            default:
              displayName = "Other";
              iconName = "Wallet";
              displayColor = "text-yellow-400";
              break;
          }
        }

        if (tx.type === "PAYOUT") iconName = "Coins";
        displayColor = "text-yellow-400";

        const Icon =
          (Icons[iconName as keyof typeof Icons] as React.ElementType) ||
          Icons.Coins;

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20">
                <Icon className={`w-5 h-5 ${displayColor}`} />
              </div>
              <div>
                <p className="font-medium text-yellow-400">{displayName}</p>
                <p className="text-xs text-gray-500">{formattedDate}</p>
              </div>
            </div>

            <div
              className={`font-semibold ${
                isCredit ? "text-green-400" : "text-red-400"
              }`}
            >
              {isCredit ? "+" : "-"}$
              {(Math.abs(tx.amountCents) / 100).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
