import * as XLSX from 'xlsx';
import { listaProductos } from './productos';

// Función para leer celdas específicas del Excel
export const getCellValue = (worksheet, row, col) => {
    const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
    const cell = worksheet[cellAddress];
    return cell ? cell.v : null;
};

// Función para procesar el archivo Excel y extraer datos
export const processExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Asumiendo que tiene hojas "Datos" y "Resumen" como el script original
                const datosSheet = workbook.Sheets['Datos'] || workbook.Sheets[workbook.SheetNames[0]];
                const resumenSheet = workbook.Sheets['Resumen'] || workbook.Sheets[workbook.SheetNames[1]];

                if (!datosSheet) {
                    reject(new Error('No se encontró la hoja de datos'));
                    return;
                }

                // Extraer datos según las celdas del script original
                const extractedData = {
                    fileName: file.name,
                    // Datos de la hoja "Datos"
                    numDeal: getCellValue(datosSheet, 2, 5), // B2 en Excel = fila 2, col 5
                    name: getCellValue(datosSheet, 3, 5), // B3
                    preparadoPor: getCellValue(datosSheet, 10, 5), // B10
                    responsable: getCellValue(datosSheet, 11, 5), // B11
                    vistoBueno: getCellValue(datosSheet, 12, 5), // B12

                    // Datos de resumen si existe
                    codigos: resumenSheet ? getCellValue(resumenSheet, 24, 12) : null,
                    uBrutaExcel: resumenSheet ? getCellValue(resumenSheet, 30, 5) : null,

                    // Productos - necesitamos extraer las filas de productos
                    productos: extractProductos(datosSheet),

                    // Montos especiales
                    costoAuma: 0,
                    costoMsa: 0,
                    costoValmet: 0,

                    workbook: workbook,
                    datosSheet: datosSheet,
                    resumenSheet: resumenSheet
                };

                resolve(extractedData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

// Extraer productos del Excel (similar a la función producto() del script)
const extractProductos = (sheet) => {
    const productos = [];
    let row = 15; // Empezar desde fila 15 como en el script original

    while (true) {
        const nombreProducto = getCellValue(sheet, row, 2); // Columna B

        if (!nombreProducto || nombreProducto === '') break;

        const cantidad = getCellValue(sheet, row, 3) || 0; // Columna C
        const precio = getCellValue(sheet, row, 4) || 0; // Columna D
        const descuento = getCellValue(sheet, row, 5) || 0; // Columna E

        // Buscar el producto en el diccionario
        const productoInfo = listaProductos[nombreProducto];

        if (productoInfo) {
            productos.push({
                nombre: nombreProducto,
                cantidad: cantidad,
                precio: precio,
                descuento: descuento,
                productId: productoInfo[0],
                unidadNegocio: productoInfo[1],
                campo1: productoInfo[2],
                campo2: productoInfo[3],
                precioNeto: precio * (1 - descuento / 100),
                total: precio * cantidad * (1 - descuento / 100)
            });
        }

        row++;
    }

    return productos;
};

// Calcular totales por área
export const calcularTotalesPorArea = (productos) => {
    const totales = {
        UNAU: 0,
        UNAI: 0,
        UNVA: 0,
        Proyectos: 0,
        HSEQ: 0,
        Otros: 0
    };

    productos.forEach(producto => {
        const area = producto.unidadNegocio;
        if (totales.hasOwnProperty(area)) {
            totales[area] += producto.total;
        } else {
            totales.Otros += producto.total;
        }
    });

    return totales;
};

// Formatear fecha para Bitrix24
export const formatDateForBitrix = (dateString) => {
    if (!dateString) return '';
    // Formato esperado: YYYY-MM-DDTHH:MM:SS+03:00
    return `${dateString}T03:00:00+03:00`;
};

// Validar fecha en formato YYYY-MM-DD
export const isValidDate = (dateString) => {
    if (!dateString || dateString.length !== 10) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};