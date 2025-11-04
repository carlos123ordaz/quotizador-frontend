import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Chip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    InputAdornment,
    Stack,
    Grid,
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Avatar,
    Divider,
    LinearProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    CloudDownload as CloudDownloadIcon,
    Close as CloseIcon,
    InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import moment from 'moment';

const ReportHistory = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, success, error
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        errors: 0,
        totalFiles: 0,
    });

    // Cargar reportes al montar el componente
    useEffect(() => {
        loadReports();
    }, []);

    // Filtrar reportes cuando cambia el término de búsqueda o el filtro de estado
    useEffect(() => {
        let filtered = reports;

        // Filtrar por estado
        if (filterStatus !== 'all') {
            filtered = filtered.filter((report) => report.status === filterStatus);
        }

        // Filtrar por término de búsqueda
        if (searchTerm !== '') {
            filtered = filtered.filter(
                (report) =>
                    report.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.id.toString().includes(searchTerm)
            );
        }

        setFilteredReports(filtered);
        setPage(0);
    }, [searchTerm, filterStatus, reports]);

    // Actualizar estadísticas
    useEffect(() => {
        setStats({
            total: reports.length,
            success: reports.filter((r) => r.status === 'success').length,
            errors: reports.filter((r) => r.status === 'error').length,
            totalFiles: reports.reduce((acc, r) => acc + r.filesProcessed, 0),
        });
    }, [reports]);

    // Cargar reportes (simulación - reemplazar con API)
    const loadReports = async () => {
        try {
            // TODO: Reemplazar con llamada a tu API
            // const response = await axios.get('http://localhost:8000/api/reports/history');
            // setReports(response.data);

            // Datos simulados
            const mockReports = [
                {
                    id: 1,
                    filename: 'resultado_final_2024_10_20.xlsx',
                    filesProcessed: 25,
                    filesWithErrors: 2,
                    totalRecords: 450,
                    status: 'success',
                    fileSize: 2.5, // MB
                    createdAt: '2024-10-20T14:30:00',
                    downloadUrl: '/api/reports/download/1',
                    processingTime: 12.5, // segundos
                },
                {
                    id: 2,
                    filename: 'resultado_final_2024_10_19.xlsx',
                    filesProcessed: 18,
                    filesWithErrors: 0,
                    totalRecords: 320,
                    status: 'success',
                    fileSize: 1.8,
                    createdAt: '2024-10-19T11:15:00',
                    downloadUrl: '/api/reports/download/2',
                    processingTime: 8.2,
                },
                {
                    id: 3,
                    filename: 'resultado_final_2024_10_18.xlsx',
                    filesProcessed: 30,
                    filesWithErrors: 5,
                    totalRecords: 520,
                    status: 'success',
                    fileSize: 3.2,
                    createdAt: '2024-10-18T16:45:00',
                    downloadUrl: '/api/reports/download/3',
                    processingTime: 15.8,
                },
                {
                    id: 4,
                    filename: 'resultado_final_2024_10_17.xlsx',
                    filesProcessed: 0,
                    filesWithErrors: 10,
                    totalRecords: 0,
                    status: 'error',
                    fileSize: 0,
                    createdAt: '2024-10-17T09:20:00',
                    downloadUrl: null,
                    processingTime: 0,
                    errorMessage: 'Error al procesar los archivos: formato inválido',
                },
                {
                    id: 5,
                    filename: 'resultado_final_2024_10_16.xlsx',
                    filesProcessed: 22,
                    filesWithErrors: 1,
                    totalRecords: 380,
                    status: 'success',
                    fileSize: 2.1,
                    createdAt: '2024-10-16T13:50:00',
                    downloadUrl: '/api/reports/download/5',
                    processingTime: 10.3,
                },
                {
                    id: 6,
                    filename: 'resultado_final_2024_10_15.xlsx',
                    filesProcessed: 15,
                    filesWithErrors: 0,
                    totalRecords: 280,
                    status: 'success',
                    fileSize: 1.5,
                    createdAt: '2024-10-15T10:30:00',
                    downloadUrl: '/api/reports/download/6',
                    processingTime: 7.5,
                },
                {
                    id: 7,
                    filename: 'resultado_final_2024_10_14.xlsx',
                    filesProcessed: 28,
                    filesWithErrors: 3,
                    totalRecords: 485,
                    status: 'success',
                    fileSize: 2.9,
                    createdAt: '2024-10-14T15:20:00',
                    downloadUrl: '/api/reports/download/7',
                    processingTime: 13.7,
                },
                {
                    id: 8,
                    filename: 'resultado_final_2024_10_13.xlsx',
                    filesProcessed: 0,
                    filesWithErrors: 8,
                    totalRecords: 0,
                    status: 'error',
                    fileSize: 0,
                    createdAt: '2024-10-13T12:10:00',
                    downloadUrl: null,
                    processingTime: 0,
                    errorMessage: 'Error de conexión con el servidor',
                },
            ];

            setReports(mockReports);
            setFilteredReports(mockReports);
        } catch (error) {
            console.error('Error al cargar reportes:', error);
        }
    };

    // Descargar reporte
    const handleDownload = async (report) => {
        try {
            if (report.downloadUrl) {
                // TODO: Implementar descarga real
                // const response = await axios.get(
                //   `http://localhost:8000${report.downloadUrl}`,
                //   { responseType: 'blob' }
                // );
                // const url = window.URL.createObjectURL(new Blob([response.data]));
                // const link = document.createElement('a');
                // link.href = url;
                // link.setAttribute('download', report.filename);
                // document.body.appendChild(link);
                // link.click();
                // link.remove();

                window.open(`http://localhost:8000${report.downloadUrl}`, '_blank');
            }
        } catch (error) {
            console.error('Error al descargar reporte:', error);
        }
        handleCloseMenu();
    };

    // Ver detalles
    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setDetailsDialogOpen(true);
        handleCloseMenu();
    };

    // Abrir diálogo de confirmación de eliminación
    const handleOpenDeleteDialog = (report) => {
        setReportToDelete(report);
        setDeleteDialogOpen(true);
        handleCloseMenu();
    };

    // Eliminar reporte
    const handleDelete = async () => {
        try {
            if (reportToDelete) {
                // TODO: await axios.delete(`http://localhost:8000/api/reports/${reportToDelete.id}`);

                setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
                setDeleteDialogOpen(false);
                setReportToDelete(null);
            }
        } catch (error) {
            console.error('Error al eliminar reporte:', error);
        }
    };

    // Menú de acciones
    const handleOpenMenu = (event, report) => {
        setAnchorEl(event.currentTarget);
        setSelectedReport(report);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    // Filtro de estado
    const handleOpenFilterMenu = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleCloseFilterMenu = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        handleCloseFilterMenu();
    };

    // Paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Formatear tamaño de archivo
    const formatFileSize = (mb) => {
        if (mb >= 1) {
            return `${mb.toFixed(2)} MB`;
        }
        return `${(mb * 1024).toFixed(0)} KB`;
    };

    // Formatear fecha relativa
    const formatRelativeDate = (date) => {
        return moment(date).fromNow();
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    Historial de Reportes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Consulta y descarga reportes generados anteriormente
                </Typography>
            </Box>

            {/* Estadísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="primary.main">
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Reportes
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                    <AssessmentIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="success.main">
                                        {stats.success}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Exitosos
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                                    <CheckCircleIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="error.main">
                                        {stats.errors}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Con Errores
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                                    <ErrorIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="info.main">
                                        {stats.totalFiles}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Archivos Procesados
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                                    <TrendingUpIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Barra de acciones */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'center' }}
                    justifyContent="space-between"
                >
                    <TextField
                        placeholder="Buscar por nombre de archivo o ID..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Filtrar por estado">
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={handleOpenFilterMenu}
                                endIcon={
                                    filterStatus !== 'all' && (
                                        <Chip
                                            label={filterStatus === 'success' ? stats.success : stats.errors}
                                            size="small"
                                            color={filterStatus === 'success' ? 'success' : 'error'}
                                        />
                                    )
                                }
                            >
                                {filterStatus === 'all' && 'Todos'}
                                {filterStatus === 'success' && 'Exitosos'}
                                {filterStatus === 'error' && 'Con Errores'}
                            </Button>
                        </Tooltip>
                        <Tooltip title="Actualizar">
                            <IconButton onClick={loadReports} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Paper>

            {/* Menú de filtros */}
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleCloseFilterMenu}
            >
                <MenuItem
                    onClick={() => handleFilterChange('all')}
                    selected={filterStatus === 'all'}
                >
                    Todos los reportes ({reports.length})
                </MenuItem>
                <MenuItem
                    onClick={() => handleFilterChange('success')}
                    selected={filterStatus === 'success'}
                >
                    Exitosos ({stats.success})
                </MenuItem>
                <MenuItem
                    onClick={() => handleFilterChange('error')}
                    selected={filterStatus === 'error'}
                >
                    Con Errores ({stats.errors})
                </MenuItem>
            </Menu>

            {/* Tabla de reportes */}
            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Archivo</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Archivos Procesados</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Registros</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Tamaño</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            {searchTerm || filterStatus !== 'all'
                                                ? 'No se encontraron reportes'
                                                : 'No hay reportes generados'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {searchTerm || filterStatus !== 'all'
                                                ? 'Intenta con otros filtros de búsqueda'
                                                : 'Los reportes generados aparecerán aquí'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReports
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((report) => (
                                        <TableRow
                                            key={report.id}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Chip
                                                    label={`#${report.id}`}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <FileIcon sx={{ color: 'success.main' }} />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {report.filename}
                                                        </Typography>
                                                        {report.processingTime > 0 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Tiempo: {report.processingTime}s
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                {report.status === 'success' ? (
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="Exitoso"
                                                        size="small"
                                                        color="success"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<ErrorIcon />}
                                                        label="Error"
                                                        size="small"
                                                        color="error"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack spacing={0.5} alignItems="center">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {report.filesProcessed}
                                                    </Typography>
                                                    {report.filesWithErrors > 0 && (
                                                        <Chip
                                                            label={`${report.filesWithErrors} con errores`}
                                                            size="small"
                                                            color="warning"
                                                            sx={{ fontSize: 10, height: 18 }}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={600}>
                                                    {report.totalRecords.toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {report.fileSize > 0 ? formatFileSize(report.fileSize) : '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {moment(report.createdAt).format('DD/MM/YYYY')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatRelativeDate(report.createdAt)}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenMenu(e, report)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredReports.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </Paper>

            {/* Menú de acciones */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={() => handleViewDetails(selectedReport)}>
                    <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
                    Ver Detalles
                </MenuItem>
                {selectedReport?.status === 'success' && (
                    <MenuItem onClick={() => handleDownload(selectedReport)}>
                        <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
                        Descargar
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => handleOpenDeleteDialog(selectedReport)}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Eliminar
                </MenuItem>
            </Menu>

            {/* Diálogo de detalles */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight={600}>
                            Detalles del Reporte
                        </Typography>
                        <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedReport && (
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    ID del Reporte
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    #{selectedReport.id}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Nombre del Archivo
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {selectedReport.filename}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Estado
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    {selectedReport.status === 'success' ? (
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Exitoso"
                                            color="success"
                                            size="small"
                                        />
                                    ) : (
                                        <Chip
                                            icon={<ErrorIcon />}
                                            label="Error"
                                            color="error"
                                            size="small"
                                        />
                                    )}
                                </Box>
                                {selectedReport.errorMessage && (
                                    <Alert severity="error" sx={{ mt: 1 }}>
                                        {selectedReport.errorMessage}
                                    </Alert>
                                )}
                            </Box>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Archivos Procesados
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary.main">
                                        {selectedReport.filesProcessed}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Archivos con Errores
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        color={selectedReport.filesWithErrors > 0 ? 'error.main' : 'text.secondary'}
                                    >
                                        {selectedReport.filesWithErrors}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Total de Registros
                                </Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {selectedReport.totalRecords.toLocaleString()}
                                </Typography>
                            </Box>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Tamaño del Archivo
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedReport.fileSize > 0 ? formatFileSize(selectedReport.fileSize) : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Tiempo de Procesamiento
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedReport.processingTime > 0 ? `${selectedReport.processingTime}s` : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Fecha de Generación
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {moment(selectedReport.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ({formatRelativeDate(selectedReport.createdAt)})
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined">
                        Cerrar
                    </Button>
                    {selectedReport?.status === 'success' && (
                        <Button
                            variant="contained"
                            startIcon={<CloudDownloadIcon />}
                            onClick={() => {
                                handleDownload(selectedReport);
                                setDetailsDialogOpen(false);
                            }}
                        >
                            Descargar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Diálogo de confirmación de eliminación */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight={600}>
                        Confirmar Eliminación
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Esta acción no se puede deshacer
                    </Alert>
                    <Typography variant="body1">
                        ¿Estás seguro de que deseas eliminar el reporte{' '}
                        <strong>#{reportToDelete?.id}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportHistory;