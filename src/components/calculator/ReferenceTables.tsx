import type { ContentTable } from '../../calculators/types';

export function ReferenceTables({ tables }: { tables?: ContentTable[] }) {
  if (!tables || tables.length === 0) return null;
  return (
    <section className="content-section" aria-labelledby="reference-heading">
      <h2 id="reference-heading">Quick reference</h2>
      {tables.map((table) => (
        <div className="table-wrap" key={table.caption}>
          <table className="table">
            <caption>{table.caption}</caption>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th key={index} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={index}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
