import React from 'react';
import { TableCell, TableRow, IconButton } from '@mui/material';
import { FlashOn } from '@mui/icons-material';

function JobSheetRow({ sheet, handleMenuClick, formatDate, theme, isCompletedJobsTable }) {
    const childRowBackgroundColor = theme.palette.mode === 'dark' ? '#292929' : '#eeeeee';

    return (
        <TableRow sx={{ backgroundColor: childRowBackgroundColor }}>
            {/* Indent for Job Number */}
            <TableCell sx={{ border: 0, width: isCompletedJobsTable ? '14%' : '15%' }} />

            {/* Date */}
            <TableCell sx={{ border: 0, width: isCompletedJobsTable ? '14%' : '15%' }}>{formatDate(sheet.date)}</TableCell>

            {/* Client (Company Name) - always empty in child row */}
            <TableCell sx={{ border: 0, width: isCompletedJobsTable ? '22%' : '25%' }} />

            {/* Order */}
            <TableCell sx={{ border: 0, width: isCompletedJobsTable ? '14%' : '15%' }}>{sheet.orderType === 'S.L.A' ? 'S.L.A' : sheet.orderValue}</TableCell>

            {/* Technician - always empty in child row */}
            <TableCell sx={{ border: 0, width: isCompletedJobsTable ? '10%' : '15%' }} />

            {/* Invoice # (only for Completed Jobs Table) */}
            {isCompletedJobsTable && <TableCell sx={{ border: 0, width: '9%' }}>{sheet.invoiceNumber}</TableCell>}

            {/* Status */}
            <TableCell sx={{ border: 0, width: '10%' }}>{sheet.status}</TableCell>

            {/* Actions */}
            <TableCell sx={{ border: 0, width: isCompletedJobsTable ? '7%' : '5%' }}>
                <IconButton onClick={(e) => handleMenuClick(e, sheet, true, isCompletedJobsTable)}>
                    <FlashOn />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}

export default JobSheetRow;
