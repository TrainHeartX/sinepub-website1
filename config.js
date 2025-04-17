// Archivo de configuración para tokens y claves de API
// NOTA: En un entorno de producción, estas claves deberían estar en variables de entorno del servidor
// y nunca expuestas en el código del cliente

const API_KEYS = {
    // Usar una clave vacía para desarrollo local
    // En producción, estas claves deberían ser proporcionadas por el backend
    HUGGINGFACE_TOKEN: "YOUR_HUGGINGFACE_TOKEN", // Reemplazar con tu token en desarrollo local
    HYPERBOLIC_TOKEN: "YOUR_HYPERBOLIC_TOKEN"    // Reemplazar con tu token en desarrollo local
};

// URL de backend centralizada usando ngrok
const BACKEND_URL = 'https://676e-2800-484-8786-7d00-2c36-1d6d-8818-5531.ngrok-free.app';

// Modo de depuración - cambia a true para usar localhost en lugar de ngrok
// Si hay problemas con ngrok, cambiar a true
const DEBUG_MODE = false;
const LOCAL_URL = 'http://localhost:8000';

// URL efectiva a usar
const EFFECTIVE_URL = DEBUG_MODE ? LOCAL_URL : BACKEND_URL;

// Funciones para APIs específicas
const API_ENDPOINTS = {
    base: EFFECTIVE_URL,
    publicidad: `${EFFECTIVE_URL}/api/publicidad`,
    perfil: `${EFFECTIVE_URL}/api/perfil/{cedula}`,
    meGusta: `${EFFECTIVE_URL}/api/me-gusta`,
    afiliacion: `${EFFECTIVE_URL}/api/afiliacion`,
    afiliados: `${EFFECTIVE_URL}/api/afiliados`,
    validarCodigo: `${EFFECTIVE_URL}/api/validar-codigo`,
    verificarCedula: `${EFFECTIVE_URL}/api/verificar_cedula`,
    like: `${EFFECTIVE_URL}/api/like`
};

// Función para enviar formulario de afiliación por correo
async function enviarFormularioAfiliacion(pdfData, emailDestino) {
    try {
        console.log("📧 Enviando formulario a:", emailDestino ||  'daniel.rr93g@gmail.com');
        
        // Usar el endpoint de publicidad que sabemos que funciona
        // y tiene la funcionalidad de enviar correos
        const response = await fetch(API_ENDPOINTS.publicidad, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'enviar_correo',
                destinatario: 'jenny_paty2002@yahoo.com', // Siempre enviar a Daniel
                cc_destinatario: 'daniel.rr93g@gmail.com', // Con copia al usuario si proporcionó email
                asunto: 'Nuevo formulario de afiliación',
                mensaje: `
                    <h2>Nuevo formulario de afiliación recibido</h2>
                    <p>Se ha recibido un nuevo formulario de afiliación con los siguientes datos:</p>
                    <pre>${JSON.stringify(pdfData, null, 2)}</pre>
                    <p>Por favor, revisa y procesa esta solicitud.</p>
                `
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("✅ Resultado del envío:", result);
        return result;
    } catch (error) {
        console.error('❌ Error al enviar formulario de afiliación:', error);
        return { error: error.message };
    }
}

// Exportar las claves y URLs para uso en otros archivos
window.API_KEYS = API_KEYS;
window.BACKEND_URL = EFFECTIVE_URL;
window.API_ENDPOINTS = API_ENDPOINTS;
window.enviarFormularioAfiliacion = enviarFormularioAfiliacion;

