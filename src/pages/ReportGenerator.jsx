import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Alert,
    CircularProgress,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ReportGenerator = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // NUEVO: Estado para progreso
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const fileInputRef = useRef(null);

    // NUEVO: Referencia para EventSource
    const eventSourceRef = useRef(null);

    // NUEVO: Limpiar EventSource al desmontar
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    // NUEVO: Función para conectar al stream de progreso
    const connectToProgressStream = (taskId) => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(`${API_BASE_URL}/api/reports/progress/${taskId}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const progressData = JSON.parse(event.data);
                setProgress({ current: progressData.current, total: progressData.total });

                if (progressData.status === 'completed') {
                    setLoading(false);
                    eventSource.close();
                    setResult({ success: true });
                } else if (progressData.status === 'error') {
                    setLoading(false);
                    setError('Error al procesar los archivos');
                    eventSource.close();
                }
            } catch (err) {
                console.error('Error al parsear progreso:', err);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
            setLoading(false);
            setError('Error de conexión con el servidor');
        };
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError("Por favor selecciona al menos un archivo");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setProgress({ current: 0, total: files.length }); // NUEVO

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("files", file);
            });

            const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al subir archivos");
            }

            const data = await response.json();

            // NUEVO: Conectar al stream de progreso
            if (data.task_id) {
                connectToProgressStream(data.task_id);
            }

        } catch (err) {
            setLoading(false);
            setError(err.message || "Error al procesar archivos");
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Generar Reporte Excel
                    </Typography>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".xlsx,.xls,.xlsm"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        Seleccionar Archivos Excel
                    </Button>

                    {files.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Archivos seleccionados ({files.length})
                            </Typography>
                            <List>
                                {files.map((file, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemoveFile(index)}
                                                disabled={loading}
                                            >
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={file.name}
                                            secondary={formatFileSize(file.size)}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {result && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Reporte generado exitosamente
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={files.length === 0 || loading}
                        sx={{ mt: 3 }}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? `Generando... ${progress.current}/${progress.total}` : "Generar Reporte"}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ReportGenerator;