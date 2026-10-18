import React from "react";
import "./DataTable.css";

const DataTable = ({ data = [], columns = [], renderRowActions, emptyMessage = "No hay datos", loading = false }) => {
  if (loading) {
    return (
      <div className="datatable-loading">
        <div className="skeleton-table">
          <div className="skeleton-header" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row">
              {columns.map((_, j) => (
                <div key={j} className="skeleton-cell" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="datatable-empty">
        <span className="empty-icon">📋</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="datatable-wrapper">
      <table className="datatable">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row._id || row.id || rowIndex}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "actions" && renderRowActions
                    ? renderRowActions(row)
                    : col.render
                    ? col.render(row)
                    : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;