"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

interface ActivityFiltersProps {
  years: number[];
  months: number[];
  selectedYear: number | "all";
  selectedMonth: number | "all";
  onYearChange: (year: number | "all") => void;
  onMonthChange: (month: number | "all") => void;
}

export default function ActivityFilters({
  years,
  months,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: ActivityFiltersProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          sx={{ minWidth: 32 }}
        >
          연도
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Chip
            label="전체"
            size="small"
            color={selectedYear === "all" ? "primary" : "default"}
            variant={selectedYear === "all" ? "filled" : "outlined"}
            onClick={() => onYearChange("all")}
          />
          {years.map((year) => (
            <Chip
              key={year}
              label={year}
              size="small"
              color={selectedYear === year ? "primary" : "default"}
              variant={selectedYear === year ? "filled" : "outlined"}
              onClick={() => onYearChange(year)}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          sx={{ minWidth: 32 }}
        >
          월
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Chip
            label="전체"
            size="small"
            color={selectedMonth === "all" ? "primary" : "default"}
            variant={selectedMonth === "all" ? "filled" : "outlined"}
            onClick={() => onMonthChange("all")}
          />
          {months.map((month) => (
            <Chip
              key={month}
              label={`${month.toString().padStart(2, "0")}월`}
              size="small"
              color={selectedMonth === month ? "primary" : "default"}
              variant={selectedMonth === month ? "filled" : "outlined"}
              onClick={() => onMonthChange(month)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
