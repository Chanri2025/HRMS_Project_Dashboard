import React from "react";
import {Card} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";

/**
 * CommonTableCard
 *
 * Props:
 * - columns: [
 *     {
 *       key: string,
 *       header: string,
 *       headerClassName?: string,
 *       cellClassName?: string,
 *       render?: (row, rowIndex) => ReactNode
 *     }
 *   ]
 * - data: array of rows (any shape)
 * - isLoading?: boolean
 * - isError?: boolean
 * - emptyText?: string
 */
export const CommonTableCard = ({
                                    columns = [],
                                    data = [],
                                    isLoading = false,
                                    isError = false,
                                    emptyText = "No records found.",
                                }) => {
    return (
        <Card className="p-4">
            {isLoading && (
                <p className="text-sm text-muted-foreground">
                    Loading...
                </p>
            )}

            {isError && !isLoading && (
                <p className="text-sm text-destructive">
                    Something went wrong. Please try again.
                </p>
            )}

            {!isLoading && !isError && (!data || data.length === 0) && (
                <p className="text-sm text-muted-foreground">
                    {emptyText}
                </p>
            )}

            {!isLoading && !isError && data && data.length > 0 && (
                <ScrollArea className="max-h-[70vh]">
                    <div className="min-w-full overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-muted/60">
                            <tr className="text-left">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={
                                            col.headerClassName ||
                                            "px-3 py-2 font-medium text-muted-foreground"
                                        }
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody>
                            {data.map((row, rowIndex) => (
                                <tr
                                    key={row.id || row._id || rowIndex}
                                    className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={
                                                col.cellClassName || "px-3 py-2 align-top"
                                            }
                                        >
                                            {col.render
                                                ? col.render(row, rowIndex)
                                                : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </ScrollArea>
            )}
        </Card>
    );
};
