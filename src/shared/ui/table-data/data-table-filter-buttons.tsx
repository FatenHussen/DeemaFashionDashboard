import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { useTranslation } from 'react-i18next';


interface IFilterParams {
  start_date?: string;
  end_date?: string;
  branch_id?: number;
}

const DataTableFilterButtons = () => {
  const [filterParams, setFilterParams] = useState<IFilterParams>({});
  const { t } = useTranslation('table');

  //handeDateChange
  const handleDateChange =
    (field: 'start_date' | 'end_date') => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterParams((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <div className="flex gap-2 mx-2">
      <Input
        type="date"
        id="start_date"
        placeholder={t('columns.startDate')}
        className="min-w-[120px] max-w-[150px]"
        value={filterParams.start_date}
        onChange={handleDateChange('start_date')}
      />

      <Input
        type="date"
        id="end_date"
        placeholder={t('columns.endDate')}
        className="min-w-[120px] max-w-[150px]"
        value={filterParams.end_date}
        onChange={handleDateChange('end_date')}
      />
    </div>
  );
};

export default DataTableFilterButtons;

// import { useFetchBranches } from "@/hooks/settings/useBranches";
// import { CustomSelect } from "../select/customSelect";
// import { useEffect, useMemo, useState } from "react";
// import { useFetchFilteredTransactions } from "@/hooks/settings/useTransactions";
// import { useParams } from "react-router";
// import Input from "@/components/form/input/InputField";
// import { Filter, X } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import DatePicker from "react-flatpickr";

// interface IFilterParams {
//   start_date?: string;
//   end_date?: string;
//   branch_id?: number;
// }

// const DataTableFilterButtons = () => {
//   const { data: branches } = useFetchBranches();
//   const [filterParams, setFilterParams] = useState<IFilterParams>({});
//   const { id } = useParams();

//   const {
//     data: filteredData,
//     refetch,
//     isFetching
//   } = useFetchFilteredTransactions(Number(id), filterParams);

//   const branchOptions = useMemo(() => [
//     { value: '', label: 'All Branches' },
//     ...(branches?.map((b) => ({
//       value: b.id.toString(),
//       label: b.branch_name_en,
//     })) || [])
//   ], [branches]);

//   const handleBranchSelect = (value: string) => {
//     setFilterParams(prev => ({
//       ...prev,
//       branch_id: value ? Number(value) : undefined,
//     }));
//   };

//   const handleDateChange = (field: 'start_date' | 'end_date', value?: string) => {
//     setFilterParams(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const resetFilters = () => {
//     setFilterParams({});
//   };

//   useEffect(() => {
//     if (filterParams.start_date || filterParams.end_date || filterParams.branch_id) {
//       refetch();
//     }
//   }, [filterParams, refetch]);

//   const hasFilters = filterParams.start_date || filterParams.end_date || filterParams.branch_id;

//   return (
//     <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg dark:bg-gray-800">
//       <div className="flex items-center gap-2">
//         <Filter className="w-4 h-4 text-gray-500" />
//         <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filters:</span>
//       </div>

//       <div className="flex flex-wrap items-center gap-3">
//         <CustomSelect
//           name='branches'
//           options={branchOptions}
//           placeholder="Branch"
//           value={filterParams.branch_id?.toString() || ''}
//           onChange={handleBranchSelect}
//           className="min-w-[150px]"
//         />

//         <DatePicker
//           placeholder="Start Date"
//           value={filterParams.start_date}
//           onChange={(date) => handleDateChange('start_date', date)}
//           className="w-[150px]"
//         />

//         <DatePicker
//           placeholder="End Date"
//           value={filterParams.end_date}
//           onChange={(date) => handleDateChange('end_date', date)}
//           className="w-[150px]"
//         />

//         {hasFilters && (
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={resetFilters}
//             className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//           >
//             <X className="w-4 h-4 mr-1" />
//             Clear
//           </Button>
//         )}
//       </div>

//       {isFetching && (
//         <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
//           Loading...
//         </div>
//       )}
//     </div>
//   );
// }

// export default DataTableFilterButtons;
