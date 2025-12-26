import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2, FileSpreadsheet, FileText, Download } from 'lucide-react';

interface ProductFile {
  name: string;
  created_at: string;
  metadata: Record<string, any> | null;
}

const ProductManager = () => {
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from('products')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      toast.error('خطا در دریافت فایل‌ها');
      console.error(error);
    } else {
      setFiles(data as ProductFile[] || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('فقط فایل‌های PDF و Excel مجاز هستند');
      return;
    }

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (error) {
      toast.error('خطا در آپلود فایل');
      console.error(error);
    } else {
      toast.success('فایل با موفقیت آپلود شد');
      fetchFiles();
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;

    const { error } = await supabase.storage
      .from('products')
      .remove([fileName]);

    if (error) {
      toast.error('خطا در حذف فایل');
      console.error(error);
    } else {
      toast.success('فایل با موفقیت حذف شد');
      fetchFiles();
    }
  };

  const handleDownload = async (fileName: string) => {
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    window.open(data.publicUrl, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">مدیریت محصولات</h2>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>آپلود فایل جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              فایل‌های PDF و Excel (XLS, XLSX, CSV) مجاز هستند
            </p>
            <div className="flex items-center gap-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploading ? 'در حال آپلود...' : 'انتخاب فایل'}</span>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.xls,.xlsx,.csv"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام فایل</TableHead>
                <TableHead className="text-right">نوع</TableHead>
                <TableHead className="text-right">حجم</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
                <TableHead className="text-left w-24">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    هنوز فایلی آپلود نشده
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.metadata?.mimetype || '')}
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.metadata?.mimetype?.split('/').pop()?.toUpperCase() || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.metadata?.size ? formatFileSize(file.metadata.size) : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file.name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManager;
