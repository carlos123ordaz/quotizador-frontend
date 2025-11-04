import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    LinearProgress,
    Alert,
    Chip,
    IconButton,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Description as DescriptionIcon,
    PlayArrow as PlayArrowIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    FolderOpen as FolderOpenIcon,
    Close as CloseIcon,
    OpenInNew as OpenInNewIcon,
    AttachFile as AttachFileIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import axios from 'axios';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { openPath, revealItemInDir } from '@tauri-apps/plugin-opener';
import { dirname } from "@tauri-apps/api/path";

// ✅ Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Paleta de colores SAP Fiori
const fioriTheme = {
    primary: '#0B5394', // Azul corporativo
    lightBlue: '#E8F0FF',
    success: '#107C10', // Verde SAP
    lightGreen: '#E7F8E8',
    warning: '#F0F66E', // Amarillo SAP
    lightYellow: '#FFFBEC',
    error: '#E81123',
    lightRed: '#FFE8EA',
    neutral: '#F5F5F5',
    text: '#202020',
    textLight: '#646464',
};

const ReportGenerator = () => {
    const { handleSubmit } = useForm();
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [processedFiles, setProcessedFiles] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState([]);
    const [showErrors, setShowErrors] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);

    const [downloadDialog, setDownloadDialog] = useState({
        open: false,
        filename: '',
        savedPath: '',
    });

    // Manejo de archivos seleccionados
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const excelFiles = selectedFiles.filter((file) =>
            file.name.match(/\.(xlsx|xls|xlsm)$/i)
        );

        if (excelFiles.length !== selectedFiles.length) {
            alert('Solo se permiten archivos Excel (.xlsx, .xls, .xlsm)');
        }

        const newFiles = excelFiles.map((file) => ({
            file,
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            size: (file.size / 1024).toFixed(2),
            status: 'pending',
        }));

        setFiles((prev) => [...prev, ...newFiles]);
    };

    // Eliminar archivo de la lista
    const handleRemoveFile = (fileId) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    // Limpiar todo
    const handleClearAll = () => {
        setFiles([]);
        setResult(null);
        setErrors([]);
        setDownloadUrl(null);
        setProgress(0);
        setProcessedFiles(0);
        setTotalFiles(0);
    };

    // ✅ INTEGRACIÓN REAL CON LA API DE FASTAPI
    const onSubmit = async () => {
        if (files.length === 0) {
            alert('Por favor, selecciona al menos un archivo');
            return;
        }

        setProcessing(true);
        setProgress(0);
        setProcessedFiles(0);
        setTotalFiles(files.length);
        setErrors([]);
        setResult(null);
        setDownloadUrl(null);

        try {
            const formData = new FormData();
            files.forEach((fileObj) => {
                formData.append('files', fileObj.file);
            });

            const response = await axios.post(
                `${API_BASE_URL}/api/reports/generate`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    },
                }
            );

            const data = response.data;

            setErrors(data.errors || []);
            setProcessedFiles(data.processed_files);
            setTotalFiles(data.processed_files + data.files_with_errors);

            setResult({
                success: data.success,
                processedFiles: data.processed_files,
                totalFiles: data.processed_files + data.files_with_errors,
                errors: data.files_with_errors,
                totalRecords: data.total_records,
                filename: data.filename,
                timestamp: data.timestamp,
                processingTime: data.processing_time,
                reportId: data.report_id,
            });

            setDownloadUrl(data.download_url);

            setFiles((prev) =>
                prev.map((f) => ({
                    ...f,
                    status: data.errors.find((e) => e.file === f.name)
                        ? 'error'
                        : 'success',
                }))
            );

            setProgress(100);

        } catch (error) {
            console.error('Error al procesar archivos:', error);

            const errorMessage = error.response?.data?.detail
                || error.message
                || 'Error al procesar los archivos';

            setResult({
                success: false,
                error: errorMessage,
            });

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = async () => {
        if (!downloadUrl) {
            alert('No hay URL de descarga disponible');
            return;
        }

        try {
            const response = await tauriFetch(downloadUrl, { method: 'GET' });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const filePath = await save({
                filters: [{ name: 'Excel', extensions: ['xlsx'] }],
                defaultPath: result.filename,
            });

            if (filePath) {
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                await writeFile(filePath, uint8Array);
                setDownloadDialog({
                    open: true,
                    filename: result.filename,
                    savedPath: filePath,
                });
            }
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            alert('Error al descargar el archivo');
        }
    };

    const handleCloseDownloadDialog = () => {
        setDownloadDialog({ open: false, filename: '', savedPath: '' });
    };

    const handleOpenFile = async () => {
        try {
            await openPath(downloadDialog.savedPath);
        } catch (error) {
            console.error('Error al abrir archivo:', error);
        }
    };

    const handleShowInFolder = async () => {
        try {
            await revealItemInDir(downloadDialog.savedPath);
        } catch (error) {
            console.error('Error al mostrar en carpeta:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return fioriTheme.success;
            case 'error':
                return fioriTheme.error;
            case 'pending':
            default:
                return fioriTheme.textLight;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'success':
                return 'Exitoso';
            case 'error':
                return 'Error';
            case 'pending':
            default:
                return 'Pendiente';
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#FAFAFA',
                py: 4,
                px: 2,
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: fioriTheme.text,
                        mb: 0.5,
                    }}
                >
                    Generador de Reportes
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: fioriTheme.textLight,
                    }}
                >
                    Carga y procesa tus archivos Excel para generar reportes consolidados
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Panel de Carga - Columna Izquierda */}
                <Grid item xs={12} lg={5}>
                    {/* Área de Carga de Archivos */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            bgcolor: 'white',
                            border: '2px dashed',
                            borderColor: fioriTheme.primary,
                            borderRadius: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: fioriTheme.lightBlue,
                                borderColor: fioriTheme.primary,
                            },
                            mb: 3,
                        }}
                        component="label"
                    >
                        <input
                            type="file"
                            multiple
                            accept=".xlsx,.xls,.xlsm"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <Box sx={{ py: 4 }}>
                            <CloudUploadIcon
                                sx={{
                                    fontSize: 64,
                                    color: fioriTheme.primary,
                                    mb: 2,
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: fioriTheme.text,
                                    mb: 1,
                                }}
                            >
                                Arrastra archivos aquí
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: fioriTheme.textLight,
                                }}
                            >
                                o haz clic para seleccionar archivos Excel
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Archivos Cargados */}
                    {files.length > 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: 'white',
                                border: `1px solid`,
                                borderColor: '#E0E0E0',
                                borderRadius: 2,
                                overflow: 'hidden',
                                mb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: fioriTheme.neutral,
                                    p: 2,
                                    borderBottom: `1px solid #E0E0E0`,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: fioriTheme.text,
                                    }}
                                >
                                    Archivos seleccionados ({files.length})
                                </Typography>
                            </Box>

                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        {files.map((fileObj) => (
                                            <TableRow
                                                key={fileObj.id}
                                                sx={{
                                                    '&:hover': { bgcolor: fioriTheme.neutral },
                                                    borderBottom: `1px solid #E0E0E0`,
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        py: 1.5,
                                                        color: fioriTheme.text,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <DescriptionIcon
                                                            sx={{
                                                                fontSize: 20,
                                                                color: fioriTheme.primary,
                                                            }}
                                                        />
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {fileObj.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: fioriTheme.textLight,
                                                                }}
                                                            >
                                                                {fileObj.size} KB
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Chip
                                                        label={getStatusLabel(fileObj.status)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor:
                                                                fileObj.status === 'success'
                                                                    ? fioriTheme.lightGreen
                                                                    : fileObj.status === 'error'
                                                                        ? fioriTheme.lightRed
                                                                        : fioriTheme.neutral,
                                                            color: getStatusColor(fileObj.status),
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1.5 }}>
                                                    <Tooltip title="Eliminar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveFile(fileObj.id)}
                                                            disabled={processing}
                                                            sx={{
                                                                color: fioriTheme.error,
                                                                '&:hover': {
                                                                    bgcolor: fioriTheme.lightRed,
                                                                },
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* Botones de Acción */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            onClick={onSubmit}
                            disabled={files.length === 0 || processing}
                            fullWidth
                            sx={{
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: 15,
                                bgcolor: fioriTheme.primary,
                                '&:hover': {
                                    bgcolor: '#0A4C88',
                                },
                                '&:disabled': {
                                    bgcolor: '#D0D0D0',
                                },
                            }}
                        >
                            {processing ? 'Procesando...' : 'Procesar Archivos'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearAll}
                            disabled={files.length === 0 || processing}
                            fullWidth
                            sx={{
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: 15,
                                color: fioriTheme.primary,
                                borderColor: fioriTheme.primary,
                                '&:hover': {
                                    bgcolor: fioriTheme.lightBlue,
                                    borderColor: fioriTheme.primary,
                                },
                            }}
                        >
                            Limpiar
                        </Button>
                    </Stack>
                </Grid>

                {/* Panel de Resultados - Columna Derecha */}
                <Grid item xs={12} lg={7}>
                    <Stack spacing={3}>
                        {/* Barra de Progreso */}
                        {processing && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    bgcolor: 'white',
                                    border: `1px solid #E0E0E0`,
                                    borderRadius: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: fioriTheme.lightBlue,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CloudUploadIcon sx={{ color: fioriTheme.primary }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                color: fioriTheme.text,
                                            }}
                                        >
                                            Procesando archivos
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: fioriTheme.textLight,
                                            }}
                                        >
                                            Por favor espera mientras se procesan tus archivos
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: fioriTheme.primary,
                                        }}
                                    >
                                        {progress}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#E0E0E0',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: fioriTheme.primary,
                                        },
                                    }}
                                />
                            </Paper>
                        )}

                        {/* Tarjeta de Éxito */}
                        {result && result.success && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    bgcolor: 'white',
                                    border: `2px solid ${fioriTheme.success}`,
                                    borderRadius: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            bgcolor: fioriTheme.lightGreen,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <CheckCircleIcon
                                            sx={{
                                                fontSize: 32,
                                                color: fioriTheme.success,
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: fioriTheme.text,
                                                mb: 0.5,
                                            }}
                                        >
                                            Reporte generado exitosamente
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: fioriTheme.textLight,
                                            }}
                                        >
                                            Tu reporte está listo para descargar
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Estadísticas */}
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: fioriTheme.primary,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {result.processedFiles}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: fioriTheme.textLight,
                                                    display: 'block',
                                                }}
                                            >
                                                Archivos procesados
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: fioriTheme.primary,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {result.totalRecords}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: fioriTheme.textLight,
                                                    display: 'block',
                                                }}
                                            >
                                                Registros totales
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: fioriTheme.primary,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {result.processingTime}s
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: fioriTheme.textLight,
                                                    display: 'block',
                                                }}
                                            >
                                                Tiempo de proceso
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: fioriTheme.primary,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {moment(result.timestamp).format('HH:mm')}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: fioriTheme.textLight,
                                                    display: 'block',
                                                }}
                                            >
                                                Hora de generación
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Detalles del archivo */}
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: fioriTheme.neutral,
                                        borderRadius: 1,
                                        mb: 3,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: fioriTheme.textLight,
                                            display: 'block',
                                            mb: 0.5,
                                        }}
                                    >
                                        Nombre del archivo
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            color: fioriTheme.text,
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {result.filename}
                                    </Typography>
                                </Box>

                                {/* Botón de descarga */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownload}
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: 15,
                                        bgcolor: fioriTheme.success,
                                        '&:hover': {
                                            bgcolor: '#0D5C0D',
                                        },
                                    }}
                                >
                                    Descargar Reporte
                                </Button>
                            </Paper>
                        )}

                        {/* Sección de Errores */}
                        {errors.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'white',
                                    border: `1px solid #E0E0E0`,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    onClick={() => setShowErrors(!showErrors)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        bgcolor: fioriTheme.lightYellow,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: '#FFF5D6',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: '#FFEDD4',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <ErrorIcon
                                                sx={{
                                                    fontSize: 20,
                                                    color: '#B77D00',
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: fioriTheme.text,
                                                }}
                                            >
                                                {errors.length} archivo(s) con errores
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: fioriTheme.textLight,
                                                }}
                                            >
                                                Haz clic para ver detalles
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small" sx={{ color: '#B77D00' }}>
                                        {showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>

                                <Collapse in={showErrors}>
                                    <Box sx={{ p: 2 }}>
                                        {errors.map((error, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    p: 1.5,
                                                    mb: index < errors.length - 1 ? 1 : 0,
                                                    bgcolor: fioriTheme.neutral,
                                                    borderRadius: 1,
                                                    border: `1px solid #E0E0E0`,
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: fioriTheme.text,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {error.file}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: fioriTheme.textLight,
                                                        display: 'block',
                                                    }}
                                                >
                                                    {error.error}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Collapse>
                            </Paper>
                        )}

                        {/* Error General */}
                        {result && !result.success && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    bgcolor: fioriTheme.lightRed,
                                    border: `2px solid ${fioriTheme.error}`,
                                    borderRadius: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: '#FFBCC1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <ErrorIcon sx={{ color: fioriTheme.error }} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                color: fioriTheme.text,
                                                mb: 0.5,
                                            }}
                                        >
                                            Error al procesar los archivos
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: fioriTheme.textLight,
                                            }}
                                        >
                                            {result.error}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {/* Modal de Descarga */}
            <Dialog
                open={downloadDialog.open}
                onClose={handleCloseDownloadDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        p: 3,
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: fioriTheme.lightGreen,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CheckCircleIcon
                                sx={{
                                    color: fioriTheme.success,
                                    fontSize: 28,
                                }}
                            />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: fioriTheme.text,
                            }}
                        >
                            Descarga completada
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseDownloadDialog}
                        size="small"
                        sx={{
                            color: fioriTheme.textLight,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Stack spacing={2.5}>
                        {/* Información del archivo */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                p: 2,
                                bgcolor: fioriTheme.neutral,
                                borderRadius: 2,
                                gap: 2,
                            }}
                        >
                            <DescriptionIcon
                                sx={{
                                    fontSize: 40,
                                    color: fioriTheme.primary,
                                    flexShrink: 0,
                                }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: fioriTheme.text,
                                        mb: 0.5,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {downloadDialog.filename}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: fioriTheme.textLight,
                                    }}
                                >
                                    Archivo Excel
                                </Typography>
                            </Box>
                        </Box>

                        {/* Ubicación del archivo */}
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: fioriTheme.textLight,
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 1,
                                }}
                            >
                                Ubicación del archivo
                            </Typography>
                            <Box
                                sx={{
                                    p: 1.5,
                                    bgcolor: fioriTheme.neutral,
                                    borderRadius: 1,
                                    border: `1px solid #E0E0E0`,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: 11,
                                        wordBreak: 'break-all',
                                        color: fioriTheme.textLight,
                                        display: 'block',
                                    }}
                                >
                                    {downloadDialog.savedPath}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FolderOpenIcon />}
                        onClick={handleShowInFolder}
                        fullWidth
                        sx={{
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 600,
                            color: fioriTheme.primary,
                            borderColor: fioriTheme.primary,
                            '&:hover': {
                                bgcolor: fioriTheme.lightBlue,
                            },
                        }}
                    >
                        Mostrar carpeta
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<OpenInNewIcon />}
                        onClick={handleOpenFile}
                        fullWidth
                        sx={{
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: fioriTheme.success,
                            '&:hover': {
                                bgcolor: '#0D5C0D',
                            },
                        }}
                    >
                        Abrir archivo
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportGenerator;