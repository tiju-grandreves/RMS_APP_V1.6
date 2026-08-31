import { Smartphone } from "lucide-react";

export default function DataTable({
  data = [],
  columns = [],
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid rgba(57,80,98,0.1)",
        boxShadow: "0 1px 4px rgba(2,80,98,0.06)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(57,80,98,0.1)",
                background: "#F7FDFF",
              }}
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#5a7585" }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  <Smartphone
                    className="w-8 h-8 mx-auto mb-2 opacity-30"
                    style={{ color: "#5a7585" }}
                  />

                  <p
                    className="text-sm"
                    style={{ color: "#5a7585" }}
                  >
                    No records found
                  </p>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="transition-colors hover:bg-[#F7FDFF]"
                  style={{
                    borderBottom:
                      "1px solid rgba(57,80,98,0.06)",
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-2"
                    >
                      {column.render
                        ? column.render(row, index)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* <div
        className="px-4 py-3 border-t"
        style={{
          borderColor: "rgba(57,80,98,0.08)",
        }}
      >
        <p
          className="text-xs"
          style={{ color: "#5a7585" }}
        >
          {data.length} records
        </p>
      </div> */}
    </div>
  );
}