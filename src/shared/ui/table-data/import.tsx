import { toast } from 'react-toastify';
import { Input } from '@/shared/ui/input';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { useMeStore } from '@/store/useMeStore';
import { useRef, useState, useEffect } from 'react';
import { X, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/dialogTable';

interface ImportModalProps {
  tableName: string;
  onImportSuccess?: () => void;
}

interface Branch {
  id: number;
  branch_name_en: string;
}

export function Import({ tableName, onImportSuccess }: ImportModalProps) {
  const { t } = useTranslation('table');

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // drag state
  const [isImporting, setIsImporting] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (branches && branches.length > 0 && selectedBranch === 0) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast.error(t('import.invalidFileType'));
      return;
    }
    setFile(selectedFile);
  };

  const handleBranchSelect = (branchId: number) => {
    setSelectedBranch(branchId);
    setIsSelectOpen(false);
  };

  const toggleSelect = () => {
    if (!isLoadingBranches) {
      setIsSelectOpen(!isSelectOpen);
    }
  };

  const getSelectedBranchName = (): string => {
    if (!branches || branches.length === 0) {
      return isLoadingBranches ? t('import.loadingBranches') : t('import.selectBranch');
    }
    const selected = branches.find((branch) => branch.id === selectedBranch);
    return selected ? selected.branch_name_en : t('import.selectBranch');
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t('import.selectFile'));
      return;
    }
    if (!selectedBranch) {
      toast.error(t('import.selectBranch'));
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('organization_id', String(useMeStore.getState().organizationId));
      formData.append('branch_id', String(selectedBranch));
      formData.append('file', file);

      // TODO: Implement import logic here
      // For now, this is a placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOpen(false);
      resetForm();
      toast.success(t('import.success'));
      onImportSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('import.error');
      const detailedErrors = error?.response?.data?.errors;
      if (detailedErrors) {
        Object.values(detailedErrors).forEach((errorArray: any) => {
          errorArray.forEach((err: string) => {
            toast.error(err);
          });
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    if (branches && branches.length > 0) {
      setSelectedBranch(branches[0].id);
    } else {
      setSelectedBranch(0);
    }
    setIsSelectOpen(false);
    const fileInput = document.getElementById('import-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outlined"
          className="h-8 px-2 md:mr-2  lg:px-3 md:mt-0 text-foreground border-border"
        >
          <Upload className="w-4 h-4 mr-2" />
          {t('import')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t('import.title', { table: tableName })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('import.branch')}</label>
            <div ref={selectRef} className="relative">
              <button
                type="button"
                onClick={toggleSelect}
                disabled={isLoadingBranches}
                className={`
                  w-full bg-background 
                  border-2 border-border 
                  text-foreground
                  rounded-md
                  shadow-sm
                  hover:border-border
                  focus:border-primary
                  focus:ring-2 focus:ring-primary focus:ring-opacity-20
                  transition-all duration-200
                  h-10
                  px-3
                  text-left
                  flex items-center justify-between
                  ${isLoadingBranches ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="truncate text-foreground">{getSelectedBranchName()}</span>
                {isLoadingBranches ? (
                  <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                ) : isSelectOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isSelectOpen && (
                <div
                  className="
                  absolute top-full left-0 right-0 z-50
                  bg-background 
                  border-2 border-border 
                  border-t-0
                  rounded-b-md
                  shadow-lg
                  max-h-60
                  overflow-y-auto text-foreground
                  mt-[-2px]
                "
                >
                  {branches && branches.length > 0 ? (
                    branches.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => handleBranchSelect(branch.id)}
                        className={`
                          px-3 py-2
                          cursor-pointer
                          transition-colors duration-150
                          text-foreground 
                          hover:bg-primary/10
                          ${selectedBranch === branch.id ? 'bg-primary/20 font-medium' : ''}
                        `}
                      >
                        {branch.branch_name_en}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-muted-foreground text-center">
                      {isLoadingBranches ? t('import.loadingBranches') : t('import.selectBranch')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* File Upload Section with Drag & Drop */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('import.file')}</label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-4 text-center 
                transition-colors duration-200
                ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  validateAndSetFile(e.dataTransfer.files[0]);
                  e.dataTransfer.clearData();
                }
              }}
            >
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {file ? file.name : isDragging ? t('import.dropHere') : t('import.chooseFile')}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {t('import.supportedFormats')}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outlined" onClick={() => setOpen(false)} disabled={isImporting}>
              <X className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || !selectedBranch || isImporting}
              className="bg-primary text-primary-foreground"
            >
              {isImporting ? t('import.importing') : t('import.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
