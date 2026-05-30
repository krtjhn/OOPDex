// Import React
import React from 'react';
// Import GlassCard component
import GlassCard from './GlassCard';
// Import icons from lucide-react
import { ChevronLeft, ChevronRight } from 'lucide-react';

// PaginatedTable component
const PaginatedTable = ({ 
  columns, 
  data, 
  loading, 
  pagination, 
  onPageChange,
  emptyMessage = "No records found."
}) => {
  return (
    <div
      // Main wrapper div
      className="space-y-4"
    >
      <GlassCard
        // Glass card container
        className="p-0 overflow-hidden border-white/10"
      >
        <div
          // Horizontal scroll container
          className="overflow-x-auto"
        >
          <table
            // Table element
            className="w-full text-left border-collapse"
          >
            <thead>
              <tr
                // Header row
                className="bg-white/5 border-b border-white/10"
              >
                {
                  // Map over columns array
                  columns.map((col, index) => (
                    <th
                      // Header cell
                      key={index}
                      className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {
                        // Column header title
                        col.header
                      }
                    </th>
                  ))
                }
              </tr>
            </thead>
            <tbody
              // Table body
              className="divide-y divide-white/5"
            >
              {
                // Check if loading state is true
                loading ? (
                  <tr
                    // Loading row
                  >
                    <td
                      // Full width cell
                      colSpan={columns.length}
                      className="px-6 py-12 text-center"
                    >
                      <div
                        // Loading spinner
                        className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"
                      ></div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  // Map over data array
                  data.map((row, rowIndex) => (
                    <tr
                      // Data row
                      key={rowIndex}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {
                        // Map over columns array
                        columns.map((col, colIndex) => (
                          <td
                            // Data cell
                            key={colIndex}
                            className="px-6 py-4 text-slate-300"
                          >
                            {
                              // Custom render function or accessor string
                              col.render ? col.render(row) : (row[col.accessor] || '—')
                            }
                          </td>
                        ))
                      }
                    </tr>
                  ))
                ) : (
                  <tr
                    // Empty state row
                  >
                    <td
                      // Full width cell
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      {
                        // Empty message text
                        emptyMessage
                      }
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </GlassCard>

      {
        // Pagination controls wrapper
        pagination && (
          <div
            // Flex container
            className="flex items-center justify-between px-2"
          >
            <p
              // Results count label
              // Text
              className="text-sm text-slate-500"
            >
              Showing <span className="text-white font-medium">{data.length}</span> results
            </p>
            <div
              // Pagination buttons flex container
              className="flex items-center gap-2"
            >
              <button
                // Previous page button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft
                  // Chevron icon
                  size={18}
                />
              </button>
              <span
                // Current page label
                // Text
                className="text-sm text-white px-3 py-1 bg-white/5 rounded-md border border-white/10"
              >
                Page {pagination.currentPage + 1}
              </span>
              <button
                // Next page button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.isLast}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronRight
                  // Chevron icon
                  size={18}
                />
              </button>
            </div>
          </div>
        )
      }
    </div>
  );
};

// Export PaginatedTable component
export default PaginatedTable;
