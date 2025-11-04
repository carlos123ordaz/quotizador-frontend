import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    InputAdornment,
    Menu,
    MenuItem,
    Stack,
    Grid,
    Card,
    CardContent,
    Tooltip,
    Avatar,
    Badge,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    People as PeopleIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Work as WorkIcon,
    Badge as BadgeIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import moment from 'moment';

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            codigo: '',
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            cargo: '',
            departamento: '',
            salario: '',
            fechaIngreso: moment().format('YYYY-MM-DD'),
            activo: true,
        },
    });

    // Cargar empleados al montar el componente
    useEffect(() => {
        loadEmployees();
    }, []);

    // Filtrar empleados cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(
                (employee) =>
                    employee.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.departamento.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
        setPage(0);
    }, [searchTerm, employees]);

    // Actualizar estadísticas
    useEffect(() => {
        setStats({
            total: employees.length,
            active: employees.filter(e => e.activo).length,
            inactive: employees.filter(e => !e.activo).length,
        });
    }, [employees]);

    // Cargar empleados (simulación - reemplazar con API)
    const loadEmployees = async () => {
        try {
            // TODO: Reemplazar con llamada a tu API
            // const response = await axios.get('http://localhost:8000/api/employees');
            // setEmployees(response.data);

            // Datos simulados
            const mockEmployees = [
                {
                    id: 1,
                    codigo: 'EMP-001',
                    nombre: 'Juan',
                    apellido: 'Pérez García',
                    email: 'juan.perez@empresa.com',
                    telefono: '+51 987654321',
                    cargo: 'Gerente de Ventas',
                    departamento: 'Ventas',
                    salario: 4500.00,
                    fechaIngreso: '2020-03-15',
                    activo: true,
                    createdAt: '2020-03-15T08:00:00',
                    updatedAt: '2024-10-20T10:30:00',
                },
                {
                    id: 2,
                    codigo: 'EMP-002',
                    nombre: 'María',
                    apellido: 'López Sánchez',
                    email: 'maria.lopez@empresa.com',
                    telefono: '+51 987654322',
                    cargo: 'Desarrolladora Senior',
                    departamento: 'Tecnología',
                    salario: 5000.00,
                    fechaIngreso: '2019-06-10',
                    activo: true,
                    createdAt: '2019-06-10T08:00:00',
                    updatedAt: '2024-10-18T14:20:00',
                },
                {
                    id: 3,
                    codigo: 'EMP-003',
                    nombre: 'Carlos',
                    apellido: 'Rodríguez Díaz',
                    email: 'carlos.rodriguez@empresa.com',
                    telefono: '+51 987654323',
                    cargo: 'Analista de Datos',
                    departamento: 'Tecnología',
                    salario: 3800.00,
                    fechaIngreso: '2021-01-20',
                    activo: true,
                    createdAt: '2021-01-20T08:00:00',
                    updatedAt: '2024-10-22T09:15:00',
                },
                {
                    id: 4,
                    codigo: 'EMP-004',
                    nombre: 'Ana',
                    apellido: 'Martínez Torres',
                    email: 'ana.martinez@empresa.com',
                    telefono: '+51 987654324',
                    cargo: 'Coordinadora de Marketing',
                    departamento: 'Marketing',
                    salario: 4000.00,
                    fechaIngreso: '2020-08-05',
                    activo: true,
                    createdAt: '2020-08-05T08:00:00',
                    updatedAt: '2024-10-19T16:45:00',
                },
                {
                    id: 5,
                    codigo: 'EMP-005',
                    nombre: 'Luis',
                    apellido: 'González Ruiz',
                    email: 'luis.gonzalez@empresa.com',
                    telefono: '+51 987654325',
                    cargo: 'Contador',
                    departamento: 'Finanzas',
                    salario: 3500.00,
                    fechaIngreso: '2018-11-12',
                    activo: false,
                    createdAt: '2018-11-12T08:00:00',
                    updatedAt: '2024-09-30T11:20:00',
                },
                {
                    id: 6,
                    codigo: 'EMP-006',
                    nombre: 'Patricia',
                    apellido: 'Ramírez Flores',
                    email: 'patricia.ramirez@empresa.com',
                    telefono: '+51 987654326',
                    cargo: 'Asistente Administrativo',
                    departamento: 'Administración',
                    salario: 2800.00,
                    fechaIngreso: '2022-02-14',
                    activo: true,
                    createdAt: '2022-02-14T08:00:00',
                    updatedAt: '2024-10-21T13:50:00',
                },
            ];

            setEmployees(mockEmployees);
            setFilteredEmployees(mockEmployees);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            showSnackbar('Error al cargar los empleados', 'error');
        }
    };

    // Abrir diálogo para crear/editar
    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            reset({
                codigo: employee.codigo,
                nombre: employee.nombre,
                apellido: employee.apellido,
                email: employee.email,
                telefono: employee.telefono,
                cargo: employee.cargo,
                departamento: employee.departamento,
                salario: employee.salario,
                fechaIngreso: employee.fechaIngreso,
                activo: employee.activo,
            });
        } else {
            setEditingEmployee(null);
            reset({
                codigo: '',
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                cargo: '',
                departamento: '',
                salario: '',
                fechaIngreso: moment().format('YYYY-MM-DD'),
                activo: true,
            });
        }
        setOpenDialog(true);
    };

    // Cerrar diálogo
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmployee(null);
        reset();
    };

    // Guardar empleado (crear o actualizar)
    const onSubmit = async (data) => {
        try {
            if (editingEmployee) {
                // Actualizar empleado existente
                // TODO: await axios.put(`http://localhost:8000/api/employees/${editingEmployee.id}`, data);

                setEmployees((prev) =>
                    prev.map((e) =>
                        e.id === editingEmployee.id
                            ? { ...e, ...data, updatedAt: moment().format() }
                            : e
                    )
                );
                showSnackbar('Empleado actualizado exitosamente', 'success');
            } else {
                // Crear nuevo empleado
                // TODO: const response = await axios.post('http://localhost:8000/api/employees', data);

                const newEmployee = {
                    id: employees.length + 1,
                    ...data,
                    createdAt: moment().format(),
                    updatedAt: moment().format(),
                };
                setEmployees((prev) => [...prev, newEmployee]);
                showSnackbar('Empleado creado exitosamente', 'success');
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error al guardar empleado:', error);
            showSnackbar('Error al guardar el empleado', 'error');
        }
    };

    // Abrir diálogo de confirmación de eliminación
    const handleOpenDeleteDialog = (employee) => {
        setEmployeeToDelete(employee);
        setDeleteDialogOpen(true);
        handleCloseMenu();
    };

    // Eliminar empleado
    const handleDelete = async () => {
        try {
            if (employeeToDelete) {
                // TODO: await axios.delete(`http://localhost:8000/api/employees/${employeeToDelete.id}`);

                setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
                showSnackbar('Empleado eliminado exitosamente', 'success');
                setDeleteDialogOpen(false);
                setEmployeeToDelete(null);
            }
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            showSnackbar('Error al eliminar el empleado', 'error');
        }
    };

    // Menú de acciones
    const handleOpenMenu = (event, employee) => {
        setAnchorEl(event.currentTarget);
        setSelectedEmployee(employee);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedEmployee(null);
    };

    // Paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Exportar a Excel
    const handleExport = () => {
        // TODO: Implementar exportación a Excel
        showSnackbar('Exportando a Excel...', 'info');
    };

    // Importar desde Excel
    const handleImport = () => {
        // TODO: Implementar importación desde Excel
        showSnackbar('Función de importación próximamente', 'info');
    };

    // Obtener iniciales del nombre
    const getInitials = (nombre, apellido) => {
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    };

    // Calcular antigüedad
    const calcularAntiguedad = (fechaIngreso) => {
        const years = moment().diff(moment(fechaIngreso), 'years');
        const months = moment().diff(moment(fechaIngreso), 'months') % 12;

        if (years > 0) {
            return `${years} año${years > 1 ? 's' : ''}`;
        } else if (months > 0) {
            return `${months} mes${months > 1 ? 'es' : ''}`;
        } else {
            return 'Nuevo';
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    Gestión de Empleados
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra el personal de la empresa
                </Typography>
            </Box>

            {/* Estadísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="primary.main">
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total de Empleados
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                    <PeopleIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="success.main">
                                        {stats.active}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Empleados Activos
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                                    <PeopleIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={700} color="error.main">
                                        {stats.inactive}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Empleados Inactivos
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                                    <PeopleIcon />
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
                        placeholder="Buscar por código, nombre, email, cargo o departamento..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flexGrow: 1, maxWidth: { sm: 450 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Exportar a Excel">
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleExport}
                            >
                                Exportar
                            </Button>
                        </Tooltip>
                        <Tooltip title="Importar desde Excel">
                            <Button
                                variant="outlined"
                                startIcon={<UploadIcon />}
                                onClick={handleImport}
                            >
                                Importar
                            </Button>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ fontWeight: 600 }}
                        >
                            Nuevo Empleado
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* Tabla de empleados */}
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
                                <TableCell sx={{ fontWeight: 700 }}>Empleado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Cargo</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Departamento</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Salario</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Antigüedad</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                        <PeopleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            {searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando un nuevo empleado'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((employee) => (
                                        <TableRow
                                            key={employee.id}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Badge
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        badgeContent={
                                                            employee.activo ? (
                                                                <Box
                                                                    sx={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        bgcolor: 'success.main',
                                                                        border: '2px solid white',
                                                                    }}
                                                                />
                                                            ) : null
                                                        }
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: 'primary.main',
                                                                width: 40,
                                                                height: 40,
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {getInitials(employee.nombre, employee.apellido)}
                                                        </Avatar>
                                                    </Badge>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {employee.nombre} {employee.apellido}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {employee.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                                                    label={employee.codigo}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption">{employee.email}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption">{employee.telefono}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <WorkIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                    <Typography variant="body2">{employee.cargo}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={employee.departamento}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600}>
                                                    S/ {employee.salario.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={calcularAntiguedad(employee.fechaIngreso)}
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={employee.activo ? 'Activo' : 'Inactivo'}
                                                    size="small"
                                                    color={employee.activo ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenMenu(e, employee)}
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
                    count={filteredEmployees.length}
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
                <MenuItem
                    onClick={() => {
                        handleOpenDialog(selectedEmployee);
                        handleCloseMenu();
                    }}
                >
                    <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                    Editar
                </MenuItem>
                <MenuItem
                    onClick={() => handleOpenDeleteDialog(selectedEmployee)}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Eliminar
                </MenuItem>
            </Menu>

            {/* Diálogo de crear/editar empleado */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight={600}>
                            {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                        </Typography>
                        <IconButton onClick={handleCloseDialog} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="codigo"
                                    control={control}
                                    rules={{ required: 'El código es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Código"
                                            fullWidth
                                            error={!!errors.codigo}
                                            helperText={errors.codigo?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="nombre"
                                    control={control}
                                    rules={{ required: 'El nombre es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Nombre"
                                            fullWidth
                                            error={!!errors.nombre}
                                            helperText={errors.nombre?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="apellido"
                                    control={control}
                                    rules={{ required: 'El apellido es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Apellido"
                                            fullWidth
                                            error={!!errors.apellido}
                                            helperText={errors.apellido?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: 'El email es requerido',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email inválido',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Email"
                                            fullWidth
                                            type="email"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="telefono"
                                    control={control}
                                    rules={{ required: 'El teléfono es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Teléfono"
                                            fullWidth
                                            error={!!errors.telefono}
                                            helperText={errors.telefono?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PhoneIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="cargo"
                                    control={control}
                                    rules={{ required: 'El cargo es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Cargo"
                                            fullWidth
                                            error={!!errors.cargo}
                                            helperText={errors.cargo?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="departamento"
                                    control={control}
                                    rules={{ required: 'El departamento es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Departamento"
                                            fullWidth
                                            select
                                            error={!!errors.departamento}
                                            helperText={errors.departamento?.message}
                                        >
                                            <MenuItem value="Ventas">Ventas</MenuItem>
                                            <MenuItem value="Marketing">Marketing</MenuItem>
                                            <MenuItem value="Tecnología">Tecnología</MenuItem>
                                            <MenuItem value="Finanzas">Finanzas</MenuItem>
                                            <MenuItem value="Recursos Humanos">Recursos Humanos</MenuItem>
                                            <MenuItem value="Operaciones">Operaciones</MenuItem>
                                            <MenuItem value="Administración">Administración</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="salario"
                                    control={control}
                                    rules={{
                                        required: 'El salario es requerido',
                                        min: { value: 0, message: 'El salario debe ser positivo' },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Salario"
                                            fullWidth
                                            type="number"
                                            inputProps={{ step: '0.01' }}
                                            error={!!errors.salario}
                                            helperText={errors.salario?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">S/</InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="fechaIngreso"
                                    control={control}
                                    rules={{ required: 'La fecha de ingreso es requerida' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Fecha de Ingreso"
                                            fullWidth
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.fechaIngreso}
                                            helperText={errors.fechaIngreso?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="activo"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Estado"
                                            fullWidth
                                            select
                                        >
                                            <MenuItem value={true}>Activo</MenuItem>
                                            <MenuItem value={false}>Inactivo</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={handleCloseDialog} variant="outlined">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained">
                            {editingEmployee ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
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
                        ¿Estás seguro de que deseas eliminar al empleado{' '}
                        <strong>
                            {employeeToDelete?.nombre} {employeeToDelete?.apellido}
                        </strong>
                        ?
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

            {/* Snackbar de notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EmployeesPage;