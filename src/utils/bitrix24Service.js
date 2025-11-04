import axios from 'axios';

// Servicio para interactuar con la API de Bitrix24
class Bitrix24Service {
    constructor(webhook) {
        this.webhook = webhook;
        this.baseURL = webhook;
    }

    // Método genérico para hacer llamadas a Bitrix24
    async call(method, params = {}) {
        try {
            const url = `${this.baseURL}${method}`;
            const response = await axios.post(url, params);

            if (response.data && response.data.result) {
                return response.data.result;
            }

            return response.data;
        } catch (error) {
            console.error('Error en llamada a Bitrix24:', error);
            throw new Error(`Error en ${method}: ${error.message}`);
        }
    }

    // Obtener información de un deal
    async getDeal(dealId) {
        return await this.call('crm.deal.get', { ID: dealId });
    }

    // Actualizar un deal
    async updateDeal(dealId, fields) {
        return await this.call('crm.deal.update', {
            ID: dealId,
            fields: fields
        });
    }

    // Crear una quote
    async createQuote(fields) {
        return await this.call('crm.quote.add', { fields: fields });
    }

    // Actualizar una quote
    async updateQuote(quoteId, fields) {
        return await this.call('crm.quote.update', {
            ID: quoteId,
            fields: fields
        });
    }

    // Establecer productos de una quote
    async setQuoteProducts(quoteId, products) {
        return await this.call('crm.quote.productrows.set', {
            ID: quoteId,
            rows: products
        });
    }

    // Proceso completo de creación/actualización según el script original
    async procesarCotizacion(data) {
        const {
            crearQuote,
            numDeal,
            numQuote,
            productos,
            fechas,
            costos,
            campos
        } = data;

        try {
            // 1. Actualizar Deal
            const dealFields = {};

            if (costos.auma && costos.auma !== 0) {
                dealFields['UF_CRM_1470168697'] = costos.auma;
            }
            if (costos.msa && costos.msa !== 0) {
                dealFields['UF_CRM_1536612671'] = costos.msa;
            }
            if (costos.valmet && costos.valmet !== 0) {
                dealFields['UF_CRM_1672640891'] = costos.valmet;
            }
            if (fechas.cierre && fechas.cierre !== '') {
                dealFields['CLOSEDATE'] = fechas.cierre;
            }

            if (Object.keys(dealFields).length > 0) {
                await this.updateDeal(numDeal, dealFields);
            }

            let resultQuoteId = numQuote;

            // 2. Crear o actualizar Quote
            if (crearQuote) {
                // Obtener datos completos del deal
                const dealData = await this.getDeal(numDeal);

                // Preparar campos para nueva quote
                const quoteFields = {
                    TITLE: dealData.TITLE,
                    CURRENCY_ID: dealData.CURRENCY_ID,
                    DEAL_ID: numDeal,
                    COMPANY_ID: dealData.COMPANY_ID,
                    CONTACT_ID: dealData.CONTACT_ID,
                    BEGINDATE: dealData.BEGINDATE,
                    CLOSEDATE: dealData.CLOSEDATE,
                    ASSIGNED_BY_ID: dealData.ASSIGNED_BY_ID,
                    UTM_SOURCE: dealData.UTM_SOURCE,
                    UTM_MEDIUM: dealData.UTM_MEDIUM,
                    UTM_CAMPAIGN: dealData.UTM_CAMPAIGN,
                    UTM_CONTENT: dealData.UTM_CONTENT,
                    UTM_TERM: dealData.UTM_TERM,
                    LEAD_ID: dealData.LEAD_ID,
                    // Campos personalizados
                    'UF_CRM_1672643073': dealData['UF_CRM_1672642957'], // Responsable Principal
                    'UF_CRM_1672643100': dealData['UF_CRM_1672643001'], // Responsable Secundario
                    'UF_CRM_1672643342': dealData['UF_CRM_1672643298'], // Comisión Compartida
                    'UF_CRM_62AB9AAFA8FE1': dealData['UF_CRM_1655413285'], // Compañía Cliente Final
                    'UF_CRM_1579190330': dealData['UF_CRM_1579190263'], // Campaña de Marketing
                    'UF_CRM_1579310925': fechas.correo, // Fecha correo
                    'UF_CRM_1579191342': fechas.inicio, // Fecha inicio
                    'UF_CRM_1444014615': fechas.envio, // Fecha envío
                    'UF_CRM_1443821741': campos.name, // Nombre oferta
                    'UF_CRM_1444241279': campos.codigos, // Códigos
                    'UF_CRM_1672639032': campos.uBrutaExcel, // Utilidad Bruta Excel
                    STATUS_ID: 'SENT'
                };

                // Agregar más campos según sea necesario
                if (costos.auma && costos.auma !== 0) {
                    quoteFields['UF_CRM_57A0FECB87D98'] = costos.auma;
                }
                if (costos.msa && costos.msa !== 0) {
                    quoteFields['UF_CRM_1536612809'] = costos.msa;
                }
                if (costos.valmet && costos.valmet !== 0) {
                    quoteFields['UF_CRM_1672641073'] = costos.valmet;
                }

                resultQuoteId = await this.createQuote(quoteFields);
            } else {
                // Actualizar quote existente
                const quoteFields = {
                    'UF_CRM_1444241279': campos.codigos,
                    'UF_CRM_1672639032': campos.uBrutaExcel
                };

                if (costos.auma && costos.auma !== 0) {
                    quoteFields['UF_CRM_57A0FECB87D98'] = costos.auma;
                }
                if (costos.msa && costos.msa !== 0) {
                    quoteFields['UF_CRM_1536612809'] = costos.msa;
                }
                if (costos.valmet && costos.valmet !== 0) {
                    quoteFields['UF_CRM_1672641073'] = costos.valmet;
                }
                if (fechas.cierre && fechas.cierre !== '') {
                    quoteFields['CLOSEDATE'] = fechas.cierre;
                }

                await this.updateQuote(numQuote, quoteFields);
            }

            // 3. Actualizar productos de la quote
            await this.setQuoteProducts(resultQuoteId, productos);

            return {
                success: true,
                quoteId: resultQuoteId,
                message: crearQuote ? 'Quote creada exitosamente' : 'Quote actualizada exitosamente'
            };

        } catch (error) {
            console.error('Error al procesar cotización:', error);
            throw error;
        }
    }
}

export default Bitrix24Service;